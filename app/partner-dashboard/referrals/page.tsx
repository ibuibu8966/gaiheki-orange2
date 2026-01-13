'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  EXTERIOR_AND_ROOF: '外壁・屋根塗装',
  SIDING_REPLACEMENT: 'サイディング張替',
  PARTIAL_REPAIR: '部分補修',
  FULL_REPLACEMENT: '全面張替'
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">購入案件一覧</h1>
        <a
          href="/partner-dashboard"
          className="text-blue-600 hover:text-blue-800 text-sm"
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
        <CardContent>
          {referrals.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>診断番号</TableHead>
                      <TableHead>顧客名</TableHead>
                      <TableHead>都道府県</TableHead>
                      <TableHead>工事種別</TableHead>
                      <TableHead>紹介料</TableHead>
                      <TableHead>紹介日</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral.id}>
                        <TableCell className="font-medium">
                          {referral.diagnosisNumber}
                        </TableCell>
                        <TableCell>{referral.customerName}</TableCell>
                        <TableCell>
                          {PREFECTURE_LABELS[referral.prefecture] || referral.prefecture}
                        </TableCell>
                        <TableCell>
                          {CONSTRUCTION_TYPE_LABELS[referral.constructionType] || referral.constructionType}
                        </TableCell>
                        <TableCell className="font-semibold text-orange-600">
                          ¥{referral.referralFee.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(referral.createdAt).toLocaleDateString('ja-JP')}
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => setSelectedReferral(referral)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            詳細
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* ページネーション */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => fetchReferrals(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    前へ
                  </button>
                  <span className="px-3 py-1">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchReferrals(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    次へ
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              紹介案件がありません
            </div>
          )}
        </CardContent>
      </Card>

      {/* 詳細モーダル */}
      {selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                案件詳細 - {selectedReferral.diagnosisNumber}
              </h3>
              <button
                onClick={() => setSelectedReferral(null)}
                className="text-gray-400 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* 顧客情報 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">顧客情報</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="grid grid-cols-2 gap-4">
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
                      <p className="font-medium">{selectedReferral.customerEmail}</p>
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
                  <div className="grid grid-cols-2 gap-4">
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

              {/* 紹介料 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">紹介料</h4>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-orange-600">
                    ¥{selectedReferral.referralFee.toLocaleString()}
                  </p>
                  <p className="text-sm text-orange-600 mt-1">税込</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedReferral(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
