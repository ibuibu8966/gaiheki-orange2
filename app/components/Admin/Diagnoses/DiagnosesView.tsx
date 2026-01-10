"use client";

import { useState, useEffect } from "react";

interface Quotation {
  id: number;
  partnerId: number;
  partnerName: string;
  amount: number;
  appealText: string | null;
  isSelected: boolean;
  isLowest: boolean;
}

interface Diagnosis {
  id: number;
  diagnosisNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  prefecture: string;
  floorArea: string;
  currentSituation: string;
  constructionType: string;
  status: string;
  statusLabel: string;
  quotationCount: number;
  quotations: Quotation[];
  createdAt: string;
}

// ラベル変換用マッピング
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
  OVER_300: '300㎡以上'
};

const CURRENT_SITUATION_LABELS: Record<string, string> = {
  MARKET_RESEARCH: '相場を知りたい',
  COMPARING_CONTRACTORS: '業者を比較したい',
  CONSIDERING_CONSTRUCTION: '工事を検討中',
  CONSTRUCTION_COMPLETED: '工事完了',
  READY_TO_ORDER: 'すぐに発注したい'
};

const CONSTRUCTION_TYPE_LABELS: Record<string, string> = {
  EXTERIOR_PAINTING: '外壁塗装',
  ROOF_PAINTING: '屋根塗装',
  EXTERIOR_AND_ROOF: '外壁・屋根塗装',
  SIDING_REPLACEMENT: 'サイディング張替',
  WATERPROOFING: '防水工事',
  PARTIAL_REPAIR: '部分補修',
  FULL_REPLACEMENT: '全面張替'
};

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

const DiagnosesView = () => {
  const [diagnosisFilter, setDiagnosisFilter] = useState("all");
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);
  const [showQuotationModal, setShowQuotationModal] = useState(false);

  // データ取得
  useEffect(() => {
    fetchDiagnoses();
  }, [diagnosisFilter]);

  const fetchDiagnoses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (diagnosisFilter !== 'all') {
        params.append('status', diagnosisFilter);
      }

      const url = `/api/admin/diagnoses?${params}`;
      console.log('Fetching diagnoses with filter:', diagnosisFilter, 'URL:', url);
      const response = await fetch(url);
      const result = await response.json();
      console.log('Diagnoses result:', result);

      if (result.success) {
        setDiagnoses(result.data);
      }
    } catch (error) {
      console.error('診断案件取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 業者決定処理
  const handleDecidePartner = async (diagnosisId: number, quotationId: number) => {
    if (!confirm('この業者に決定しますか？')) return;

    try {
      const response = await fetch(`/api/admin/diagnoses/${diagnosisId}/decide`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quotationId }),
      });

      const result = await response.json();

      if (result.success) {
        alert('業者を決定しました');
        setShowQuotationModal(false);
        fetchDiagnoses();
      } else {
        alert('業者決定に失敗しました: ' + result.error);
      }
    } catch (error) {
      console.error('業者決定エラー:', error);
      alert('業者決定に失敗しました');
    }
  };

  const openQuotationModal = (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setShowQuotationModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">診断管理</h2>
        </div>
        
        {/* ステータスフィルタータブ */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex space-x-2">
            {[
              { value: "all", label: "すべて" },
              { value: "DESIGNATED", label: "業者指定" },
              { value: "RECRUITING", label: "見積もり募集中" },
              { value: "COMPARING", label: "見積もり比較中" },
              { value: "DECIDED", label: "業者決定" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setDiagnosisFilter(filter.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  diagnosisFilter === filter.value
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* テーブル */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">診断ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">顧客名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">延床面積</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">現在の状況</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">工事箇所</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">診断依頼日</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">ステータス</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-800">
                    読み込み中...
                  </td>
                </tr>
              ) : diagnoses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-800">
                    データがありません
                  </td>
                </tr>
              ) : (
                diagnoses.map((diagnosis) => (
                  <tr key={diagnosis.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {diagnosis.diagnosisNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {diagnosis.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {FLOOR_AREA_LABELS[diagnosis.floorArea] || diagnosis.floorArea}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {CURRENT_SITUATION_LABELS[diagnosis.currentSituation] || diagnosis.currentSituation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {CONSTRUCTION_TYPE_LABELS[diagnosis.constructionType] || diagnosis.constructionType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {diagnosis.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-md ${
                        diagnosis.status === "DESIGNATED" ? "bg-blue-100 text-blue-800" :
                        diagnosis.status === "RECRUITING" ? "bg-yellow-100 text-yellow-800" :
                        diagnosis.status === "COMPARING" ? "bg-purple-100 text-purple-800" :
                        diagnosis.status === "DECIDED" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {diagnosis.statusLabel} ({diagnosis.quotationCount})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openQuotationModal(diagnosis)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        詳細を見る
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 見積もり詳細モーダル */}
      {showQuotationModal && selectedDiagnosis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                見積もり詳細 - {selectedDiagnosis.diagnosisNumber}
              </h3>
              <button
                onClick={() => setShowQuotationModal(false)}
                className="text-gray-400 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4">
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">顧客情報</h4>
                <div className="bg-gray-50 p-4 rounded-md space-y-2 text-gray-900">
                  <p><span className="font-medium">氏名:</span> {selectedDiagnosis.customerName}</p>
                  <p><span className="font-medium">メール:</span> {selectedDiagnosis.customerEmail}</p>
                  <p><span className="font-medium">電話:</span> {selectedDiagnosis.customerPhone}</p>
                  <p><span className="font-medium">住所:</span> {selectedDiagnosis.address}</p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">診断情報</h4>
                <div className="bg-gray-50 p-4 rounded-md space-y-2 text-gray-900">
                  <p><span className="font-medium">都道府県:</span> {PREFECTURE_LABELS[selectedDiagnosis.prefecture] || selectedDiagnosis.prefecture}</p>
                  <p><span className="font-medium">延床面積:</span> {FLOOR_AREA_LABELS[selectedDiagnosis.floorArea] || selectedDiagnosis.floorArea}</p>
                  <p><span className="font-medium">現在の状況:</span> {CURRENT_SITUATION_LABELS[selectedDiagnosis.currentSituation] || selectedDiagnosis.currentSituation}</p>
                  <p><span className="font-medium">工事箇所:</span> {CONSTRUCTION_TYPE_LABELS[selectedDiagnosis.constructionType] || selectedDiagnosis.constructionType}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">
                  見積もり一覧 ({selectedDiagnosis.quotationCount}件)
                </h4>

                {selectedDiagnosis.quotationCount === 0 ? (
                  <p className="text-gray-800 text-center py-8">見積もりがまだありません</p>
                ) : (
                  <div className="space-y-4">
                    {selectedDiagnosis.quotations.map((quotation) => (
                      <div
                        key={quotation.id}
                        className={`border rounded-lg p-4 ${
                          quotation.isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-semibold text-gray-900">
                              {quotation.partnerName}
                            </h5>
                            <p className="text-2xl font-bold text-blue-600 mt-2">
                              ¥{quotation.amount.toLocaleString()}
                              {quotation.isLowest && (
                                <span className="ml-2 text-sm font-normal text-red-600">
                                  最安値
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {quotation.isSelected ? (
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-md">
                                決定済み
                              </span>
                            ) : selectedDiagnosis.status !== 'DECIDED' ? (
                              <button
                                onClick={() =>
                                  handleDecidePartner(selectedDiagnosis.id, quotation.id)
                                }
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                              >
                                この業者に決定
                              </button>
                            ) : null}
                          </div>
                        </div>

                        {quotation.appealText && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700 font-medium mb-1">
                              アピール文
                            </p>
                            <p className="text-sm text-gray-900">{quotation.appealText}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowQuotationModal(false)}
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
};

export default DiagnosesView;