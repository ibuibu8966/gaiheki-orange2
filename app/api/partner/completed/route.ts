import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/infrastructure/database/prisma.client';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../src/lib/session';
import { cookies } from 'next/headers';

// GET: 完了案件一覧を取得
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
    const statusFilter = searchParams.get('status'); // 'completed' or 'evaluated'

    // ログインしている加盟店の完了案件を取得
    const orders = await prisma.orders.findMany({
      where: {
        order_status: 'COMPLETED', // 施工完了のみ
        quotations: {
          partner_id: partnerId,
          is_selected: true
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
                    construction_address: true,
                    customer_rating: true,
                    customer_review_title: true,
                    customer_review: true,
                    customer_review_date: true
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
        completion_date: 'desc' // 完了日の降順
      }
    });

    // レスポンスデータを整形
    let formattedData = orders.map(order => {
      const hasEvaluation = order.quotations.diagnosis_requests.customers.customer_rating !== null &&
                           order.quotations.diagnosis_requests.customers.customer_review_date !== null;

      return {
        id: order.id,
        diagnosisId: order.quotations.diagnosis_requests.diagnosis_number,
        customerName: order.quotations.diagnosis_requests.customers.customer_name,
        customerPhone: order.quotations.diagnosis_requests.customers.customer_phone,
        customerEmail: order.quotations.diagnosis_requests.customers.customer_email,
        constructionAddress: order.quotations.diagnosis_requests.customers.construction_address,
        constructionAmount: order.construction_amount || order.quotations.quotation_amount,
        quotationAmount: order.quotations.quotation_amount,
        partnerMemo: order.partner_memo,
        constructionStartDate: order.construction_start_date,
        constructionEndDate: order.construction_end_date,
        orderStatus: order.order_status,
        completionDate: order.completion_date, // 完了日
        completionStatus: hasEvaluation ? 'EVALUATED' : 'COMPLETED', // 評価完了 or 施工完了
        hasEvaluation: hasEvaluation,
        photos: order.order_photos.map(photo => ({
          id: photo.id,
          photoUrl: photo.photo_url,
          photoType: photo.photo_type,
          description: photo.description,
          uploadedAt: photo.uploaded_at
        })),
        customerId: order.quotations.diagnosis_requests.customers.id,
        quotationId: order.quotation_id
      };
    });

    // ステータスフィルタを適用
    if (statusFilter === 'completed') {
      formattedData = formattedData.filter(order => !order.hasEvaluation);
    } else if (statusFilter === 'evaluated') {
      formattedData = formattedData.filter(order => order.hasEvaluation);
    }

    return NextResponse.json({
      success: true,
      data: formattedData
    });

  } catch (error: any) {
    console.error('Completed orders fetch error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({
      success: false,
      error: '完了案件一覧の取得に失敗しました',
      details: error.message
    }, { status: 500 });
  }
}

// PATCH: 完了案件情報を更新（ステータス変更は不可）
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
      constructionEndDate
      // orderStatus は受け取らない（変更不可）
    } = body;

    if (!orderId) {
      return NextResponse.json({
        success: false,
        error: '受注IDは必須です'
      }, { status: 400 });
    }

    // 完了案件の存在確認と権限チェック
    const existingOrder = await prisma.orders.findFirst({
      where: {
        id: orderId,
        order_status: 'COMPLETED', // 完了案件のみ
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
        error: '完了案件が見つかりません'
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

      // 受注情報を更新（ステータスは変更しない）
      const updatedOrder = await tx.orders.update({
        where: { id: orderId },
        data: {
          ...(constructionAmount && { construction_amount: parseInt(constructionAmount) }),
          ...(partnerMemo !== undefined && { partner_memo: partnerMemo }),
          ...(constructionStartDate && { construction_start_date: new Date(constructionStartDate) }),
          ...(constructionEndDate && { construction_end_date: new Date(constructionEndDate) }),
          updated_at: new Date()
          // order_status は更新しない
        }
      });

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      message: '完了案件情報を更新しました',
      data: result
    });

  } catch (error: any) {
    console.error('Completed order update error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({
      success: false,
      error: '完了案件情報の更新に失敗しました',
      details: error.message
    }, { status: 500 });
  }
}
