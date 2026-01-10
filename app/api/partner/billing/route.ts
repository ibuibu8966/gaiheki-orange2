import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requirePartnerAuth } from '@/lib/utils/partnerAuth';

// GET: 運営からの請求書一覧取得
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const { error, partnerId } = await requirePartnerAuth();
    if (error) return error;

    // クエリパラメータ取得
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 検索条件
    const where: any = {
      partner_id: partnerId,
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    // 総件数取得
    const total = await prisma.company_invoices.count({ where });

    // 請求書一覧取得
    const invoices = await prisma.company_invoices.findMany({
      where,
      include: {
        invoice_items: true,
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // レスポンス整形
    const formattedInvoices = invoices.map((invoice) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: {
        invoices: formattedInvoices,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Partner billing fetch error:', error);
    return NextResponse.json(
      { success: false, error: '請求書の取得に失敗しました' },
      { status: 500 }
    );
  }
}
