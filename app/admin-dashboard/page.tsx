'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/Admin/Common/AdminSidebar';
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
  LineChart,
  Line,
  BarChart,
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
  total_revenue: number;
  platform_revenue: number;
  new_partners: number;
  active_partners: number;
  total_quotations: number;
  total_orders: number;
  total_completed: number;
}

interface MonthlyData {
  month: string;
  quotations: number;
  orders: number;
  completed: number;
  revenue: number;
  fees: number;
}

interface FeePlan {
  monthly_fee: number | null;
  per_order_fee: number | null;
  per_project_fee: number | null;
  project_fee_rate: number | null;
}

interface PartnerSummary {
  partner_id: number;
  company_name: string;
  quotations: number;
  orders: number;
  completed: number;
  revenue: number;
  fees: number;
  unpaid_fees: number;
  fee_plan: FeePlan | null;
  monthly_data: MonthlyData[];
}

interface MonthlyTrend {
  month: string;
  total_revenue: number;
  platform_revenue: number;
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
  const [sortKey, setSortKey] = useState<keyof PartnerSummary>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedPartners, setExpandedPartners] = useState<Set<number>>(new Set());

  // 料金プラン編集用
  const [editingPartner, setEditingPartner] = useState<{ id: number; name: string; feePlan: FeePlan | null } | null>(null);
  const [feePlanForm, setFeePlanForm] = useState<FeePlan>({
    monthly_fee: null,
    per_order_fee: null,
    per_project_fee: null,
    project_fee_rate: null,
  });

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

  const formatFeePlan = (feePlan: FeePlan | null): string => {
    if (!feePlan) return '未設定';

    const parts: string[] = [];
    if (feePlan.monthly_fee) parts.push(`月額¥${feePlan.monthly_fee.toLocaleString()}`);
    if (feePlan.per_order_fee) parts.push(`受注¥${feePlan.per_order_fee.toLocaleString()}/件`);
    if (feePlan.per_project_fee) parts.push(`完了¥${feePlan.per_project_fee.toLocaleString()}/件`);
    if (feePlan.project_fee_rate) parts.push(`完了${(feePlan.project_fee_rate * 100).toFixed(1)}%`);

    return parts.length > 0 ? parts.join(' + ') : '未設定';
  };

  const openFeePlanModal = (partner: PartnerSummary) => {
    setEditingPartner({
      id: partner.partner_id,
      name: partner.company_name,
      feePlan: partner.fee_plan,
    });
    setFeePlanForm({
      monthly_fee: partner.fee_plan?.monthly_fee || null,
      per_order_fee: partner.fee_plan?.per_order_fee || null,
      per_project_fee: partner.fee_plan?.per_project_fee || null,
      project_fee_rate: partner.fee_plan?.project_fee_rate || null,
    });
  };

  const closeFeePlanModal = () => {
    setEditingPartner(null);
  };

  const saveFeePlan = async () => {
    if (!editingPartner) return;

    try {
      const res = await fetch(`/api/admin/partners/${editingPartner.id}/fee-plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feePlanForm),
      });

      const data = await res.json();
      if (data.success) {
        alert('料金プランを更新しました');
        closeFeePlanModal();
        fetchDashboardData();
      } else {
        alert('更新に失敗しました: ' + data.error);
      }
    } catch (error) {
      console.error('料金プラン更新エラー:', error);
      alert('更新に失敗しました');
    }
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
      <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <main className="flex-1 p-8 min-w-0 overflow-y-auto h-screen">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">読み込み中...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-100 flex">
        <AdminSidebar />
        <main className="flex-1 p-8 min-w-0 overflow-y-auto h-screen">
          <p className="text-center text-gray-600">データの取得に失敗しました</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 min-w-0 overflow-y-auto h-screen">
        <div className="space-y-6">
          {/* ヘッダー */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold">運営ダッシュボード</h1>
          </div>

          {/* KPI・グラフ期間選択ボタン */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">KPI・グラフ表示期間:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setKpiPeriod('12_months')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    kpiPeriod === '12_months'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  直近1年
                </button>
                <button
                  onClick={() => setKpiPeriod('6_months')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    kpiPeriod === '6_months'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  直近半年
                </button>
                <button
                  onClick={() => setKpiPeriod('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    kpiPeriod === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  全期間
                </button>
              </div>
            </div>
          </div>

          {/* 全体KPIサマリー - コンパクトバー */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="grid grid-cols-7 divide-x divide-gray-200">
              <div className="px-4 py-3 text-center">
                <div className="text-xs text-blue-600 font-medium mb-1">総売上</div>
                <div className="text-lg font-bold text-blue-900">¥{(dashboardData.kpi.total_revenue / 10000).toFixed(0)}万</div>
              </div>

              <div className="px-4 py-3 text-center">
                <div className="text-xs text-green-600 font-medium mb-1">手数料</div>
                <div className="text-lg font-bold text-green-900">¥{(dashboardData.kpi.platform_revenue / 10000).toFixed(0)}万</div>
              </div>

              <div className="px-4 py-3 text-center">
                <div className="text-xs text-cyan-600 font-medium mb-1">見積</div>
                <div className="text-lg font-bold text-cyan-900">{dashboardData.kpi.total_quotations}件</div>
              </div>

              <div className="px-4 py-3 text-center">
                <div className="text-xs text-pink-600 font-medium mb-1">受注</div>
                <div className="text-lg font-bold text-pink-900">{dashboardData.kpi.total_orders}件</div>
              </div>

              <div className="px-4 py-3 text-center">
                <div className="text-xs text-indigo-600 font-medium mb-1">完了</div>
                <div className="text-lg font-bold text-indigo-900">{dashboardData.kpi.total_completed}件</div>
              </div>

              <div className="px-4 py-3 text-center">
                <div className="text-xs text-purple-600 font-medium mb-1">新規店</div>
                <div className="text-lg font-bold text-purple-900">{dashboardData.kpi.new_partners}店</div>
              </div>

              <div className="px-4 py-3 text-center">
                <div className="text-xs text-orange-600 font-medium mb-1">稼働店</div>
                <div className="text-lg font-bold text-orange-900">{dashboardData.kpi.active_partners}店</div>
              </div>
            </div>
          </div>

          {/* 月次推移グラフ */}
          <Card>
            <CardHeader>
              <CardTitle>月次推移</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={dashboardData.monthly_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="total_revenue" fill="#3b82f6" name="全加盟店総売上" />
                  <Bar yAxisId="left" dataKey="platform_revenue" fill="#10b981" name="手数料売上" />
                  <Line yAxisId="right" type="monotone" dataKey="new_partners" stroke="#a855f7" name="新規加盟店数" />
                  <Line yAxisId="right" type="monotone" dataKey="active_partners" stroke="#f97316" name="アクティブ加盟店数" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 加盟店別サマリー */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle>加盟店別サマリー</CardTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-semibold text-gray-700">表示期間:</span>

                  {/* 開始日 */}
                  <div className="flex items-center gap-2">
                    <select
                      value={partnerStartYear}
                      onChange={(e) => setPartnerStartYear(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700"
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
                      className="px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700"
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
                      className="px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          {day}日
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="text-gray-500">〜</span>

                  {/* 終了日 */}
                  <div className="flex items-center gap-2">
                    <select
                      value={partnerEndYear}
                      onChange={(e) => setPartnerEndYear(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700"
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
                      className="px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700"
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
                      className="px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700"
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
                    className="px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
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
                          onClick={() => handleSort('quotations')}
                        >
                          見積提出件数 {sortKey === 'quotations' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                          onClick={() => handleSort('orders')}
                        >
                          受注件数 {sortKey === 'orders' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                          onClick={() => handleSort('completed')}
                        >
                          施工完了件数 {sortKey === 'completed' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                          onClick={() => handleSort('revenue')}
                        >
                          売上 {sortKey === 'revenue' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                          onClick={() => handleSort('fees')}
                        >
                          手数料 {sortKey === 'fees' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                          className="text-right cursor-pointer hover:bg-gray-100 font-semibold text-gray-700"
                          onClick={() => handleSort('unpaid_fees')}
                        >
                          未払い手数料 {sortKey === 'unpaid_fees' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          料金プラン
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
                            <TableCell className="text-right">{partner.quotations}件</TableCell>
                            <TableCell className="text-right">{partner.orders}件</TableCell>
                            <TableCell className="text-right">{partner.completed}件</TableCell>
                            <TableCell className="text-right">
                              ¥{partner.revenue.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              ¥{partner.fees.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {partner.unpaid_fees > 0 ? (
                                <span className="text-red-600 font-semibold">
                                  ¥{partner.unpaid_fees.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-gray-400">¥0</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <button
                                onClick={() => openFeePlanModal(partner)}
                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                              >
                                {formatFeePlan(partner.fee_plan)}
                              </button>
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
                                  <TableCell className="text-right text-sm">{monthData.quotations}件</TableCell>
                                  <TableCell className="text-right text-sm">{monthData.orders}件</TableCell>
                                  <TableCell className="text-right text-sm">{monthData.completed}件</TableCell>
                                  <TableCell className="text-right text-sm">
                                    ¥{monthData.revenue.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right text-sm">
                                    ¥{monthData.fees.toLocaleString()}
                                  </TableCell>
                                  <TableCell></TableCell>
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
      </main>

      {/* 料金プラン編集モーダル */}
      {editingPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">料金プラン編集</h2>
            <p className="text-sm text-gray-600 mb-4">{editingPartner.name}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  月額固定費（円）
                </label>
                <input
                  type="number"
                  value={feePlanForm.monthly_fee || ''}
                  onChange={(e) => setFeePlanForm({ ...feePlanForm, monthly_fee: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: 30000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  受注手数料（円/件）
                </label>
                <input
                  type="number"
                  value={feePlanForm.per_order_fee || ''}
                  onChange={(e) => setFeePlanForm({ ...feePlanForm, per_order_fee: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: 5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  施工完了手数料（固定額・円/件）
                </label>
                <input
                  type="number"
                  value={feePlanForm.per_project_fee || ''}
                  onChange={(e) => setFeePlanForm({ ...feePlanForm, per_project_fee: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: 10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  施工完了手数料（料率・0〜1の小数）
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={feePlanForm.project_fee_rate || ''}
                  onChange={(e) => setFeePlanForm({ ...feePlanForm, project_fee_rate: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="例: 0.05（5%の場合）"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeFeePlanModal}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={saveFeePlan}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
