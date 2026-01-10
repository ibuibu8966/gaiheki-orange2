"use client";

import { useState, useEffect } from "react";

// ステータスのラベルマッピング
const STATUS_LABELS: Record<string, string> = {
  DESIGNATED: "業者指定",
  RECRUITING: "見積もり募集中",
  COMPARING: "見積もり比較中",
  DECIDED: "業者決定",
  CANCELLED: "キャンセル"
};

// 都道府県のラベルマッピング
const PREFECTURE_MAP: Record<string, string> = {
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

// 工事種別のラベルマッピング
const CONSTRUCTION_TYPE_LABELS: Record<string, string> = {
  EXTERIOR_PAINTING: "外壁塗装",
  ROOF_PAINTING: "屋根塗装",
  EXTERIOR_AND_ROOF: "外壁・屋根塗装",
  PARTIAL_REPAIR: "部分補修",
  WATERPROOFING: "防水工事",
  SIDING_REPLACEMENT: "サイディング張替",
  FULL_REPLACEMENT: "全面張替"
};

// 現在の状況のラベルマッピング
const CURRENT_SITUATION_LABELS: Record<string, string> = {
  MARKET_RESEARCH: "相場を知りたい",
  CONSIDERING_CONSTRUCTION: "工事を検討中",
  COMPARING_CONTRACTORS: "業者を比較したい",
  CONSTRUCTION_COMPLETED: "工事完了",
  READY_TO_ORDER: "すぐに発注したい"
};

interface Diagnosis {
  id: number;
  diagnosisNumber: string;
  prefecture: string;
  floorArea: string;
  currentSituation: string;
  constructionType: string;
  status: string;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    email: string;
  } | null;
  myQuotation: {
    id: number;
    amount: number;
    appealText: string | null;
    isSelected: boolean;
    createdAt: string;
    order: {
      memo: string | null;
      status: string;
    } | null;
  } | null;
  otherQuotations: Array<{
    companyName: string;
    amount: number;
    createdAt: string;
  }>;
  quotationCount: number;
}

export default function DiagnosesPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // モーダル管理
  const [quotationModal, setQuotationModal] = useState<{ isOpen: boolean; diagnosis: Diagnosis | null }>({ isOpen: false, diagnosis: null });
  const [otherQuotationsModal, setOtherQuotationsModal] = useState<{ isOpen: boolean; diagnosis: Diagnosis | null }>({ isOpen: false, diagnosis: null });

  // 見積もり入力フォーム
  const [quotationForm, setQuotationForm] = useState<{ amount: string; appealText: string }>({ amount: "", appealText: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDiagnoses();
  }, [statusFilter]);

  const fetchDiagnoses = async () => {
    try {
      setLoading(true);
      const url = statusFilter
        ? `/api/partner/diagnoses?status=${statusFilter}`
        : '/api/partner/diagnoses';

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setDiagnoses(data.data);
      } else {
        alert(data.error || '診断依頼の取得に失敗しました');
      }
    } catch (error) {
      console.error('Fetch diagnoses error:', error);
      alert('診断依頼の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const openQuotationModal = (diagnosis: Diagnosis) => {
    // 既存の見積もりがあれば、その値をフォームに設定
    if (diagnosis.myQuotation) {
      setQuotationForm({
        amount: diagnosis.myQuotation.amount.toString(),
        appealText: diagnosis.myQuotation.appealText || ""
      });
    } else {
      setQuotationForm({ amount: "", appealText: "" });
    }
    setQuotationModal({ isOpen: true, diagnosis });
  };

  const closeQuotationModal = () => {
    setQuotationModal({ isOpen: false, diagnosis: null });
    setQuotationForm({ amount: "", appealText: "" });
  };

  const openOtherQuotationsModal = (diagnosis: Diagnosis) => {
    setOtherQuotationsModal({ isOpen: true, diagnosis });
  };

  const closeOtherQuotationsModal = () => {
    setOtherQuotationsModal({ isOpen: false, diagnosis: null });
  };

  const handleSubmitQuotation = async () => {
    if (!quotationModal.diagnosis) return;

    if (!quotationForm.amount) {
      alert('見積もり金額を入力してください');
      return;
    }

    try {
      setSubmitting(true);

      // 既存の見積もりがあるかどうかで、POSTかPATCHかを決定
      const isUpdate = !!quotationModal.diagnosis.myQuotation;
      const method = isUpdate ? 'PATCH' : 'POST';
      const body = isUpdate
        ? {
            quotationId: quotationModal.diagnosis.myQuotation!.id,
            quotationAmount: quotationForm.amount,
            appealText: quotationForm.appealText
          }
        : {
            diagnosisRequestId: quotationModal.diagnosis.id,
            quotationAmount: quotationForm.amount,
            appealText: quotationForm.appealText
          };

      const response = await fetch('/api/partner/quotations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        alert(isUpdate ? '見積もりを更新しました' : '見積もりを提出しました');
        closeQuotationModal();
        await fetchDiagnoses();
      } else {
        alert(data.error || '見積もりの提出に失敗しました');
      }
    } catch (error) {
      console.error('Submit quotation error:', error);
      alert('見積もりの提出に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">診断管理</h2>
          </div>

          {/* ステータスフィルタータブ */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter("")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === ""
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setStatusFilter("DESIGNATED")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === "DESIGNATED"
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                業者指定
              </button>
              <button
                onClick={() => setStatusFilter("RECRUITING")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === "RECRUITING"
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                見積もり募集中
              </button>
              <button
                onClick={() => setStatusFilter("COMPARING")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === "COMPARING"
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                見積もり比較中
              </button>
            </div>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto">
            {diagnoses.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                対応エリア内の診断依頼がありません
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">診断番号</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">都道府県</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">現在の状況</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">工事種別</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">依頼日</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">見積もり数</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">自社見積</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {diagnoses.map((diagnosis) => (
                    <tr key={diagnosis.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{diagnosis.diagnosisNumber}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{PREFECTURE_MAP[diagnosis.prefecture]}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{CURRENT_SITUATION_LABELS[diagnosis.currentSituation]}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{CONSTRUCTION_TYPE_LABELS[diagnosis.constructionType]}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{new Date(diagnosis.createdAt).toLocaleDateString('ja-JP')}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          diagnosis.status === 'DECIDED' ? 'bg-green-100 text-green-800' :
                          diagnosis.status === 'COMPARING' ? 'bg-yellow-100 text-yellow-800' :
                          diagnosis.status === 'RECRUITING' ? 'bg-blue-100 text-blue-800' :
                          diagnosis.status === 'DESIGNATED' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {STATUS_LABELS[diagnosis.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {diagnosis.quotationCount > 0 ? (
                          <button
                            onClick={() => openOtherQuotationsModal(diagnosis)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {diagnosis.quotationCount}件
                          </button>
                        ) : (
                          <span className="text-gray-500">0件</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {diagnosis.myQuotation ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-600">
                              ¥{diagnosis.myQuotation.amount.toLocaleString()}
                            </span>
                            {diagnosis.myQuotation.isSelected && (
                              <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-bold rounded">選択済</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">未提出</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <button
                          onClick={() => openQuotationModal(diagnosis)}
                          className={`px-4 py-2 rounded-md text-sm font-medium ${
                            diagnosis.myQuotation
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {diagnosis.myQuotation ? '見積再提出' : '見積提出'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* 見積もり提出/再提出モーダル */}
      {quotationModal.isOpen && quotationModal.diagnosis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeQuotationModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {quotationModal.diagnosis.myQuotation ? '見積もり再提出' : '見積もり提出'}
              </h3>
              <button onClick={closeQuotationModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4">
              {/* 案件情報 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-bold text-gray-700 mb-2">案件情報</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">診断番号：</span>
                    <span className="font-medium text-gray-900">{quotationModal.diagnosis.diagnosisNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">都道府県：</span>
                    <span className="font-medium text-gray-900">{PREFECTURE_MAP[quotationModal.diagnosis.prefecture]}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">工事種別：</span>
                    <span className="font-medium text-gray-900">{CONSTRUCTION_TYPE_LABELS[quotationModal.diagnosis.constructionType]}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">見積もり数：</span>
                    <span className="font-medium text-gray-900">{quotationModal.diagnosis.quotationCount}件</span>
                  </div>
                </div>
              </div>

              {/* 現在の見積もり（再提出の場合のみ） */}
              {quotationModal.diagnosis.myQuotation && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">現在の見積もり</h4>
                  <div className="text-sm">
                    <div className="mb-2">
                      <span className="text-gray-600">金額：</span>
                      <span className="font-bold text-blue-600 text-lg ml-2">
                        ¥{quotationModal.diagnosis.myQuotation.amount.toLocaleString()}
                      </span>
                    </div>
                    {quotationModal.diagnosis.myQuotation.appealText && (
                      <div>
                        <span className="text-gray-600">アピール文章：</span>
                        <p className="text-gray-900 mt-1">{quotationModal.diagnosis.myQuotation.appealText}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* フォーム */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    見積もり金額（円） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={quotationForm.amount}
                    onChange={(e) => setQuotationForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="例: 1500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    アピール文章
                  </label>
                  <textarea
                    value={quotationForm.appealText}
                    onChange={(e) => setQuotationForm(prev => ({ ...prev, appealText: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="弊社の強みや提案内容をアピールしてください"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeQuotationModal}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmitQuotation}
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '提出中...' : (quotationModal.diagnosis.myQuotation ? '再提出する' : '提出する')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 他社見積もりモーダル */}
      {otherQuotationsModal.isOpen && otherQuotationsModal.diagnosis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeOtherQuotationsModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                見積もり一覧 - {otherQuotationsModal.diagnosis.diagnosisNumber}
              </h3>
              <button onClick={closeOtherQuotationsModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              {/* 自分の見積もり */}
              {otherQuotationsModal.diagnosis.myQuotation && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">あなたの見積もり</h4>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">提出日：{new Date(otherQuotationsModal.diagnosis.myQuotation.createdAt).toLocaleDateString('ja-JP')}</p>
                        {otherQuotationsModal.diagnosis.myQuotation.appealText && (
                          <p className="text-sm text-gray-700 mt-2">{otherQuotationsModal.diagnosis.myQuotation.appealText}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          ¥{otherQuotationsModal.diagnosis.myQuotation.amount.toLocaleString()}
                        </p>
                        {otherQuotationsModal.diagnosis.myQuotation.isSelected && (
                          <span className="inline-block mt-2 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">選択済</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 他社の見積もり */}
              {otherQuotationsModal.diagnosis.otherQuotations.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-3">他社の見積もり</h4>
                  <div className="space-y-3">
                    {otherQuotationsModal.diagnosis.otherQuotations.map((q, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-bold text-gray-900 mb-1">{q.companyName}</p>
                          <p className="text-xs text-gray-600">提出日：{new Date(q.createdAt).toLocaleDateString('ja-JP')}</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900">
                          ¥{q.amount.toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {otherQuotationsModal.diagnosis.quotationCount === 0 && (
                <div className="text-center text-gray-500 py-8">
                  まだ見積もりが提出されていません
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeOtherQuotationsModal}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
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
