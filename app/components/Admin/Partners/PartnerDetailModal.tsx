"use client";

import { useState, useEffect } from "react";

interface PartnerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerId: number | null;
  onEdit: (partner: any) => void;
}

const PREFECTURE_NAMES: Record<string, string> = {
  Hokkaido: '北海道', Aomori: '青森県', Iwate: '岩手県', Miyagi: '宮城県',
  Akita: '秋田県', Yamagata: '山形県', Fukushima: '福島県',
  Ibaraki: '茨城県', Tochigi: '栃木県', Gunma: '群馬県',
  Saitama: '埼玉県', Chiba: '千葉県', Tokyo: '東京都', Kanagawa: '神奈川県',
  Niigata: '新潟県', Toyama: '富山県', Ishikawa: '石川県', Fukui: '福井県',
  Yamanashi: '山梨県', Nagano: '長野県',
  Gifu: '岐阜県', Shizuoka: '静岡県', Aichi: '愛知県', Mie: '三重県',
  Shiga: '滋賀県', Kyoto: '京都府', Osaka: '大阪府', Hyogo: '兵庫県',
  Nara: '奈良県', Wakayama: '和歌山県',
  Tottori: '鳥取県', Shimane: '島根県', Okayama: '岡山県', Hiroshima: '広島県',
  Yamaguchi: '山口県',
  Tokushima: '徳島県', Kagawa: '香川県', Ehime: '愛媛県', Kochi: '高知県',
  Fukuoka: '福岡県', Saga: '佐賀県', Nagasaki: '長崎県', Kumamoto: '熊本県',
  Oita: '大分県', Miyazaki: '宮崎県', Kagoshima: '鹿児島県', Okinawa: '沖縄県'
};

const PartnerDetailModal = ({ isOpen, onClose, partnerId, onEdit }: PartnerDetailModalProps) => {
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && partnerId) {
      fetchPartnerDetail();
    }
  }, [isOpen, partnerId]);

  const fetchPartnerDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/partners/${partnerId}`);
      const data = await response.json();

      if (data.success) {
        setPartner(data.data);
      } else {
        setError(data.error || '詳細情報の取得に失敗しました');
      }
    } catch (err) {
      setError('詳細情報の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">加盟店詳細</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-sm text-gray-800">読み込み中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchPartnerDetail}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                再読み込み
              </button>
            </div>
          ) : partner ? (
            <div className="space-y-6">
              {/* 基本情報 */}
              <div>
                <h4 className="text-lg font-semibold mb-4 pb-2 border-b text-gray-900">基本情報</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-700 font-medium">会社名</div>
                    <div className="text-base font-medium text-gray-900">{partner.companyName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-700 font-medium">代表者名</div>
                    <div className="text-base text-gray-900">{partner.representativeName || '未設定'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-700 font-medium">電話番号</div>
                    <div className="text-base text-gray-900">{partner.phone || '未設定'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-700 font-medium">FAX番号</div>
                    <div className="text-base text-gray-900">{partner.fax || '未設定'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="text-sm text-gray-700 font-medium">住所</div>
                    <div className="text-base text-gray-900">{partner.address || '未設定'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-700 font-medium">ウェブサイト</div>
                    {partner.websiteUrl ? (
                      <a
                        href={partner.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-blue-600 hover:underline"
                      >
                        {partner.websiteUrl}
                      </a>
                    ) : (
                      <div className="text-base text-gray-900">未設定</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-gray-700 font-medium">ステータス</div>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      partner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {partner.isActive ? '表示' : '非表示'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ログイン情報 */}
              <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                  <h4 className="text-lg font-semibold text-gray-900">ログイン情報</h4>
                  <button
                    onClick={() => onEdit(partner)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    編集
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-700 font-medium">ユーザー名</div>
                    <div className="text-base text-gray-900">{partner.username}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-700 font-medium">ログインメールアドレス</div>
                    <div className="text-base text-gray-900">{partner.loginEmail}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-700 font-medium">最終ログイン</div>
                    <div className="text-base text-gray-900">
                      {partner.lastLoginAt
                        ? new Date(partner.lastLoginAt).toLocaleString('ja-JP')
                        : 'ログイン履歴なし'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-700 font-medium">登録日</div>
                    <div className="text-base text-gray-900">
                      {new Date(partner.createdAt).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                </div>
              </div>

              {/* 対応都道府県 */}
              <div>
                <h4 className="text-lg font-semibold mb-4 pb-2 border-b text-gray-900">対応都道府県</h4>
                <div className="flex flex-wrap gap-2">
                  {partner.prefectures && partner.prefectures.length > 0 ? (
                    partner.prefectures.map((pref: string) => (
                      <span
                        key={pref}
                        className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                      >
                        {PREFECTURE_NAMES[pref] || pref}
                      </span>
                    ))
                  ) : (
                    <div className="text-gray-900">未設定</div>
                  )}
                </div>
              </div>

              {/* 事業内容 */}
              <div>
                <h4 className="text-lg font-semibold mb-4 pb-2 border-b text-gray-900">事業内容</h4>
                <div className="text-base whitespace-pre-wrap text-gray-900">
                  {partner.businessDescription || '未設定'}
                </div>
              </div>

              {/* アピール文章 */}
              <div>
                <h4 className="text-lg font-semibold mb-4 pb-2 border-b text-gray-900">アピール文章</h4>
                <div className="text-base whitespace-pre-wrap text-gray-900">
                  {partner.appealText || '未設定'}
                </div>
              </div>

              {/* 統計情報 */}
              <div>
                <h4 className="text-lg font-semibold mb-4 pb-2 border-b text-gray-900">実績・評価</h4>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-gray-900">顧客数</div>
                    <div className="text-2xl font-bold text-blue-600">{partner.customerCount}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-gray-900">見積数</div>
                    <div className="text-2xl font-bold text-green-600">{partner.quotationCount}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-gray-900">受注数</div>
                    <div className="text-2xl font-bold text-purple-600">{partner.selectedQuotationCount}</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm text-gray-900">平均評価</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {partner.averageRating > 0 ? `${partner.averageRating}★` : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* レビュー */}
              {partner.reviews && partner.reviews.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 pb-2 border-b">
                    お客様の声 ({partner.reviewCount}件)
                  </h4>
                  <div className="space-y-4">
                    {partner.reviews.map((review: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="font-medium">{review.customerName}</div>
                          <div className="text-yellow-500">
                            {'★'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}
                          </div>
                        </div>
                        {review.title && (
                          <div className="font-medium text-sm mb-1">{review.title}</div>
                        )}
                        <div className="text-sm text-gray-900">{review.review}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetailModal;
