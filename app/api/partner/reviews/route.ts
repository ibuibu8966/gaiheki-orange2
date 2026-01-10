import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/infrastructure/database/prisma.client';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '../../../../src/lib/session';
import { cookies } from 'next/headers';

// GET: レビュー一覧を取得
export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.isLoggedIn || !session.partnerId) {
      return NextResponse.json({
        success: false,
        error: 'ログインが必要です'
      }, { status: 401 });
    }

    const partnerId = session.partnerId;
    const { searchParams } = new URL(request.url);
    const ratingFilter = searchParams.get('rating'); // '1', '2', '3', '4', '5'
    const searchQuery = searchParams.get('search'); // 検索クエリ

    // レビューがある完了案件を取得
    const orders = await prisma.orders.findMany({
      where: {
        order_status: 'COMPLETED',
        quotations: {
          partner_id: partnerId,
          is_selected: true,
          diagnosis_requests: {
            customers: {
              customer_rating: {
                not: null
              }
            }
          }
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
                    customer_construction_type: true,
                    customer_rating: true,
                    customer_review_title: true,
                    customer_review: true,
                    customer_review_date: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        completion_date: 'desc'
      }
    });

    // レスポンスデータを整形
    let formattedData = orders.map(order => {
      const customer = order.quotations.diagnosis_requests.customers;

      return {
        id: order.id,
        customerName: customer.customer_name,
        rating: customer.customer_rating,
        reviewTitle: customer.customer_review_title,
        reviewComment: customer.customer_review,
        constructionType: customer.customer_construction_type,
        contractAmount: order.construction_amount || order.quotations.quotation_amount,
        completionDate: order.completion_date,
        reviewDate: customer.customer_review_date
      };
    });

    // 評価フィルタを適用
    if (ratingFilter) {
      const rating = parseInt(ratingFilter);
      formattedData = formattedData.filter(review => review.rating === rating);
    }

    // 検索フィルタを適用（顧客名、コメント、工事内容で部分一致）
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      formattedData = formattedData.filter(review => {
        const customerNameMatch = review.customerName?.toLowerCase().includes(query);
        const commentMatch = review.reviewComment?.toLowerCase().includes(query);
        const constructionTypeMatch = review.constructionType?.toLowerCase().includes(query);

        return customerNameMatch || commentMatch || constructionTypeMatch;
      });
    }

    // レビュー日の降順でソート
    formattedData.sort((a, b) => {
      const dateA = a.reviewDate ? new Date(a.reviewDate).getTime() : 0;
      const dateB = b.reviewDate ? new Date(b.reviewDate).getTime() : 0;
      return dateB - dateA;
    });

    // 総合評価を計算（小数点第1位まで）
    const averageRating = formattedData.length > 0
      ? (formattedData.reduce((sum, review) => sum + (review.rating || 0), 0) / formattedData.length).toFixed(1)
      : '0.0';

    return NextResponse.json({
      success: true,
      data: formattedData,
      averageRating: parseFloat(averageRating),
      totalCount: formattedData.length
    });
  } catch (error: any) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json({
      success: false,
      error: 'レビュー一覧の取得に失敗しました',
      details: error.message
    }, { status: 500 });
  }
}
