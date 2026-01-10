import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prefecture } from '@prisma/client';

// GET: 都道府県別加盟店一覧取得
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ prefecture: string }> }
) {
  try {
    const { prefecture } = await params;

    // 都道府県のバリデーション
    if (!prefecture || !Object.values(Prefecture).includes(prefecture as Prefecture)) {
      return NextResponse.json(
        { success: false, error: 'Invalid prefecture' },
        { status: 400 }
      );
    }

    // その都道府県に対応している加盟店を取得
    const partnerPrefectures = await prisma.partner_prefectures.findMany({
      where: {
        supported_prefecture: prefecture as Prefecture,
        partners: {
          is_active: true
        }
      },
      include: {
        partners: {
          include: {
            partner_details: true
          }
        }
      }
    });

    // 各パートナーのレビューをordersテーブルから取得
    const partnersWithRating = await Promise.all(
      partnerPrefectures.map(async (pp) => {
        const partner = pp.partners;

        // レビューがある完了案件を取得
        const orders = await prisma.orders.findMany({
          where: {
            order_status: 'COMPLETED',
            quotations: {
              partner_id: partner.id,
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
                        customer_rating: true
                      }
                    }
                  }
                }
              }
            }
          }
        });

        // 評価を集計
        const ratings = orders
          .map(order => order.quotations.diagnosis_requests.customers.customer_rating)
          .filter((r): r is number => r !== null);

        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;

        const reviewCount = ratings.length;

        return {
          id: partner.id,
          companyName: partner.partner_details?.company_name || '',
          address: partner.partner_details?.address || '',
          phoneNumber: partner.partner_details?.phone_number || '',
          appealText: partner.partner_details?.appeal_text || '',
          businessDescription: partner.partner_details?.business_description || '',
          websiteUrl: partner.partner_details?.website_url || null,
          averageRating: Math.round(averageRating * 10) / 10, // 小数点1桁
          reviewCount
        };
      })
    );

    // 評価順（高い順）にソート
    partnersWithRating.sort((a, b) => {
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      // 評価が同じ場合はレビュー数順
      return b.reviewCount - a.reviewCount;
    });

    return NextResponse.json({
      success: true,
      prefecture,
      data: partnersWithRating,
      count: partnersWithRating.length
    });

  } catch (error) {
    console.error('Area partners fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch partners',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
