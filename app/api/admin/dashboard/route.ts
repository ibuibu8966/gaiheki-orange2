import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requireAdminAuth } from '@/lib/utils/adminAuth';
import { calculateFees } from '@/lib/utils/invoiceNumber';

// GET: 運営会社ダッシュボードデータ取得
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const { error } = await requireAdminAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const chartPeriod = searchParams.get('chart_period') || '6_months';
    const partnerStartDateParam = searchParams.get('partner_start_date');
    const partnerEndDateParam = searchParams.get('partner_end_date');

    // 加盟店別サマリー用の期間計算
    let partnerStartDate: Date;
    let partnerEndDate: Date;
    const now = new Date();

    if (partnerStartDateParam && partnerEndDateParam) {
      // カスタム期間
      partnerStartDate = new Date(partnerStartDateParam);
      partnerEndDate = new Date(partnerEndDateParam);
      partnerEndDate.setHours(23, 59, 59, 999);
    } else {
      // デフォルト: 当月
      partnerStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
      partnerEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    // グラフ用の期間計算
    let chartMonths = 6;
    let chartStartDate: Date;

    if (chartPeriod === 'all') {
      // 全期間: 最初のパートナー登録日から現在まで
      const firstPartner = await prisma.partners.findFirst({
        orderBy: { created_at: 'asc' },
      });

      if (firstPartner) {
        chartStartDate = new Date(firstPartner.created_at.getFullYear(), firstPartner.created_at.getMonth(), 1);
        chartMonths = (now.getFullYear() - chartStartDate.getFullYear()) * 12 +
                      (now.getMonth() - chartStartDate.getMonth()) + 1;
      } else {
        // パートナーがいない場合は現在月のみ
        chartStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        chartMonths = 1;
      }
    } else if (chartPeriod === '12_months') {
      chartMonths = 12;
      chartStartDate = new Date(now.getFullYear(), now.getMonth() - (chartMonths - 1), 1);
    } else {
      // 6_months (直近半年)
      chartMonths = 6;
      chartStartDate = new Date(now.getFullYear(), now.getMonth() - (chartMonths - 1), 1);
    }

    // 全加盟店を取得
    const partners = await prisma.partners.findMany({
      include: {
        fee_plans: true,
        partner_details: true,
      },
    });

    // 加盟店別サマリー用: 期間内に作成された見積
    const partnerQuotationsMap: Record<number, any[]> = {};
    const allQuotations = await prisma.quotations.findMany({
      where: {
        created_at: {
          gte: partnerStartDate,
          lte: partnerEndDate,
        },
      },
    });
    allQuotations.forEach((q) => {
      if (!partnerQuotationsMap[q.partner_id]) {
        partnerQuotationsMap[q.partner_id] = [];
      }
      partnerQuotationsMap[q.partner_id].push(q);
    });

    // 加盟店別サマリー用: 期間内に受注された案件
    const partnerOrdersMap: Record<number, any[]> = {};
    const allOrders = await prisma.orders.findMany({
      where: {
        order_date: {
          gte: partnerStartDate,
          lte: partnerEndDate,
        },
      },
      include: {
        quotations: true,
        customer_invoices: true,
      },
    });
    allOrders.forEach((o) => {
      const partnerId = o.quotations.partner_id;
      if (!partnerOrdersMap[partnerId]) {
        partnerOrdersMap[partnerId] = [];
      }
      partnerOrdersMap[partnerId].push(o);
    });

    // 加盟店別サマリー用: 期間内に完了した案件
    const partnerCompletedMap: Record<number, any[]> = {};
    const allCompletedOrders = await prisma.orders.findMany({
      where: {
        completion_date: {
          gte: partnerStartDate,
          lte: partnerEndDate,
        },
        order_status: {
          in: ['COMPLETED', 'REVIEW_COMPLETED'],
        },
      },
      include: {
        quotations: true,
        customer_invoices: true,
      },
    });
    allCompletedOrders.forEach((o) => {
      const partnerId = o.quotations.partner_id;
      if (!partnerCompletedMap[partnerId]) {
        partnerCompletedMap[partnerId] = [];
      }
      partnerCompletedMap[partnerId].push(o);
    });

    // KPI用の変数（chart_periodに基づく）
    let kpiTotalRevenue = 0;
    let kpiPlatformRevenue = 0;
    let kpiTotalQuotations = 0;
    let kpiTotalOrders = 0;
    let kpiTotalCompleted = 0;
    let kpiActivePartnerIds = new Set<number>();

    // 未払い手数料を一括取得
    const allUnpaidInvoices = await prisma.company_invoices.findMany({
      where: {
        partner_id: {
          in: partners.map((p) => p.id),
        },
        status: {
          in: ['UNPAID', 'OVERDUE'],
        },
      },
    });

    // KPI・グラフ用の月次推移データの取得
    const monthlyTrends = [];
    let kpiNewPartners = 0;

    for (let i = 0; i < chartMonths; i++) {
      const monthStart = new Date(chartStartDate.getFullYear(), chartStartDate.getMonth() + i, 1);
      const monthEnd = new Date(chartStartDate.getFullYear(), chartStartDate.getMonth() + i + 1, 0, 23, 59, 59);

      // その月に作成された見積を取得
      const monthQuotations = await prisma.quotations.findMany({
        where: {
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        include: {
          partners: {
            include: {
              fee_plans: true,
              partner_details: true,
            },
          },
          orders: {
            include: {
              customer_invoices: true,
            },
          },
        },
      });

      // その月に受注された案件を取得
      const monthOrders = await prisma.orders.findMany({
        where: {
          order_date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        include: {
          quotations: {
            include: {
              partners: {
                include: {
                  fee_plans: true,
                },
              },
            },
          },
          customer_invoices: true,
        },
      });

      // その月に完了した案件を取得
      const monthCompletedOrders = await prisma.orders.findMany({
        where: {
          completion_date: {
            gte: monthStart,
            lte: monthEnd,
          },
          order_status: {
            in: ['COMPLETED', 'REVIEW_COMPLETED'],
          },
        },
        include: {
          quotations: {
            include: {
              partners: {
                include: {
                  fee_plans: true,
                },
              },
            },
          },
          customer_invoices: true,
        },
      });

      // その月に登録された加盟店数
      const monthNewPartners = await prisma.partners.count({
        where: {
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      // 月次集計
      const quotationCount = monthQuotations.length;
      const orderCount = monthOrders.length;
      const completedCount = monthCompletedOrders.length;

      const monthRevenue = monthCompletedOrders.reduce(
        (sum, order) => sum + (order.customer_invoices?.grand_total || 0),
        0
      );

      // 手数料計算（完了案件ベース）
      let monthPlatformRevenue = 0;
      const partnerCompletedData: Record<number, { count: number; revenue: number }> = {};

      monthCompletedOrders.forEach((order) => {
        const partnerId = order.quotations.partners.id;
        if (!partnerCompletedData[partnerId]) {
          partnerCompletedData[partnerId] = { count: 0, revenue: 0 };
        }
        partnerCompletedData[partnerId].count++;
        partnerCompletedData[partnerId].revenue += order.customer_invoices?.grand_total || 0;
      });

      Object.entries(partnerCompletedData).forEach(([partnerIdStr, data]) => {
        const partner = monthCompletedOrders.find(
          (o) => o.quotations.partners.id === parseInt(partnerIdStr)
        )?.quotations.partners;

        if (partner?.fee_plans) {
          const feeData = calculateFees(partner.fee_plans, {
            order_count: data.count,
            project_count: data.count,
            project_total_amount: data.revenue,
          });
          monthPlatformRevenue += feeData.total;
        }
      });

      // アクティブ加盟店（その月に受注があった加盟店）
      const monthActivePartners = new Set(monthOrders.map((o) => o.quotations.partners.id));

      // KPI累積
      kpiTotalRevenue += monthRevenue;
      kpiPlatformRevenue += monthPlatformRevenue;
      kpiTotalQuotations += quotationCount;
      kpiTotalOrders += orderCount;
      kpiTotalCompleted += completedCount;
      kpiNewPartners += monthNewPartners;
      monthActivePartners.forEach((id) => kpiActivePartnerIds.add(id));

      monthlyTrends.push({
        month: `${monthStart.getFullYear()}/${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
        total_revenue: monthRevenue,
        platform_revenue: monthPlatformRevenue,
        new_partners: monthNewPartners,
        active_partners: monthActivePartners.size,
      });
    }

    // 加盟店別サマリー用の月次データを計算（partner_start_date 〜 partner_end_date）
    const partnerMonthlyData: Record<number, any[]> = {};

    // 加盟店別サマリー期間の月数を計算
    const partnerMonths = (partnerEndDate.getFullYear() - partnerStartDate.getFullYear()) * 12 +
                          (partnerEndDate.getMonth() - partnerStartDate.getMonth()) + 1;

    for (let i = 0; i < partnerMonths; i++) {
      const monthStart = new Date(partnerStartDate.getFullYear(), partnerStartDate.getMonth() + i, 1);
      const monthEnd = new Date(partnerStartDate.getFullYear(), partnerStartDate.getMonth() + i + 1, 0, 23, 59, 59);

      // その月に作成された見積を取得
      const monthQuotations = await prisma.quotations.findMany({
        where: {
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        include: {
          partners: {
            include: {
              fee_plans: true,
            },
          },
          orders: {
            include: {
              customer_invoices: true,
            },
          },
        },
      });

      // その月に受注された案件を取得
      const monthOrders = await prisma.orders.findMany({
        where: {
          order_date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        include: {
          quotations: {
            include: {
              partners: {
                include: {
                  fee_plans: true,
                },
              },
            },
          },
          customer_invoices: true,
        },
      });

      // その月に完了した案件を取得
      const monthCompletedOrders = await prisma.orders.findMany({
        where: {
          completion_date: {
            gte: monthStart,
            lte: monthEnd,
          },
          order_status: {
            in: ['COMPLETED', 'REVIEW_COMPLETED'],
          },
        },
        include: {
          quotations: {
            include: {
              partners: {
                include: {
                  fee_plans: true,
                },
              },
            },
          },
          customer_invoices: true,
        },
      });

      // 加盟店別の月次データ
      const allPartnerIds = new Set([
        ...monthQuotations.map((q) => q.partners.id),
        ...monthOrders.map((o) => o.quotations.partners.id),
        ...monthCompletedOrders.map((o) => o.quotations.partners.id),
      ]);

      allPartnerIds.forEach((partnerId) => {
        const partnerQuotations = monthQuotations.filter((q) => q.partners.id === partnerId);
        const partnerOrders = monthOrders.filter((o) => o.quotations.partners.id === partnerId);
        const partnerCompleted = monthCompletedOrders.filter((o) => o.quotations.partners.id === partnerId);

        const revenue = partnerCompleted.reduce(
          (sum, order) => sum + (order.customer_invoices?.grand_total || 0),
          0
        );

        let fees = 0;
        if (partnerCompleted.length > 0 && partnerCompleted[0].quotations.partners.fee_plans) {
          const feeData = calculateFees(partnerCompleted[0].quotations.partners.fee_plans, {
            order_count: partnerOrders.length,  // 受注件数
            project_count: partnerCompleted.length,  // 完了件数
            project_total_amount: revenue,
          });
          fees = feeData.total;
        }

        if (!partnerMonthlyData[partnerId]) {
          partnerMonthlyData[partnerId] = [];
        }

        partnerMonthlyData[partnerId].push({
          month: `${monthStart.getFullYear()}/${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
          quotations: partnerQuotations.length,
          orders: partnerOrders.length,
          completed: partnerCompleted.length,
          revenue,
          fees,
        });
      });
    }

    const partnerSummary = partners.map((partner) => {
      // 見積提出件数（期間内に作成された見積）
      const quotationCount = partnerQuotationsMap[partner.id]?.length || 0;

      // 受注件数（期間内に受注された案件）
      const orderCount = partnerOrdersMap[partner.id]?.length || 0;

      // 施工完了件数と金額（期間内に完了した案件）
      const completedOrders = partnerCompletedMap[partner.id] || [];
      const completedCount = completedOrders.length;

      const projectTotalAmount = completedOrders.reduce(
        (sum, order) => sum + (order.customer_invoices?.grand_total || 0),
        0
      );

      // 手数料計算
      let fees = 0;
      if (partner.fee_plans && completedOrders.length > 0) {
        const feeData = calculateFees(partner.fee_plans, {
          order_count: orderCount,
          project_count: completedCount,
          project_total_amount: projectTotalAmount,
        });
        fees = feeData.total;
      }

      // 未払い手数料を計算
      const unpaidFees = allUnpaidInvoices
        .filter((inv) => inv.partner_id === partner.id)
        .reduce((sum, inv) => sum + inv.grand_total, 0);

      return {
        partner_id: partner.id,
        company_name: partner.partner_details?.company_name || partner.login_email,
        quotations: quotationCount,
        orders: orderCount,
        completed: completedCount,
        revenue: projectTotalAmount,
        fees,
        unpaid_fees: unpaidFees,
        fee_plan: partner.fee_plans ? {
          monthly_fee: partner.fee_plans.monthly_fee,
          per_order_fee: partner.fee_plans.per_order_fee,
          per_project_fee: partner.fee_plans.per_project_fee,
          project_fee_rate: partner.fee_plans.project_fee_rate,
        } : null,
        monthly_data: partnerMonthlyData[partner.id] || [], // 月次データを追加
      };
    });

    // KPIデータ（chart_periodに基づく）
    const kpi = {
      total_revenue: kpiTotalRevenue,
      platform_revenue: kpiPlatformRevenue,
      new_partners: kpiNewPartners,
      active_partners: kpiActivePartnerIds.size,
      total_quotations: kpiTotalQuotations,
      total_orders: kpiTotalOrders,
      total_completed: kpiTotalCompleted,
    };

    return NextResponse.json({
      success: true,
      data: {
        kpi,
        partner_summary: partnerSummary,
        monthly_trends: monthlyTrends,
      },
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'ダッシュボードデータの取得に失敗しました' },
      { status: 500 }
    );
  }
}
