import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/infrastructure/database/prisma.client';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../src/lib/session';
import { cookies } from 'next/headers';

// GET: 受注一覧を取得
export async function GET(request: NextRequest) {
  try {
    // セッションからpartnerIdを取得
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.isLoggedIn || !session.partnerId) {
      return NextResponse.json({
        success: false,
        error: 'ログインが必要です'
      }, { status: 401 });
    }

    const partnerId = session.partnerId;

    // URLパラメータからステータスフィルタを取得
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    // ステータス条件の構築
    const statusCondition: any = statusFilter ? { order_status: statusFilter } : {};

    // ログインしている加盟店が受注している案件を取得
    const orders = await prisma.orders.findMany({
      where: {
        ...statusCondition,
        quotations: {
          partner_id: partnerId,
          is_selected: true // 選択された見積もりのみ
        }
      },
      include: {
        quotations: {
          include: {
            diagnosis_requests: {
              include: {
                customers: {
                  select: {
                    id: true,
                    customer_name: true,
                    customer_phone: true,
                    customer_email: true,
                    construction_address: true
                  }
                }
              }
            }
          }
        },
        order_photos: {
          orderBy: {
            uploaded_at: 'desc'
          }
        }
      },
      orderBy: {
        order_date: 'desc'
      }
    });

    // レスポンスデータを整形
    const formattedData = orders.map(order => ({
      id: order.id,
      diagnosisId: order.quotations.diagnosis_requests.diagnosis_number,
      customerName: order.quotations.diagnosis_requests.customers.customer_name,
      customerPhone: order.quotations.diagnosis_requests.customers.customer_phone,
      customerEmail: order.quotations.diagnosis_requests.customers.customer_email,
      constructionAddress: order.quotations.diagnosis_requests.customers.construction_address,
      constructionAmount: order.construction_amount || order.quotations.quotation_amount, // 施工金額が設定されていなければ見積もり金額
      quotationAmount: order.quotations.quotation_amount, // 元の見積もり金額
      partnerMemo: order.partner_memo,
      constructionStartDate: order.construction_start_date,
      constructionEndDate: order.construction_end_date,
      orderStatus: order.order_status,
      orderDate: order.order_date,
      photos: order.order_photos.map(photo => ({
        id: photo.id,
        photoUrl: photo.photo_url,
        photoType: photo.photo_type,
        description: photo.description,
        uploadedAt: photo.uploaded_at
      })),
      customerId: order.quotations.diagnosis_requests.customers.id,
      quotationId: order.quotation_id
    }));

    return NextResponse.json({
      success: true,
      data: formattedData
    });

  } catch (error: any) {
    console.error('Orders fetch error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({
      success: false,
      error: '受注一覧の取得に失敗しました',
      details: error.message
    }, { status: 500 });
  }
}

// PATCH: 受注情報を更新
export async function PATCH(request: NextRequest) {
  try {
    // セッションからpartnerIdを取得
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.isLoggedIn || !session.partnerId) {
      return NextResponse.json({
        success: false,
        error: 'ログインが必要です'
      }, { status: 401 });
    }

    const partnerId = session.partnerId;
    const body = await request.json();
    const {
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      constructionAddress,
      constructionAmount,
      partnerMemo,
      constructionStartDate,
      constructionEndDate,
      orderStatus
    } = body;

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: '受注IDは必須です'
      }, { status: 400 });
    }

    // 受注の存在確認と権限チェック
    const existingOrder = await prisma.orders.findFirst({
      where: {
        id: orderId,
        quotations: {
          partner_id: partnerId
        }
      },
      include: {
        quotations: {
          include: {
            diagnosis_requests: {
              include: {
                customers: true
              }
            }
          }
        }
      }
    });

    if (!existingOrder) {
      return NextResponse.json({
        success: false,
        error: '受注が見つかりません'
      }, { status: 404 });
    }

    // トランザクションで更新
    const result = await prisma.$transaction(async (tx) => {
      // 顧客情報を更新
      if (customerName || customerPhone || customerEmail || constructionAddress) {
        await tx.customers.update({
          where: { id: existingOrder.quotations.diagnosis_requests.customers.id },
          data: {
            ...(customerName && { customer_name: customerName }),
            ...(customerPhone && { customer_phone: customerPhone }),
            ...(customerEmail && { customer_email: customerEmail }),
            ...(constructionAddress && { construction_address: constructionAddress }),
            updated_at: new Date()
          }
        });
      }

      // 受注情報を更新
      const updatedOrder = await tx.orders.update({
        where: { id: orderId },
        data: {
          ...(constructionAmount && { construction_amount: parseInt(constructionAmount) }),
          ...(partnerMemo !== undefined && { partner_memo: partnerMemo }),
          ...(constructionStartDate && { construction_start_date: new Date(constructionStartDate) }),
          ...(constructionEndDate && { construction_end_date: new Date(constructionEndDate) }),
          ...(orderStatus && { order_status: orderStatus }),
          ...(orderStatus === 'COMPLETED' && { completion_date: new Date() }),
          updated_at: new Date()
        }
      });

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      message: '受注情報を更新しました',
      data: result
    });

  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json({
      success: false,
      error: '受注情報の更新に失敗しました'
    }, { status: 500 });
  }
}
