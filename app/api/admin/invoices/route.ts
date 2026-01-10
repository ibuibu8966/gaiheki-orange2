import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requireAdminAuth } from '@/lib/utils/adminAuth';

// GET: 会社請求書一覧取得
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const { error } = await requireAdminAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const partnerIdParam = searchParams.get('partner_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // フィルタ条件
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (partnerIdParam) {
      where.partner_id = parseInt(partnerIdParam);
    }

    // 総件数を取得
    const total = await prisma.company_invoices.count({ where });

    // 請求書一覧を取得
    const invoices = await prisma.company_invoices.findMany({
      where,
      include: {
        partner: {
          include: {
            partner_details: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // レスポンス整形
    const formattedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      partner_id: invoice.partner_id,
      company_name: invoice.partner.partner_details?.company_name || invoice.partner.login_email,
      billing_period_start: invoice.billing_period_start.toISOString().split('T')[0],
      billing_period_end: invoice.billing_period_end.toISOString().split('T')[0],
      grand_total: invoice.grand_total,
      issue_date: invoice.issue_date.toISOString().split('T')[0],
      due_date: invoice.due_date.toISOString().split('T')[0],
      status: invoice.status,
      payment_date: invoice.payment_date
        ? invoice.payment_date.toISOString().split('T')[0]
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        invoices: formattedInvoices,
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Get company invoices error:', error);
    return NextResponse.json(
      { success: false, error: '請求書一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
