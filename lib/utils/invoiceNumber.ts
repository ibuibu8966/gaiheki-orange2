import { prisma } from '@/src/infrastructure/database/prisma.client';

/**
 * 顧客請求書番号を自動採番
 * 形式: INV-YYYY-0001
 * 年ごとにリセット
 */
export async function generateCustomerInvoiceNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;

  // 当年の最新請求書を取得
  const latestInvoice = await prisma.customer_invoices.findFirst({
    where: {
      invoice_number: {
        startsWith: prefix,
      },
    },
    orderBy: {
      invoice_number: 'desc',
    },
  });

  if (!latestInvoice) {
    // 当年最初の請求書
    return `${prefix}0001`;
  }

  // 最新の番号から連番を取得して+1
  const lastNumber = parseInt(latestInvoice.invoice_number.split('-')[2]);
  const nextNumber = lastNumber + 1;

  // 4桁でゼロ埋め
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * 会社請求書番号を自動採番
 * 形式: COMP-YYYYMM-0001
 * 月ごとにリセット
 */
export async function generateCompanyInvoiceNumber(targetDate?: Date): Promise<string> {
  const date = targetDate || new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const prefix = `COMP-${year}${month}-`;

  // 当月の最新請求書を取得
  const latestInvoice = await prisma.company_invoices.findFirst({
    where: {
      invoice_number: {
        startsWith: prefix,
      },
    },
    orderBy: {
      invoice_number: 'desc',
    },
  });

  if (!latestInvoice) {
    // 当月最初の請求書
    return `${prefix}0001`;
  }

  // 最新の番号から連番を取得して+1
  const lastNumber = parseInt(latestInvoice.invoice_number.split('-')[2]);
  const nextNumber = lastNumber + 1;

  // 4桁でゼロ埋め
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * 消費税を計算
 * @param amount 税抜金額
 * @param taxRate 税率（デフォルト: 0.1 = 10%）
 * @returns 消費税額（切り捨て）
 */
export function calculateTax(amount: number, taxRate: number = 0.1): number {
  return Math.floor(amount * taxRate);
}

/**
 * 料金プランと実績データから手数料を計算
 */
export interface FeePlan {
  monthly_fee: number | null;
  per_order_fee: number | null;
  per_project_fee: number | null;
  project_fee_rate: number | null;
}

export interface ActivityData {
  order_count: number;
  project_count: number;
  project_total_amount: number;
}

export interface FeeItem {
  description: string;
  amount: number;
  related_order_id?: number | null;
}

export function calculateFees(plan: FeePlan, activity: ActivityData): { items: FeeItem[]; total: number } {
  const items: FeeItem[] = [];
  let total = 0;

  // 月額固定
  if (plan.monthly_fee && plan.monthly_fee > 0) {
    items.push({
      description: '月額利用料',
      amount: plan.monthly_fee,
      related_order_id: null,
    });
    total += plan.monthly_fee;
  }

  // 受注ごと
  if (plan.per_order_fee && plan.per_order_fee > 0 && activity.order_count > 0) {
    const orderFee = plan.per_order_fee * activity.order_count;
    items.push({
      description: `受注手数料 (${activity.order_count}件)`,
      amount: orderFee,
      related_order_id: null,
    });
    total += orderFee;
  }

  // 施工完了ごと（固定額）
  if (plan.per_project_fee && plan.per_project_fee > 0 && activity.project_count > 0) {
    const projectFee = plan.per_project_fee * activity.project_count;
    items.push({
      description: `施工完了手数料 (${activity.project_count}件)`,
      amount: projectFee,
      related_order_id: null,
    });
    total += projectFee;
  }

  // 施工完了ごと（料率）
  if (plan.project_fee_rate && plan.project_fee_rate > 0 && activity.project_count > 0) {
    const rateFee = Math.floor(activity.project_total_amount * plan.project_fee_rate);
    items.push({
      description: `施工完了手数料 (${activity.project_count}件, ${(plan.project_fee_rate * 100).toFixed(1)}%)`,
      amount: rateFee,
      related_order_id: null,
    });
    total += rateFee;
  }

  return { items, total };
}

/**
 * 支払期日を計算
 * @param issueDate 発行日
 * @param paymentDay 支払日（1-31）
 * @returns 支払期日（発行日の翌月の指定日）
 */
export function calculateDueDate(issueDate: Date, paymentDay: number): Date {
  const dueDate = new Date(issueDate);
  dueDate.setMonth(dueDate.getMonth() + 1);
  dueDate.setDate(paymentDay);
  return dueDate;
}
