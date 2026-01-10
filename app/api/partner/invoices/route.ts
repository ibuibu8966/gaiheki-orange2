import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requirePartnerAuth } from '@/lib/utils/partnerAuth';
import { generateCustomerInvoiceNumber, calculateTax } from '@/lib/utils/invoiceNumber';

// GET: 請求書一覧取得
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const { error, partnerId } = await requirePartnerAuth();
    if (error) return error;

    // クエリパラメータ取得
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 検索条件
    const where: any = {
      order: {
        quotations: {
          partner_id: partnerId,
        },
      },
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      // 顧客名や案件名で検索
      where.OR = [
        {
          order: {
            quotations: {
              diagnosis_requests: {
                customers: {
                  customer_name: {
                    contains: search,
                  },
                },
              },
            },
          },
        },
      ];
    }

    // 総件数取得
    const total = await prisma.customer_invoices.count({ where });

    // ページネーション
    const skip = (page - 1) * limit;

    // 請求書一覧取得
    const invoices = await prisma.customer_invoices.findMany({
      where,
      include: {
        order: {
          include: {
            quotations: {
              include: {
                diagnosis_requests: {
                  include: {
                    customers: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      skip,
      take: limit,
    });

    // レスポンス整形
    const formattedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      order_id: invoice.order_id,
      issue_date: invoice.issue_date.toISOString().split('T')[0],
      due_date: invoice.due_date.toISOString().split('T')[0],
      total_amount: invoice.total_amount,
      tax_amount: invoice.tax_amount,
      grand_total: invoice.grand_total,
      status: invoice.status,
      payment_date: invoice.payment_date ? invoice.payment_date.toISOString().split('T')[0] : null,
      order: {
        quotations: {
          diagnosis_requests: {
            customers: {
              customer_name: invoice.order?.quotations?.diagnosis_requests?.customers?.customer_name || '不明',
            },
          },
        },
      },
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
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { success: false, error: '請求書一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// POST: 請求書作成
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const { error, partnerId } = await requirePartnerAuth();
    if (error) return error;

    const body = await request.json();
    const { order_id, issue_date, due_date, items } = body;

    // バリデーション
    if (!order_id || !issue_date || !due_date || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    // 受注が自分のものか確認
    const order = await prisma.orders.findFirst({
      where: {
        id: order_id,
        quotations: {
          partner_id: partnerId,
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: '受注が見つかりません' },
        { status: 404 }
      );
    }

    // 既に請求書が存在するか確認
    const existingInvoice = await prisma.customer_invoices.findFirst({
      where: { order_id },
    });

    if (existingInvoice) {
      return NextResponse.json(
        { success: false, error: 'この受注には既に請求書が存在します' },
        { status: 400 }
      );
    }

    // 請求書番号を採番
    const invoiceNumber = await generateCustomerInvoiceNumber();

    // 合計金額を計算
    const totalAmount = items.reduce((sum: number, item: any) => sum + item.amount, 0);
    const taxAmount = calculateTax(totalAmount);
    const grandTotal = totalAmount + taxAmount;

    // トランザクションで請求書と明細を作成
    const invoice = await prisma.customer_invoices.create({
      data: {
        invoice_number: invoiceNumber,
        order_id,
        issue_date: new Date(issue_date),
        due_date: new Date(due_date),
        total_amount: totalAmount,
        tax_amount: taxAmount,
        grand_total: grandTotal,
        status: 'DRAFT',
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

    return NextResponse.json({
      success: true,
      message: '請求書を作成しました',
      data: invoice,
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { success: false, error: '請求書の作成に失敗しました' },
      { status: 500 }
    );
  }
}
