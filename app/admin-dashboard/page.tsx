'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

interface KPI {
  total_referral_fee: number;
  total_deposit_balance: number;
  new_partners: number;
  active_partners: number;
  total_diagnoses: number;
  total_referrals: number;
  decided_diagnoses: number;
}

interface MonthlyData {
  month: string;
  designations: number;
  referrals: number;
  referral_fee: number;
}

interface PartnerSummary {
  partner_id: number;
  company_name: string;
  designations: number;
  referrals: number;
  referral_fee_total: number;
  deposit_balance: number;
  monthly_data: MonthlyData[];
}

interface MonthlyTrend {
  month: string;
  referral_fee: number;
  deposit_total: number;
  new_partners: number;
  active_partners: number;
}

interface DashboardData {
  kpi: KPI;
  partner_summary: PartnerSummary[];
  monthly_trends: MonthlyTrend[];
}

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<keyof PartnerSummary>('referral_fee_total');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedPartners, setExpandedPartners] = useState<Set<number>>(new Set());

  // KPI・グラフ用の期間選択
  const [kpiPeriod, setKpiPeriod] = useState<'6_months' | '12_months' | 'all'>('12_months');

  // 加盟店別サマリー用の日付範囲
  const now = new Date();
  const [partnerStartYear, setPartnerStartYear] = useState(now.getFullYear());
  const [partnerStartMonth, setPartnerStartMonth] = useState(now.getMonth() + 1);
  const [partnerStartDay, setPartnerStartDay] = useState(1);
  const [partnerEndYear, setPartnerEndYear] = useState(now.getFullYear());
  const [partnerEndMonth, setPartnerEndMonth] = useState(now.getMonth() + 1);
  const [partnerEndDay, setPartnerEndDay] = useState(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate());

  useEffect(() => {
    fetchDashboardData();
  }, [kpiPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 加盟店別サマリー用の日付範囲を作成
      const partnerStartDate = `${partnerStartYear}-${String(partnerStartMonth).padStart(2, '0')}-${String(partnerStartDay).padStart(2, '0')}`;
      const partnerEndDate = `${partnerEndYear}-${String(partnerEndMonth).padStart(2, '0')}-${String(partnerEndDay).padStart(2, '0')}`;

      const res = await fetch(
        `/api/admin/dashboard?chart_period=${kpiPeriod}&partner_start_date=${partnerStartDate}&partner_end_date=${partnerEndDate}`
      );
      const data = await res.json();

      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('ダッシュボードデータの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerDateFilter = () => {
    fetchDashboardData();
  };

  const handleSort = (key: keyof PartnerSummary) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const togglePartnerExpansion = (partnerId: number) => {
    setExpandedPartners((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(partnerId)) {
        newSet.delete(partnerId);
      } else {
        newSet.add(partnerId);
      }
      return newSet;
    });
  };

  const sortedPartners = dashboardData?.partner_summary
    ? [...dashboardData.partner_summary].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        return sortOrder === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      })
    : [];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <p className="text-center text-gray-600">データの取得に失敗しました</p>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
          {/* ヘッダー */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">運営ダッシュボード</h1>
          </div>

          {/* KPI・グラフ期間選択ボタン */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="text-sm font-semibold text-gray-700">KPI・グラフ表示期間:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setKpiPeriod('12_months')}
                  className={`px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                    kpiPeriod === '12_months'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  直近1年
                </button>
                <button
                  onClick={() => setKpiPeriod('6_months')}
                  className={`px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                    kpiPeriod === '6_months'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  直近半年
                </button>
                <button
                  onClick={() => setKpiPeriod('all')}
                  className={`px-4 py-3 min-h-[44px] rounded-lg text-sm font-medium transition-all ${
                    kpiPeriod === 'all'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  全期間
                </button>
              </div>
            </div>
          </div>

          {/* 全体KPIサマリー - レスポンシブグリッド */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 divide-x divide-y sm:divide-y-0 divide-gray-200">
              <div className="px-3 sm:px-4 py-3 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">紹介料合計</div>
                <div className="text-base sm:text-lg font-bold text-blue-900">¥{(dashboardData.kpi.total_referral_fee / 10000).toFixed(0)}万</div>
              </div>

              <div className="px-3 sm:px-4 py-3 text-center">
                <div className="text-xs text-green-600 font-medium mb-1">保証金残高</div>
                <div className="text-base sm:text-lg font-bold text-green-900">¥{(dashboardData.kpi.total_deposit_balance / 10000).toFixed(0)}万</div>
              </div>

              <div className="px-3 sm:px-4 py-3 text-center">
                <div className="text-xs text-cyan-600 font-medium mb-1">診断依頼</div>
                <div className="text-base sm:text-lg font-bold text-cyan-900">{dashboardData.kpi.total_diagnoses}件</div>
              </div>

              <div className="px-3 sm:px-4 py-3 text-center">
                <div className="text-xs text-pink-600 font-medium mb-1">紹介数</div>
                <div className="text-base sm:text-lg font-bold text-pink-900">{dashboardData.kpi.total_referrals}件</div>
              </div>

              <div className="px-3 sm:px-4 py-3 text-center">
                <div className="text-xs text-indigo-600 font-medium mb-1">成約数</div>
                <div className="text-base sm:text-lg font-bold text-indigo-900">{dashboardData.kpi.decided_diagnoses}件</div>
              </div>

              <div className="px-3 sm:px-4 py-3 text-center">
                <div className="text-xs text-purple-600 font-medium mb-1">新規店</div>
                <div className="text-base sm:text-lg font-bold text-purple-900">{dashboardData.kpi.new_partners}店</div>
              </div>

              <div className="px-3 sm:px-4 py-3 text-center col-span-2 sm:col-span-1">
                <div className="text-xs text-orange-600 font-medium mb-1">稼働店</div>
                <div className="text-base sm:text-lg font-bold text-orange-900">{dashboardData.kpi.active_partners}店</div>
              </div>
            </div>
          </div>

          {/* 月次推移グラフ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">月次推移</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <ResponsiveContainer width="100%" height={300} className="sm:!h-[400px]">
                <ComposedChart data={dashboardData.monthly_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="left" dataKey="referral_fee" fill="#3b82f6" name="紹介料" />
                  <Bar yAxisId="left" dataKey="deposit_total" fill="#10b981" name="保証金入金" />
                  <Line yAxisId="right" type="monotone" dataKey="new_partners" stroke="#a855f7" name="新規加盟店数" />
                  <Line yAxisId="right" type="monotone" dataKey="active_partners" stroke="#f97316" name="アクティブ加盟店数" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 加盟店別サマリー */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col gap-4">
                <CardTitle className="text-lg sm:text-xl">加盟店別サマリー</CardTitle>
                <div className="flex flex-col gap-3 text-sm">
                  <span className="font-semibold text-gray-700">表示期間:</span>

                  {/* 開始日 */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500 w-full sm:w-auto">開始:</span>
                    <select
                      value={partnerStartYear}
                      onChange={(e) => setPartnerStartYear(Number(e.target.value))}
                      className="px-2 py-2 min-h-[40px] border border-gray-300 rounded-md bg-white text-gray-700"
                    >
                      {Array.from({ length: 10 }, (_, i) => now.getFullYear() - i).map((year) => (
                        <option key={year} value={year}>
                          {year}年
                        </option>
                      ))}
                    </select>
                    <select
                      value={partnerStartMonth}
                      onChange={(e) => setPartnerStartMonth(Number(e.target.value))}
                      className="px-2 py-2 min-h-[40px] border border-gray-300 rounded-md bg-white text-gray-700"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                          {month}月
                        </option>
                      ))}
                    </select>
                    <select
                      value={partnerStartDay}
                      onChange={(e) => setPartnerStartDay(Number(e.target.value))}
                      className="px-2 py-2 min-h-[40px] border border-gray-300 rounded-md bg-white text-gray-700"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          {day}日
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 終了日 */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500 w-full sm:w-auto">終了:</span>
                    <select
                      value={partnerEndYear}
                      onChange={(e) => setPartnerEndYear(Number(e.target.value))}
                      className="px-2 py-2 min-h-[40px] border border-gray-300 rounded-md bg-white text-gray-700"
                    >
                      {Array.from({ length: 10 }, (_, i) => now.getFullYear() - i).map((year) => (
                        <option key={year} value={year}>
                          {year}年
                        </option>
                      ))}
                    </select>
                    <select
                      value={partnerEndMonth}
                      onChange={(e) => setPartnerEndMonth(Number(e.target.value))}
                      className="px-2 py-2 min-h-[40px] border border-gray-300 rounded-md bg-white text-gray-700"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <option key={month} value={month}>
                          {month}月
                        </option>
                      ))}
                    </select>
                    <select
                      value={partnerEndDay}
                      onChange={(e) => setPartnerEndDay(Number(e.target.value))}
                      className="px-2 py-2 min-h-[40px] border border-gray-300 rounded-md bg-white text-gray-700"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          {day}日
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handlePartnerDateFilter}
                    className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-green-600 text-white rounded-md hover:bg-green-700 active:bg-green-800 transition-colors font-medium"
                  >
                    絞り込み
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {sortedPartners.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-12"></TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                          onClick={() => handleSort('company_name')}
                        >
                          加盟店名 {sortKey === 'company_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                          onClick={() => handleSort('designations')}
                        >
                          指定診断数 {sortKey === 'designations' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                          onClick={() => handleSort('referrals')}
                        >
                          紹介数 {sortKey === 'referrals' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                          onClick={() => handleSort('referral_fee_total')}
                        >
                          紹介料合計 {sortKey === 'referral_fee_total' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                          onClick={() => handleSort('deposit_balance')}
                        >
                          保証金残高 {sortKey === 'deposit_balance' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPartners.map((partner) => (
                        <React.Fragment key={partner.partner_id}>
                          <TableRow className="hover:bg-gray-50">
                            <TableCell>
                              {partner.monthly_data && partner.monthly_data.length > 0 && (
                                <button
                                  onClick={() => togglePartnerExpansion(partner.partner_id)}
                                  className="text-gray-600 hover:text-gray-900 transition-transform duration-200"
                                  style={{
                                    transform: expandedPartners.has(partner.partner_id) ? 'rotate(90deg)' : 'rotate(0deg)',
                                  }}
                                >
                                  ▶
                                </button>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{partner.company_name}</TableCell>
                            <TableCell className="text-right">{partner.designations}件</TableCell>
                            <TableCell className="text-right">{partner.referrals}件</TableCell>
                            <TableCell className="text-right">
                              ¥{partner.referral_fee_total.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {partner.deposit_balance > 0 ? (
                                <span className="text-green-600 font-semibold">
                                  ¥{partner.deposit_balance.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-gray-400">¥0</span>
                              )}
                            </TableCell>
                          </TableRow>
                          {expandedPartners.has(partner.partner_id) && partner.monthly_data && partner.monthly_data.length > 0 && (
                            <>
                              {partner.monthly_data.map((monthData, index) => (
                                <TableRow key={`${partner.partner_id}-${index}`} className="bg-blue-50">
                                  <TableCell></TableCell>
                                  <TableCell className="text-sm text-gray-600 pl-8">
                                    └ {monthData.month}
                                  </TableCell>
                                  <TableCell className="text-right text-sm">{monthData.designations}件</TableCell>
                                  <TableCell className="text-right text-sm">{monthData.referrals}件</TableCell>
                                  <TableCell className="text-right text-sm">
                                    ¥{monthData.referral_fee.toLocaleString()}
                                  </TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                              ))}
                            </>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">データがありません</p>
              )}
            </CardContent>
          </Card>
    </div>
  );
}
