import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    // 認証チェック（middlewareで行われるが、partnerIdの取得のため）
    const session = await auth();
    if (!session || session.user.userType !== 'partner') {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    const partnerId = parseInt(session.user.id);

    // クエリパラメータ取得
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // 紹介案件一覧を取得
    const [referrals, totalCount] = await Promise.all([
      prisma.referral.findMany({
        where: { partner_id: partnerId },
        include: {
          diagnosis: {
            select: {
              id: true,
              diagnosis_number: true,
              customer_name: true,
              customer_phone: true,
              customer_email: true,
              customer_address: true,
              prefecture: true,
              floor_area: true,
              construction_type: true,
              current_situation: true,
              status: true,
              referral_fee: true,
              admin_note: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.referral.count({
        where: { partner_id: partnerId },
      }),
    ]);

    // 紹介料合計
    const totalFee = await prisma.referral.aggregate({
      where: { partner_id: partnerId },
      _sum: { referral_fee: true },
    });

    // データ整形
    const formattedReferrals = referrals.map((r) => ({
      id: r.id,
      diagnosisId: r.diagnosis_id,
      diagnosisNumber: r.diagnosis.diagnosis_number,
      customerName: r.diagnosis.customer_name,
      customerPhone: r.diagnosis.customer_phone,
      customerEmail: r.diagnosis.customer_email,
      customerAddress: r.diagnosis.customer_address,
      prefecture: r.diagnosis.prefecture,
      floorArea: r.diagnosis.floor_area,
      constructionType: r.diagnosis.construction_type,
      currentSituation: r.diagnosis.current_situation,
      status: r.diagnosis.status,
      referralFee: r.referral_fee,
      adminNote: r.diagnosis.admin_note,
      createdAt: r.created_at.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        referrals: formattedReferrals,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        summary: {
          totalReferrals: totalCount,
          totalFee: totalFee._sum.referral_fee || 0,
        },
      },
    });
  } catch (error) {
    console.error('Referrals API error:', error);
    return NextResponse.json(
      { success: false, error: '紹介案件一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
