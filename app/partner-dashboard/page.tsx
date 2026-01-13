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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface KPI {
  referralCount: number;
  referralFeeTotal: number;
  designatedCount: number;
  depositBalance: number;
  monthlyDesiredLeads: number;
  monthlyLeadsCount: number;
}

interface ReferralTrend {
  month: string;
  referrals: number;
}

interface DepositHistoryItem {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'DEDUCTION';
  balance: number;
  description: string | null;
  createdAt: string;
}

interface DashboardData {
  kpi: KPI;
  referral_trend: ReferralTrend[];
  deposit_history: DepositHistoryItem[];
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              紹介案件数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-900">
              {dashboardData.kpi.referralCount}
            </p>
            <p className="text-xs text-blue-600 mt-1">件</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">
              紹介料合計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-900">
              ¥{dashboardData.kpi.referralFeeTotal.toLocaleString()}
            </p>
            <p className="text-xs text-orange-600 mt-1">税込</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              保証金残高
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-900">
              ¥{dashboardData.kpi.depositBalance.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-1">現在の残高</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">
              今月の紹介枠
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-900">
              {dashboardData.kpi.monthlyLeadsCount}
              <span className="text-lg font-normal">
                {dashboardData.kpi.monthlyDesiredLeads > 0 && ` / ${dashboardData.kpi.monthlyDesiredLeads}`}
              </span>
            </p>
            <p className="text-xs text-purple-600 mt-1">件</p>
          </CardContent>
        </Card>
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 月次紹介数推移グラフ */}
        <Card>
          <CardHeader>
            <CardTitle>月次紹介数推移</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.referral_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const [, month] = value.split('-');
                    return `${month}月`;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`${value}件`, '紹介数']}
                  labelFormatter={(label) => {
                    const [year, month] = label.split('-');
                    return `${year}年${month}月`;
                  }}
                />
                <Bar dataKey="referrals" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 入出金履歴 */}
        <Card>
          <CardHeader>
            <CardTitle>入出金履歴</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.deposit_history.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {dashboardData.deposit_history.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      item.type === 'DEPOSIT' ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-medium ${
                        item.type === 'DEPOSIT' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {item.type === 'DEPOSIT' ? '入金' : '紹介料'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        item.type === 'DEPOSIT' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {item.type === 'DEPOSIT' ? '+' : '-'}¥{Math.abs(item.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        残高: ¥{item.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                入出金履歴がありません
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* クイックリンク */}
      <Card>
        <CardHeader>
          <CardTitle>クイックアクション</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/partner-dashboard/referrals"
              className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div>
                <p className="font-medium text-blue-900">購入案件一覧</p>
                <p className="text-sm text-blue-600">紹介された案件を確認</p>
              </div>
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="/partner-dashboard/profile"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">会社情報</p>
                <p className="text-sm text-gray-600">プロフィールを編集</p>
              </div>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="/partner-dashboard/settings"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">設定</p>
                <p className="text-sm text-gray-600">希望リード数を変更</p>
              </div>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
