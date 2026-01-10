import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requirePartnerAuth } from '@/lib/utils/partnerAuth';
import { calculateTax } from '@/lib/utils/invoiceNumber';

// GET: 請求書詳細取得
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

    // 請求書取得
    const invoice = await prisma.customer_invoices.findFirst({
      where: {
        id: invoiceId,
        order: {
          quotations: {
            partner_id: partnerId,
          },
        },
      },
      include: {
        invoice_items: true,
        order: {
          include: {
            quotations: {
              include: {
                diagnosis_requests: {
                  include: {
                    customers: true,
                  },
                },
                partners: {
                  include: {
                    partner_details: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      );
    }

    const customer = invoice.order.quotations.diagnosis_requests.customers;
    const partner = invoice.order.quotations.partners;

    // レスポンス整形
    const formattedInvoice = {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      order_id: invoice.order_id,
      customer: {
        name: customer.customer_name,
        email: customer.customer_email,
        phone: customer.customer_phone,
        address: customer.construction_address,
      },
      issue_date: invoice.issue_date.toISOString().split('T')[0],
      due_date: invoice.due_date.toISOString().split('T')[0],
      items: invoice.invoice_items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        amount: item.amount,
      })),
      total_amount: invoice.total_amount,
      tax_amount: invoice.tax_amount,
      grand_total: invoice.grand_total,
      status: invoice.status,
      payment_date: invoice.payment_date
        ? invoice.payment_date.toISOString().split('T')[0]
        : null,
      partner_details: partner.partner_details
        ? {
            company_name: partner.partner_details.company_name,
            address: partner.partner_details.address,
            phone_number: partner.partner_details.phone_number,
          }
        : undefined,
    };

    return NextResponse.json({
      success: true,
      data: formattedInvoice,
    });
  } catch (error) {
    console.error('Get invoice detail error:', error);
    return NextResponse.json(
      { success: false, error: '請求書詳細の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// PUT: 請求書更新（下書きのみ）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const { error, partnerId } = await requirePartnerAuth();
    if (error) return error;

    const { id } = await params;
    const invoiceId = parseInt(id);
    const body = await request.json();
    const { issue_date, due_date, items } = body;

    // バリデーション
    if (!issue_date || !due_date || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    // 請求書取得
    const invoice = await prisma.customer_invoices.findFirst({
      where: {
        id: invoiceId,
        order: {
          quotations: {
            partner_id: partnerId,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      );
    }

    // 下書き以外は編集不可
    if (invoice.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: '下書き状態の請求書のみ編集できます' },
        { status: 400 }
      );
    }

    // 合計金額を計算
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.amount, 0);
    const taxAmount = calculateTax(totalAmount);
    const grandTotal = totalAmount + taxAmount;

    // トランザクションで更新
    const updatedInvoice = await prisma.$transaction(async (tx) => {
      // 既存の明細を削除
      await tx.customer_invoice_items.deleteMany({
        where: { invoice_id: invoiceId },
      });

      // 請求書と明細を更新
      return tx.customer_invoices.update({
        where: { id: invoiceId },
        data: {
          issue_date: new Date(issue_date),
          due_date: new Date(due_date),
          total_amount: totalAmount,
          tax_amount: taxAmount,
          grand_total: grandTotal,
          invoice_items: {
            create: items.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unit_price: item.unit_price,
              amount: item.amount,
            })),
          },
        },
        include: {
          invoice_items: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: '請求書を更新しました',
      data: updatedInvoice,
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    return NextResponse.json(
      { success: false, error: '請求書の更新に失敗しました' },
      { status: 500 }
    );
  }
}
