'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveTable } from '../../components/Common/ResponsiveTable';
import { ResponsiveModal } from '../../components/Common/ResponsiveModal';

interface Referral {
  id: string;
  diagnosisId: number;
  diagnosisNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddress: string | null;
  prefecture: string;
  floorArea: string;
  constructionType: string;
  currentSituation: string;
  status: string;
  referralFee: number;
  adminNote: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface Summary {
  totalReferrals: number;
  totalFee: number;
}

const PREFECTURE_LABELS: Record<string, string> = {
  Hokkaido: '北海道', Aomori: '青森県', Iwate: '岩手県', Miyagi: '宮城県',
  Akita: '秋田県', Yamagata: '山形県', Fukushima: '福島県', Ibaraki: '茨城県',
  Tochigi: '栃木県', Gunma: '群馬県', Saitama: '埼玉県', Chiba: '千葉県',
  Tokyo: '東京都', Kanagawa: '神奈川県', Niigata: '新潟県', Toyama: '富山県',
  Ishikawa: '石川県', Fukui: '福井県', Yamanashi: '山梨県', Nagano: '長野県',
  Gifu: '岐阜県', Shizuoka: '静岡県', Aichi: '愛知県', Mie: '三重県',
  Shiga: '滋賀県', Kyoto: '京都府', Osaka: '大阪府', Hyogo: '兵庫県',
  Nara: '奈良県', Wakayama: '和歌山県', Tottori: '鳥取県', Shimane: '島根県',
  Okayama: '岡山県', Hiroshima: '広島県', Yamaguchi: '山口県', Tokushima: '徳島県',
  Kagawa: '香川県', Ehime: '愛媛県', Kochi: '高知県', Fukuoka: '福岡県',
  Saga: '佐賀県', Nagasaki: '長崎県', Kumamoto: '熊本県', Oita: '大分県',
  Miyazaki: '宮崎県', Kagoshima: '鹿児島県', Okinawa: '沖縄県'
};

const CONSTRUCTION_TYPE_LABELS: Record<string, string> = {
  EXTERIOR_PAINTING: '外壁塗装',
  ROOF_PAINTING: '屋根塗装',
  SCAFFOLDING_WORK: '足場工事',
  WATERPROOFING: '防水工事',
  LARGE_SCALE_WORK: '大規模工事',
  INTERIOR_WORK: '内装工事',
  EXTERIOR_WORK: '外構工事',
  OTHER: 'その他',
};

const FLOOR_AREA_LABELS: Record<string, string> = {
  UNKNOWN: '不明',
  UNDER_80: '80㎡未満',
  FROM_80_TO_100: '80〜100㎡',
  FROM_101_TO_120: '101〜120㎡',
  FROM_121_TO_140: '121〜140㎡',
  FROM_141_TO_160: '141〜160㎡',
  FROM_161_TO_180: '161〜180㎡',
  FROM_181_TO_200: '181〜200㎡',
  FROM_201_TO_250: '201〜250㎡',
  FROM_251_TO_300: '251〜300㎡',
  FROM_301_TO_500: '301〜500㎡',
  OVER_501: '501㎡以上',
};

export default function PartnerReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);

  useEffect(() => {
    fetchReferrals(1);
  }, []);

  const fetchReferrals = async (page: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/partner/referrals?page=${page}&limit=20`);
      const data = await res.json();

      if (data.success) {
        setReferrals(data.data.referrals);
        setPagination(data.data.pagination);
        setSummary(data.data.summary);
      }
    } catch (error) {
      console.error('紹介案件の取得に失敗しました:', error);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">購入案件一覧</h1>
        <a
          href="/partner-dashboard"
          className="text-blue-600 hover:text-blue-800 text-sm min-h-[44px] flex items-center"
        >
          ← ダッシュボードに戻る
        </a>
      </div>

      {/* サマリーカード */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">
                総紹介案件数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-900">
                {summary.totalReferrals}
              </p>
              <p className="text-xs text-blue-600 mt-1">件</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">
                総紹介料
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-900">
                ¥{summary.totalFee.toLocaleString()}
              </p>
              <p className="text-xs text-orange-600 mt-1">税込</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 案件テーブル */}
      <Card>
        <CardHeader>
          <CardTitle>紹介案件</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <ResponsiveTable
            data={referrals}
            keyField="id"
            emptyMessage="紹介案件がありません"
            columns={[
              {
                key: 'diagnosisNumber',
                label: '診断番号',
                priority: 10,
                render: (r) => <span className="font-medium">{r.diagnosisNumber}</span>,
              },
              {
                key: 'customerName',
                label: '顧客名',
                priority: 9,
              },
              {
                key: 'prefecture',
                label: '都道府県',
                priority: 7,
                render: (r) => PREFECTURE_LABELS[r.prefecture] || r.prefecture,
              },
              {
                key: 'constructionType',
                label: '工事種別',
                hideOnMobile: true,
                render: (r) => CONSTRUCTION_TYPE_LABELS[r.constructionType] || r.constructionType,
              },
              {
                key: 'referralFee',
                label: '紹介料',
                priority: 8,
                render: (r) => (
                  <span className="font-semibold text-orange-600">
                    ¥{r.referralFee.toLocaleString()}
                  </span>
                ),
              },
              {
                key: 'createdAt',
                label: '紹介日',
                hideOnMobile: true,
                render: (r) => new Date(r.createdAt).toLocaleDateString('ja-JP'),
              },
            ]}
            onRowClick={(r) => setSelectedReferral(r)}
            mobileCardTitle={(r) => (
              <div className="flex items-center justify-between">
                <span>{r.diagnosisNumber}</span>
                <span className="font-semibold text-orange-600">
                  ¥{r.referralFee.toLocaleString()}
                </span>
              </div>
            )}
            mobileCardActions={(r) => (
              <button
                onClick={() => setSelectedReferral(r)}
                className="w-full py-2 text-center text-blue-600 font-medium min-h-[44px]"
              >
                詳細を見る
              </button>
            )}
          />

          {/* ページネーション */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => fetchReferrals(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-3 min-h-[44px] border rounded-md disabled:opacity-50 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                前へ
              </button>
              <span className="px-4 py-3 min-h-[44px] flex items-center">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchReferrals(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-3 min-h-[44px] border rounded-md disabled:opacity-50 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                次へ
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 詳細モーダル */}
      <ResponsiveModal
        isOpen={!!selectedReferral}
        onClose={() => setSelectedReferral(null)}
        title={`案件詳細 - ${selectedReferral?.diagnosisNumber || ''}`}
        size="lg"
        footer={
          <button
            onClick={() => setSelectedReferral(null)}
            className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 active:bg-gray-400 transition-colors"
          >
            閉じる
          </button>
        }
      >
        {selectedReferral && (
          <div className="space-y-6">
            {/* 顧客情報 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">顧客情報</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">顧客名</p>
                    <p className="font-medium">{selectedReferral.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">電話番号</p>
                    <p className="font-medium">{selectedReferral.customerPhone}</p>
                  </div>
                </div>
                {selectedReferral.customerEmail && (
                  <div>
                    <p className="text-sm text-gray-500">メールアドレス</p>
                    <p className="font-medium break-all">{selectedReferral.customerEmail}</p>
                  </div>
                )}
                {selectedReferral.customerAddress && (
                  <div>
                    <p className="text-sm text-gray-500">住所</p>
                    <p className="font-medium">{selectedReferral.customerAddress}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 工事情報 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">工事情報</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">都道府県</p>
                    <p className="font-medium">
                      {PREFECTURE_LABELS[selectedReferral.prefecture] || selectedReferral.prefecture}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">工事種別</p>
                    <p className="font-medium">
                      {CONSTRUCTION_TYPE_LABELS[selectedReferral.constructionType] || selectedReferral.constructionType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">延床面積</p>
                    <p className="font-medium">
                      {FLOOR_AREA_LABELS[selectedReferral.floorArea] || selectedReferral.floorArea}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">紹介日</p>
                    <p className="font-medium">
                      {new Date(selectedReferral.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* コメント */}
            {selectedReferral.adminNote && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">コメント</h4>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap text-gray-700">{selectedReferral.adminNote}</p>
                </div>
              </div>
            )}

            {/* 紹介料 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">紹介料</h4>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-2xl sm:text-3xl font-bold text-orange-600">
                  ¥{selectedReferral.referralFee.toLocaleString()}
                </p>
                <p className="text-sm text-orange-600 mt-1">税込</p>
              </div>
            </div>
          </div>
        )}
      </ResponsiveModal>
    </div>
  );
}
