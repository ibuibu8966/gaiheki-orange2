import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 加盟店詳細取得
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const partnerId = parseInt(id);

    const partner = await prisma.partners.findUnique({
      where: { id: partnerId },
      include: {
        partner_details: true,
        partner_prefectures: true,
        customers: {
          select: {
            id: true,
            customer_name: true,
            customer_rating: true,
            customer_review: true,
            customer_review_title: true
          }
        },
        quotations: {
          select: {
            id: true,
            quotation_amount: true,
            is_selected: true
          }
        }
      }
    });

    if (!partner) {
      return NextResponse.json(
        { success: false, error: '加盟店が見つかりません' },
        { status: 404 }
      );
    }

    // レビュー統計を計算
    const reviews = partner.customers.filter(c => c.customer_rating);
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, c) => sum + (c.customer_rating || 0), 0) / reviews.length
      : 0;

    const formattedPartner = {
      id: partner.id,
      username: partner.username,
      loginEmail: partner.login_email,
      isActive: partner.is_active,
      lastLoginAt: partner.last_login_at?.toISOString(),
      createdAt: partner.created_at.toISOString(),

      // 詳細情報
      companyName: partner.partner_details?.company_name || '未設定',
      phone: partner.partner_details?.phone_number || '',
      fax: partner.partner_details?.fax_number,
      address: partner.partner_details?.address || '',
      representativeName: partner.partner_details?.representative_name || '',
      websiteUrl: partner.partner_details?.website_url,
      businessDescription: partner.partner_details?.business_description || '',
      appealText: partner.partner_details?.appeal_text || '',
      detailsStatus: partner.partner_details?.partners_status || 'INACTIVE',

      // 対応都道府県
      prefectures: partner.partner_prefectures.map(p => p.supported_prefecture),

      // 統計情報
      customerCount: partner.customers.length,
      quotationCount: partner.quotations.length,
      selectedQuotationCount: partner.quotations.filter(q => q.is_selected).length,
      reviewCount: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,

      // レビュー
      reviews: reviews.map(c => ({
        customerName: c.customer_name,
        rating: c.customer_rating,
        title: c.customer_review_title,
        review: c.customer_review
      }))
    };

    return NextResponse.json({
      success: true,
      data: formattedPartner
    });

  } catch (error) {
    console.error('Partner detail fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '加盟店詳細の取得に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
