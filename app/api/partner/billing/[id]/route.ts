import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requirePartnerAuth } from '@/lib/utils/partnerAuth';

// GET: 運営からの請求書詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const { error, partnerId } = await requirePartnerAuth();
    if (error) return error;

    const { id } = await params;
    const invoiceId = parseInt(id);

    if (isNaN(invoiceId)) {
      return NextResponse.json(
        { success: false, error: '無効な請求書IDです' },
        { status: 400 }
      );
    }

    // 請求書取得
    const invoice = await prisma.company_invoices.findFirst({
      where: {
        id: invoiceId,
        partner_id: partnerId,
      },
      include: {
        invoice_items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      );
    }

    // レスポンス整形
    const formattedInvoice = {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      issue_date: invoice.issue_date.toISOString().split('T')[0],
      due_date: invoice.due_date.toISOString().split('T')[0],
      billing_period_start: invoice.billing_period_start.toISOString().split('T')[0],
      billing_period_end: invoice.billing_period_end.toISOString().split('T')[0],
      total_amount: invoice.total_amount,
      tax_amount: invoice.tax_amount,
      grand_total: invoice.grand_total,
      status: invoice.status,
      payment_date: invoice.payment_date ? invoice.payment_date.toISOString().split('T')[0] : null,
      items: invoice.invoice_items.map((item) => ({
        id: item.id,
        description: item.description,
        amount: item.amount,
      })),
    };

    return NextResponse.json({
      success: true,
      data: formattedInvoice,
    });
  } catch (error) {
    console.error('Partner billing detail fetch error:', error);
    return NextResponse.json(
      { success: false, error: '請求書の取得に失敗しました' },
      { status: 500 }
    );
  }
}
