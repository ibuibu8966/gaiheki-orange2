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
    const period = searchParams.get('period') || 'current_month';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // 期間の計算
    let dateFrom: Date;
    let dateTo: Date = new Date();

    switch (period) {
      case 'current_month':
        dateFrom = new Date(dateTo.getFullYear(), dateTo.getMonth(), 1);
        break;
      case 'last_month':
        dateFrom = new Date(dateTo.getFullYear(), dateTo.getMonth() - 1, 1);
        dateTo = new Date(dateTo.getFullYear(), dateTo.getMonth(), 0);
        break;
      case 'current_year':
        dateFrom = new Date(dateTo.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (!startDate || !endDate) {
          return NextResponse.json(
            { success: false, error: 'カスタム期間にはstart_dateとend_dateが必要です' },
            { status: 400 }
          );
        }
        dateFrom = new Date(startDate);
        dateTo = new Date(endDate);
        break;
      default:
        dateFrom = new Date(dateTo.getFullYear(), dateTo.getMonth(), 1);
    }

    // パートナー情報（保証金残高を含む）
    const partner = await prisma.partners.findUnique({
      where: { id: partnerId },
      select: {
        deposit_balance: true,
        monthly_desired_leads: true,
        monthly_leads_count: true
      }
    });

    // 紹介数（期間内）
    const referralCount = await prisma.referral.count({
      where: {
        partner_id: partnerId,
        created_at: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    });

    // 紹介料合計（期間内）
    const referralFeeData = await prisma.referral.aggregate({
      where: {
        partner_id: partnerId,
        created_at: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      _sum: {
        referral_fee: true,
      },
    });

    // 診断依頼数（指定業者として）
    const designatedCount = await prisma.diagnosis_requests.count({
      where: {
        designated_partner_id: partnerId,
        created_at: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    });

    // 過去12ヶ月の月次紹介数推移
    const referralTrend = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(dateTo.getFullYear(), dateTo.getMonth() - i, 1);
      const monthEnd = new Date(dateTo.getFullYear(), dateTo.getMonth() - i + 1, 0);

      const monthReferrals = await prisma.referral.count({
        where: {
          partner_id: partnerId,
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      referralTrend.push({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM形式
        referrals: monthReferrals,
      });
    }

    // 最近の入金履歴
    const depositHistory = await prisma.depositHistory.findMany({
      where: { partner_id: partnerId },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        amount: true,
        type: true,
        balance: true,
        description: true,
        created_at: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        kpi: {
          referralCount,
          referralFeeTotal: referralFeeData._sum.referral_fee || 0,
          designatedCount,
          depositBalance: partner?.deposit_balance || 0,
          monthlyDesiredLeads: partner?.monthly_desired_leads || 0,
          monthlyLeadsCount: partner?.monthly_leads_count || 0,
        },
        referral_trend: referralTrend,
        deposit_history: depositHistory.map(h => ({
          id: h.id,
          amount: h.amount,
          type: h.type,
          balance: h.balance,
          description: h.description,
          createdAt: h.created_at.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'ダッシュボードデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}
