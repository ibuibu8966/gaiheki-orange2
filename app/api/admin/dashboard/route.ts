import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chartPeriod = searchParams.get('chart_period') || '12_months';
    const partnerStartDate = searchParams.get('partner_start_date');
    const partnerEndDate = searchParams.get('partner_end_date');

    // 期間計算
    const now = new Date();
    let chartStartDate: Date;

    switch (chartPeriod) {
      case '6_months':
        chartStartDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        break;
      case 'all':
        chartStartDate = new Date(2020, 0, 1); // 全期間
        break;
      case '12_months':
      default:
        chartStartDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        break;
    }

    // 加盟店サマリー用の日付範囲
    const partnerDateFrom = partnerStartDate ? new Date(partnerStartDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const partnerDateTo = partnerEndDate ? new Date(partnerEndDate + 'T23:59:59') : now;

    // === KPI計算 ===

    // 紹介料合計
    const referralFeeData = await prisma.referral.aggregate({
      where: {
        created_at: {
          gte: chartStartDate,
          lte: now,
        },
      },
      _sum: {
        referral_fee: true,
      },
    });

    // 保証金残高合計
    const depositBalanceData = await prisma.partners.aggregate({
      _sum: {
        deposit_balance: true,
      },
    });

    // 診断依頼総数
    const totalDiagnoses = await prisma.diagnosis_requests.count({
      where: {
        created_at: {
          gte: chartStartDate,
          lte: now,
        },
      },
    });

    // 紹介総数
    const totalReferrals = await prisma.referral.count({
      where: {
        created_at: {
          gte: chartStartDate,
          lte: now,
        },
      },
    });

    // 成約数（DECIDED状態の診断）
    const decidedDiagnoses = await prisma.diagnosis_requests.count({
      where: {
        status: 'DECIDED',
        created_at: {
          gte: chartStartDate,
          lte: now,
        },
      },
    });

    // 新規加盟店数
    const newPartners = await prisma.partners.count({
      where: {
        created_at: {
          gte: chartStartDate,
          lte: now,
        },
      },
    });

    // アクティブ加盟店数（紹介がある加盟店）
    const activePartnersData = await prisma.referral.groupBy({
      by: ['partner_id'],
      where: {
        created_at: {
          gte: chartStartDate,
          lte: now,
        },
      },
    });
    const activePartners = activePartnersData.length;

    // === 月次推移 ===
    const monthlyTrends = [];
    const monthsToShow = chartPeriod === '6_months' ? 6 : chartPeriod === '12_months' ? 12 : 24;

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthLabel = `${monthStart.getFullYear()}/${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

      // 月次紹介料
      const monthReferralFee = await prisma.referral.aggregate({
        where: {
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          referral_fee: true,
        },
      });

      // 月次保証金入金
      const monthDepositTotal = await prisma.depositHistory.aggregate({
        where: {
          type: 'DEPOSIT',
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _sum: {
          amount: true,
        },
      });

      // 月次新規加盟店
      const monthNewPartners = await prisma.partners.count({
        where: {
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      // 月次アクティブ加盟店
      const monthActiveData = await prisma.referral.groupBy({
        by: ['partner_id'],
        where: {
          created_at: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      });

      monthlyTrends.push({
        month: monthLabel,
        referral_fee: monthReferralFee._sum.referral_fee || 0,
        deposit_total: monthDepositTotal._sum.amount || 0,
        new_partners: monthNewPartners,
        active_partners: monthActiveData.length,
      });
    }

    // === 加盟店別サマリー ===
    const partners = await prisma.partners.findMany({
      include: {
        partner_details: true,
      },
    });

    const partnerSummary = await Promise.all(
      partners.map(async (partner) => {
        // 指定診断数
        const designations = await prisma.diagnosis_requests.count({
          where: {
            designated_partner_id: partner.id,
            created_at: {
              gte: partnerDateFrom,
              lte: partnerDateTo,
            },
          },
        });

        // 紹介数
        const referrals = await prisma.referral.count({
          where: {
            partner_id: partner.id,
            created_at: {
              gte: partnerDateFrom,
              lte: partnerDateTo,
            },
          },
        });

        // 紹介料合計
        const referralFee = await prisma.referral.aggregate({
          where: {
            partner_id: partner.id,
            created_at: {
              gte: partnerDateFrom,
              lte: partnerDateTo,
            },
          },
          _sum: {
            referral_fee: true,
          },
        });

        // 月別データ
        const monthlyData = [];
        const monthDiff = (partnerDateTo.getFullYear() - partnerDateFrom.getFullYear()) * 12 +
          (partnerDateTo.getMonth() - partnerDateFrom.getMonth()) + 1;

        for (let i = 0; i < Math.min(monthDiff, 12); i++) {
          const monthStart = new Date(partnerDateFrom.getFullYear(), partnerDateFrom.getMonth() + i, 1);
          const monthEnd = new Date(partnerDateFrom.getFullYear(), partnerDateFrom.getMonth() + i + 1, 0, 23, 59, 59);

          if (monthStart > partnerDateTo) break;

          const monthLabel = `${monthStart.getFullYear()}/${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

          const monthDesignations = await prisma.diagnosis_requests.count({
            where: {
              designated_partner_id: partner.id,
              created_at: {
                gte: monthStart,
                lte: monthEnd,
              },
            },
          });

          const monthReferrals = await prisma.referral.count({
            where: {
              partner_id: partner.id,
              created_at: {
                gte: monthStart,
                lte: monthEnd,
              },
            },
          });

          const monthReferralFee = await prisma.referral.aggregate({
            where: {
              partner_id: partner.id,
              created_at: {
                gte: monthStart,
                lte: monthEnd,
              },
            },
            _sum: {
              referral_fee: true,
            },
          });

          monthlyData.push({
            month: monthLabel,
            designations: monthDesignations,
            referrals: monthReferrals,
            referral_fee: monthReferralFee._sum.referral_fee || 0,
          });
        }

        return {
          partner_id: partner.id,
          company_name: partner.partner_details?.company_name || `パートナー ${partner.id}`,
          designations,
          referrals,
          referral_fee_total: referralFee._sum.referral_fee || 0,
          deposit_balance: partner.deposit_balance || 0,
          monthly_data: monthlyData,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        kpi: {
          total_referral_fee: referralFeeData._sum.referral_fee || 0,
          total_deposit_balance: depositBalanceData._sum.deposit_balance || 0,
          total_diagnoses: totalDiagnoses,
          total_referrals: totalReferrals,
          decided_diagnoses: decidedDiagnoses,
          new_partners: newPartners,
          active_partners: activePartners,
        },
        partner_summary: partnerSummary,
        monthly_trends: monthlyTrends,
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
