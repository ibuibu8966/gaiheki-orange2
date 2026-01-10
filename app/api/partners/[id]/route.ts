import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 加盟店詳細取得
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const partnerId = parseInt(id);

    if (isNaN(partnerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    // 加盟店情報を取得
    const partner = await prisma.partners.findUnique({
      where: { id: partnerId },
      include: {
        partner_details: true,
        partner_prefectures: {
          select: {
            supported_prefecture: true
          }
        }
      }
    });

    if (!partner || !partner.partner_details) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    // レビューがある完了案件を取得（partner/reviewsと同じロジック）
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

    // レビューをフォーマット
    const reviews = orders.map(order => {
      const customer = order.quotations.diagnosis_requests.customers;
      return {
        customerName: customer.customer_name,
        rating: customer.customer_rating,
        reviewTitle: customer.customer_review_title,
        review: customer.customer_review,
        reviewDate: customer.customer_review_date?.toISOString().split('T')[0],
        constructionType: customer.customer_construction_type,
        constructionAmount: order.construction_amount || order.quotations.quotation_amount
      };
    });

    // 評価を集計
    const ratings = reviews
      .map(r => r.rating)
      .filter((r): r is number => r !== null);

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    const reviewCount = ratings.length;

    // 対応エリアを取得
    const supportedPrefectures = partner.partner_prefectures.map(
      pp => pp.supported_prefecture
    );

    const partnerData = {
      id: partner.id,
      companyName: partner.partner_details.company_name,
      address: partner.partner_details.address,
      phoneNumber: partner.partner_details.phone_number,
      faxNumber: partner.partner_details.fax_number,
      websiteUrl: partner.partner_details.website_url,
      representativeName: partner.partner_details.representative_name,
      businessDescription: partner.partner_details.business_description,
      appealText: partner.partner_details.appeal_text,
      businessHours: partner.partner_details.business_hours,
      closedDays: partner.partner_details.closed_days,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount,
      supportedPrefectures,
      reviews
    };

    return NextResponse.json({
      success: true,
      data: partnerData
    });

  } catch (error) {
    console.error('Partner fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch partner',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
