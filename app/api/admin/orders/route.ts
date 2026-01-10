import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 受注一覧取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};

    // ステータスフィルター
    if (status && status !== 'all') {
      where.order_status = status;
    }

    const orders = await prisma.orders.findMany({
      where,
      include: {
        quotations: {
          include: {
            diagnosis_requests: {
              include: {
                customers: {
                  select: {
                    customer_name: true,
                    customer_email: true,
                    customer_phone: true,
                    construction_address: true
                  }
                }
              }
            },
            partners: {
              include: {
                partner_details: {
                  select: {
                    company_name: true,
                    phone_number: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // 検索フィルタリング（メモリ上で実行）
    let filteredOrders = orders;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredOrders = orders.filter(order => {
        const customerName = order.quotations.diagnosis_requests.customers.customer_name.toLowerCase();
        const partnerName = order.quotations.partners.partner_details?.company_name?.toLowerCase() || '';
        return customerName.includes(searchLower) || partnerName.includes(searchLower);
      });
    }

    const formattedOrders = filteredOrders.map(order => ({
      id: order.id,
      quotationId: order.quotation_id,
      diagnosisId: order.quotations.diagnosis_requests.diagnosis_number,
      customerId: order.quotations.diagnosis_requests.customer_id,
      customerName: order.quotations.diagnosis_requests.customers.customer_name,
      customerPhone: order.quotations.diagnosis_requests.customers.customer_phone,
      customerEmail: order.quotations.diagnosis_requests.customers.customer_email,
      address: order.quotations.diagnosis_requests.customers.construction_address,
      partnerId: order.quotations.partner_id,
      partnerName: order.quotations.partners.partner_details?.company_name || '未設定',
      partnerPhone: order.quotations.partners.partner_details?.phone_number,
      quotationAmount: order.quotations.quotation_amount,
      constructionStartDate: order.construction_start_date?.toISOString().split('T')[0],
      constructionEndDate: order.construction_end_date?.toISOString().split('T')[0],
      status: order.order_status,
      statusLabel: getStatusLabel(order.order_status),
      partnerMemo: order.partner_memo,
      adminMemo: order.admin_memo,
      orderDate: order.order_date.toISOString().split('T')[0],
      completionDate: order.completion_date?.toISOString().split('T')[0],
      evaluationToken: order.evaluation_token,
      evaluationTokenSentAt: order.evaluation_token_sent_at?.toISOString(),
      constructionType: order.quotations.diagnosis_requests.construction_type,
      prefecture: order.quotations.diagnosis_requests.prefecture
    }));

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      count: formattedOrders.length
    });

  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ORDERED: '受注',
    IN_PROGRESS: '施工中',
    COMPLETED: '施工完了',
    REVIEW_COMPLETED: '評価完了',
    CANCELLED: 'キャンセル'
  };
  return labels[status] || status;
}
