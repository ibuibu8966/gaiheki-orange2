import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requirePartnerAuth } from '@/lib/utils/partnerAuth';

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const { error, partnerId } = await requirePartnerAuth();
    if (error) return error;

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

    // 問い合わせ件数（診断依頼数）
    const inquiries = await prisma.diagnosis_requests.count({
      where: {
        designated_partner_id: partnerId,
        created_at: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    });

    // 受注件数
    const orders = await prisma.orders.count({
      where: {
        quotations: {
          partner_id: partnerId,
        },
        order_date: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    });

    // 施工完了件数
    const completed = await prisma.orders.count({
      where: {
        quotations: {
          partner_id: partnerId,
        },
        order_status: {
          in: ['COMPLETED', 'REVIEW_COMPLETED'],
        },
        completion_date: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    });

    // 売上（顧客への請求額合計）
    const revenueData = await prisma.customer_invoices.aggregate({
      where: {
        order: {
          quotations: {
            partner_id: partnerId,
          },
        },
        created_at: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
      _sum: {
        grand_total: true,
      },
    });

    // 未入金額
    const unpaidData = await prisma.customer_invoices.aggregate({
      where: {
        order: {
          quotations: {
            partner_id: partnerId,
          },
        },
        status: {
          in: ['UNPAID', 'OVERDUE'],
        },
      },
      _sum: {
        grand_total: true,
      },
    });

    // 過去12ヶ月の月次売上推移
    const revenueTrend = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(dateTo.getFullYear(), dateTo.getMonth() - i, 1);
      const monthEnd = new Date(dateTo.getFullYear(), dateTo.getMonth() - i + 1, 0);

      const monthRevenue = await prisma.customer_invoices.aggregate({
        where: {
          order: {
            quotations: {
              partner_id: partnerId,
            },
          },
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          grand_total: true,
        },
      });

      revenueTrend.push({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM形式
        revenue: monthRevenue._sum.grand_total || 0,
      });
    }

    // ステータス別分布（簡易版）
    const quotationsCount = await prisma.quotations.count({
      where: {
        partner_id: partnerId,
        created_at: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    });

    const inProgressCount = await prisma.orders.count({
      where: {
        quotations: {
          partner_id: partnerId,
        },
        order_status: 'IN_PROGRESS',
        order_date: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        kpi: {
          inquiries,
          orders,
          completed,
          revenue: revenueData._sum.grand_total || 0,
          unpaid: unpaidData._sum.grand_total || 0,
        },
        revenue_trend: revenueTrend,
        status_distribution: {
          inquiries,
          quotations: quotationsCount,
          orders,
          in_progress: inProgressCount,
          completed,
        },
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
