import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requireAdminAuth } from '@/lib/utils/adminAuth';

// GET: 請求書詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdminAuth();
    if (error) return error;

    const { id } = await params;
    const invoiceId = parseInt(id);

    const invoice = await prisma.company_invoices.findUnique({
      where: { id: invoiceId },
      include: {
        invoice_items: true,
        partner: {
          include: {
            partner_details: true,
          },
        },
      },
    });

    // 会社設定情報を取得（テーブルが存在しない場合はnull）
    let companySettings = null;
    try {
      companySettings = await prisma.company_settings.findFirst();
    } catch (error) {
      console.warn('company_settingsテーブルが存在しません:', error);
    }

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        partner_id: invoice.partner_id,
        billing_period_start: invoice.billing_period_start.toISOString().split('T')[0],
        billing_period_end: invoice.billing_period_end.toISOString().split('T')[0],
        issue_date: invoice.issue_date.toISOString().split('T')[0],
        due_date: invoice.due_date.toISOString().split('T')[0],
        total_amount: Number(invoice.total_amount),
        tax_amount: Number(invoice.tax_amount),
        grand_total: Number(invoice.grand_total),
        status: invoice.status,
        payment_date: invoice.payment_date?.toISOString().split('T')[0] || null,
        items: invoice.invoice_items,
        partner: {
          id: invoice.partner.id,
          company_name: invoice.partner.partner_details?.company_name || '',
          email: invoice.partner.login_email,
          phone: invoice.partner.partner_details?.phone_number || '',
          address: invoice.partner.partner_details?.address || '',
        },
        company_settings: companySettings ? {
          company_name: companySettings.company_name,
          postal_code: companySettings.postal_code,
          address: companySettings.address,
          phone: companySettings.phone,
          email: companySettings.email,
          invoice_registration_number: companySettings.invoice_registration_number,
          bank_name: companySettings.bank_name,
          bank_branch_name: companySettings.bank_branch_name,
          bank_account_type: companySettings.bank_account_type,
          bank_account_number: companySettings.bank_account_number,
          bank_account_holder: companySettings.bank_account_holder,
        } : null,
      },
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { success: false, error: '請求書の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT: 請求書更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdminAuth();
    if (error) return error;

    const { id } = await params;
    const invoiceId = parseInt(id);
    const body = await request.json();
    const { issue_date, due_date, items } = body;

    const existingInvoice = await prisma.company_invoices.findUnique({
      where: { id: invoiceId },
    });

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      );
    }

    if (existingInvoice.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: '下書き状態の請求書のみ編集できます' },
        { status: 400 }
      );
    }

    // itemsのバリデーション
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: '請求項目が不正です' },
        { status: 400 }
      );
    }

    // amountを数値に変換（空の項目は除外）
    const parsedItems = items
      .filter((item: any) => item && (item.description || item.amount))
      .map((item: any) => ({
      description: item.description || '',
      amount: typeof item.amount === 'string' ? parseInt(item.amount) || 0 : (item.amount || 0),
      related_order_id: item.related_order_id || null,
    }));

    const totalAmount = parsedItems.reduce((sum: number, item: any) => sum + item.amount, 0);
    const taxAmount = Math.floor(totalAmount * 0.1);
    const grandTotal = totalAmount + taxAmount;

    await prisma.$transaction(async (tx) => {
      await tx.company_invoice_items.deleteMany({
        where: { invoice_id: invoiceId },
      });

      await tx.company_invoices.update({
        where: { id: invoiceId },
        data: {
          issue_date: new Date(issue_date),
          due_date: new Date(due_date),
          total_amount: totalAmount,
          tax_amount: taxAmount,
          grand_total: grandTotal,
          invoice_items: {
            create: parsedItems,
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: '請求書を更新しました',
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    return NextResponse.json(
      { success: false, error: '請求書の更新に失敗しました' },
      { status: 500 }
    );
  }
}
