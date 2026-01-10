'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface KPI {
  inquiries: number;
  orders: number;
  completed: number;
  revenue: number;
  unpaid: number;
}

interface RevenueTrend {
  month: string;
  revenue: number;
}

interface StatusDistribution {
  inquiries: number;
  quotations: number;
  orders: number;
  in_progress: number;
  completed: number;
}

interface DashboardData {
  kpi: KPI;
  revenue_trend: RevenueTrend[];
  status_distribution: StatusDistribution;
}

export default function PartnerDashboardPage() {
  const [period, setPeriod] = useState('current_month');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  const fetchDashboardData = async (selectedPeriod: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/partner/dashboard?period=${selectedPeriod}`);
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-600">データの取得に失敗しました</p>
      </div>
    );
  }

  // 円グラフの色設定
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // ステータス分布を配列に変換
  const statusCountsArray = dashboardData.status_distribution ? [
    { status: '問い合わせ', count: dashboardData.status_distribution.inquiries },
    { status: '見積提出', count: dashboardData.status_distribution.quotations },
    { status: '受注', count: dashboardData.status_distribution.orders },
    { status: '施工中', count: dashboardData.status_distribution.in_progress },
    { status: '完了', count: dashboardData.status_distribution.completed },
  ].filter(item => item.count > 0) : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="期間を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current_month">今月</SelectItem>
            <SelectItem value="last_month">先月</SelectItem>
            <SelectItem value="current_year">今年</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIサマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              問い合わせ件数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-900">
              {dashboardData.kpi.inquiries}
            </p>
            <p className="text-xs text-blue-600 mt-1">件</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              受注件数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-900">
              {dashboardData.kpi.orders}
            </p>
            <p className="text-xs text-green-600 mt-1">件</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">
              施工完了件数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-900">
              {dashboardData.kpi.completed}
            </p>
            <p className="text-xs text-purple-600 mt-1">件</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">
              売上
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-900">
              ¥{dashboardData.kpi.revenue.toLocaleString()}
            </p>
            <p className="text-xs text-orange-600 mt-1">税込</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-white border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              未入金額
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-900">
              ¥{dashboardData.kpi.unpaid.toLocaleString()}
            </p>
            <p className="text-xs text-red-600 mt-1">税込</p>
          </CardContent>
        </Card>
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 月次売上推移グラフ */}
        <Card>
          <CardHeader>
            <CardTitle>月次売上推移</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.revenue_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return `${month}月`;
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `¥${value.toLocaleString()}`,
                    '売上',
                  ]}
                  labelFormatter={(label) => {
                    const [year, month] = label.split('-');
                    return `${year}年${month}月`;
                  }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 案件ステータス別件数グラフ */}
        <Card>
          <CardHeader>
            <CardTitle>案件ステータス別件数</CardTitle>
          </CardHeader>
          <CardContent>
            {statusCountsArray.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusCountsArray}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count, percent }) =>
                      `${status}: ${count}件 (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusCountsArray.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value}件`,
                      name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                データがありません
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 最近のアクティビティ */}
      <Card>
        <CardHeader>
          <CardTitle>最近のアクティビティ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.kpi.inquiries === 0 &&
            dashboardData.kpi.orders === 0 &&
            dashboardData.kpi.completed === 0 ? (
              <p className="text-center text-gray-500 py-8">
                まだアクティビティがありません
              </p>
            ) : (
              <div className="space-y-2">
                {dashboardData.kpi.inquiries > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-700">
                      新規問い合わせ
                    </span>
                    <span className="font-semibold text-blue-900">
                      {dashboardData.kpi.inquiries}件
                    </span>
                  </div>
                )}
                {dashboardData.kpi.orders > 0 && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-700">受注</span>
                    <span className="font-semibold text-green-900">
                      {dashboardData.kpi.orders}件
                    </span>
                  </div>
                )}
                {dashboardData.kpi.completed > 0 && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-purple-700">施工完了</span>
                    <span className="font-semibold text-purple-900">
                      {dashboardData.kpi.completed}件
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
