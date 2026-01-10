import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requireAdminAuth } from '@/lib/utils/adminAuth';
import {
  generateCompanyInvoiceNumber,
  calculateFees,
  calculateTax,
  calculateDueDate,
} from '@/lib/utils/invoiceNumber';

// POST: 月次手数料請求書を一括生成
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const { error } = await requireAdminAuth();
    if (error) return error;

    const body = await request.json();
    const { year, month, mode } = body;

    let startDate: Date;
    let endDate: Date;

    if (mode === 'monthly') {
      // 月別生成モード
      if (!year || !month) {
        return NextResponse.json(
          { success: false, error: '年と月が必要です' },
          { status: 400 }
        );
      }
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59); // 月末
    } else if (mode === 'unbilled') {
      // 未請求分生成モード
      startDate = new Date(2000, 0, 1); // 適当な過去の日付
      endDate = new Date(); // 現在まで
    } else {
      return NextResponse.json(
        { success: false, error: 'モードは "monthly" または "unbilled" を指定してください' },
        { status: 400 }
      );
    }

    // システム設定を取得
    const systemSettings = await prisma.system_settings.findFirst();
    const taxRate = systemSettings?.tax_rate || 0.1;
    const paymentDay = systemSettings?.billing_cycle_payment_day || 20;

    // 全加盟店を取得
    const partners = await prisma.partners.findMany({
      include: {
        fee_plans: true,
        partner_details: true,
      },
    });

    const generatedInvoices = [];

    // 各加盟店の請求書を生成
    for (const partner of partners) {
      // 対象期間の見積もりを取得
      const quotations = await prisma.quotations.findMany({
        where: {
          partner_id: partner.id,
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          orders: {
            include: {
              customer_invoices: true,
            },
          },
        },
      });

      // モードが未請求分の場合、既に請求済みの案件を除外
      let validQuotations = quotations;
      if (mode === 'unbilled') {
        const billedOrderIds = await prisma.company_invoice_items.findMany({
          where: {
            related_order_id: {
              not: null,
            },
          },
          select: {
            related_order_id: true,
          },
        });

        const billedSet = new Set(billedOrderIds.map(item => item.related_order_id));
        validQuotations = quotations.filter(q =>
          q.orders && !billedSet.has(q.orders.id)
        );
      }

      // 受注件数（ordersは1対1なので、存在するかどうかだけをチェック）
      const orderCount = validQuotations.filter((q) => q.orders !== null).length;

      // 施工完了件数と金額
      const completedOrders = validQuotations
        .filter((q) => q.orders && (q.orders.construction_status === 'COMPLETED' || q.orders.review_status === 'REVIEW_COMPLETED'))
        .map((q) => q.orders!);
      const projectCount = completedOrders.length;
      const projectTotalAmount = completedOrders.reduce(
        (sum, order) => sum + (order.customer_invoices?.grand_total || 0),
        0
      );

      // 手数料計算
      if (!partner.fee_plans) {
        console.warn(`Partner ${partner.id} has no fee plan, skipping`);
        continue;
      }

      const feeData = calculateFees(partner.fee_plans, {
        order_count: orderCount,
        project_count: projectCount,
        project_total_amount: projectTotalAmount,
      });

      // 手数料が0円の場合はスキップ
      if (feeData.total === 0) {
        continue;
      }

      // 消費税計算
      const taxAmount = calculateTax(feeData.total, taxRate);
      const grandTotal = feeData.total + taxAmount;

      // 請求書番号を生成（月末の日付を基準にする）
      const invoiceNumber = await generateCompanyInvoiceNumber(endDate);

      // トランザクションで請求書と明細を作成
      const invoice = await prisma.$transaction(async (tx) => {
        const createdInvoice = await tx.company_invoices.create({
          data: {
            invoice_number: invoiceNumber,
            partner_id: partner.id,
            billing_period_start: startDate,
            billing_period_end: endDate,
            issue_date: new Date(), // 生成時は現在日時
            due_date: calculateDueDate(new Date(), paymentDay),
            total_amount: feeData.total,
            tax_amount: taxAmount,
            grand_total: grandTotal,
            status: 'DRAFT',
            invoice_items: {
              create: feeData.items.map((item) => ({
                description: item.description,
                amount: item.amount,
                related_order_id: item.related_order_id,
              })),
            },
          },
          include: {
            invoice_items: true,
          },
        });

        return createdInvoice;
      });

      generatedInvoices.push({
        partner_id: partner.id,
        company_name: partner.partner_details?.company_name || partner.email,
        total_amount: feeData.total,
        tax_amount: taxAmount,
        grand_total: grandTotal,
        items: feeData.items,
      });
    }

    return NextResponse.json({
      success: true,
      message: `${generatedInvoices.length}件の請求書を生成しました`,
      data: {
        generated: generatedInvoices.length,
        invoices: generatedInvoices,
      },
    });
  } catch (error) {
    console.error('Generate company invoices error:', error);
    return NextResponse.json(
      { success: false, error: '請求書の生成に失敗しました' },
      { status: 500 }
    );
  }
}
