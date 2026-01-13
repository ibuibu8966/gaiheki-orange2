"use client";

import { useState, useEffect } from "react";

interface Referral {
  id: string;
  partnerId: number;
  partnerName: string;
  referralFee: number;
  emailSent: boolean;
}

interface Diagnosis {
  id: number;
  diagnosisNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  address: string | null;
  prefecture: string;
  floorArea: string;
  currentSituation: string;
  constructionType: string;
  status: string;
  statusLabel: string;
  referralCount: number;
  referrals: Referral[];
  createdAt: string;
  // ヒアリング情報
  customerEnthusiasm: number | null;
  desiredPartnerCount: number | null;
  referralFee: number;
  adminNote: string | null;
}

interface Partner {
  id: number;
  companyName: string;
  prefectures: string[];
  depositBalance: number;
  isActive: boolean;
}

interface EditFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerEnthusiasm: number | null;
  desiredPartnerCount: number;
  referralFee: number;
  adminNote: string;
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

// 星評価コンポーネント
const StarRating = ({
  value,
  onChange,
  readonly = false
}: {
  value: number | null;
  onChange?: (value: number) => void;
  readonly?: boolean;
}) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          disabled={readonly}
          className={`text-2xl ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          {value && star <= value ? (
            <span className="text-yellow-400">★</span>
          ) : (
            <span className="text-gray-300">☆</span>
          )}
        </button>
      ))}
      {value && <span className="ml-2 text-sm text-gray-600">({value}/5)</span>}
    </div>
  );
};

const DiagnosesView = () => {
  const [diagnosisFilter, setDiagnosisFilter] = useState("all");
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [newReferralFee, setNewReferralFee] = useState(30000);
  const [submittingReferral, setSubmittingReferral] = useState(false);

  // 編集モード関連
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerEnthusiasm: null,
    desiredPartnerCount: 3,
    referralFee: 30000,
    adminNote: ''
  });
  const [saving, setSaving] = useState(false);

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

      const response = await fetch(`/api/admin/diagnoses?${params}`);
      const result = await response.json();

      if (result.success) {
        setDiagnoses(result.data);
      }
    } catch (error) {
      console.error('診断案件取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async (prefecture: string) => {
    try {
      setLoadingPartners(true);
      const response = await fetch('/api/admin/partners');
      const result = await response.json();

      if (result.success) {
        const filteredPartners = result.data.filter((p: Partner) =>
          p.isActive && p.prefectures.includes(prefecture)
        );
        setPartners(filteredPartners);
      }
    } catch (error) {
      console.error('加盟店取得エラー:', error);
    } finally {
      setLoadingPartners(false);
    }
  };

  const openDetailModal = (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setIsEditMode(false);
    setShowDetailModal(true);
  };

  const openReferralModal = async (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setNewReferralFee(diagnosis.referralFee || 30000);
    await fetchPartners(diagnosis.prefecture);
    setShowReferralModal(true);
  };

  const enterEditMode = () => {
    if (!selectedDiagnosis) return;
    setEditFormData({
      customerName: selectedDiagnosis.customerName,
      customerEmail: selectedDiagnosis.customerEmail || '',
      customerPhone: selectedDiagnosis.customerPhone,
      customerAddress: selectedDiagnosis.address || '',
      customerEnthusiasm: selectedDiagnosis.customerEnthusiasm,
      desiredPartnerCount: selectedDiagnosis.desiredPartnerCount || 3,
      referralFee: selectedDiagnosis.referralFee || 30000,
      adminNote: selectedDiagnosis.adminNote || ''
    });
    setIsEditMode(true);
  };

  const cancelEditMode = () => {
    setIsEditMode(false);
  };

  const handleSave = async () => {
    if (!selectedDiagnosis) return;

    try {
      setSaving(true);
      const response = await fetch('/api/admin/diagnoses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedDiagnosis.id,
          customerName: editFormData.customerName,
          customerEmail: editFormData.customerEmail || null,
          customerPhone: editFormData.customerPhone,
          customerAddress: editFormData.customerAddress || null,
          customerEnthusiasm: editFormData.customerEnthusiasm,
          desiredPartnerCount: editFormData.desiredPartnerCount,
          referralFee: editFormData.referralFee,
          adminNote: editFormData.adminNote || null
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('保存しました');
        setIsEditMode(false);
        setShowDetailModal(false);
        fetchDiagnoses();
      } else {
        alert('保存に失敗しました: ' + result.error);
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateReferral = async (partnerId: number) => {
    if (!selectedDiagnosis) return;

    const alreadyReferred = selectedDiagnosis.referrals.some(r => r.partnerId === partnerId);
    if (alreadyReferred) {
      alert('この加盟店には既に紹介済みです');
      return;
    }

    if (!confirm(`この加盟店に紹介しますか？\n紹介料: ¥${newReferralFee.toLocaleString()}`)) return;

    try {
      setSubmittingReferral(true);
      const response = await fetch('/api/admin/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosisId: selectedDiagnosis.id,
          partnerId,
          referralFee: newReferralFee,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('紹介を作成しました');
        setShowReferralModal(false);
        setShowDetailModal(false);
        fetchDiagnoses();
      } else {
        alert('紹介作成に失敗しました: ' + result.error);
      }
    } catch (error) {
      console.error('紹介作成エラー:', error);
      alert('紹介作成に失敗しました');
    } finally {
      setSubmittingReferral(false);
    }
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
              { value: "RECRUITING", label: "紹介募集中" },
              { value: "COMPARING", label: "紹介中" },
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">都道府県</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">工事箇所</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">診断依頼日</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">紹介数</th>
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
                      {PREFECTURE_LABELS[diagnosis.prefecture] || diagnosis.prefecture}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {CONSTRUCTION_TYPE_LABELS[diagnosis.constructionType] || diagnosis.constructionType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {diagnosis.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`font-semibold ${diagnosis.referralCount > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                        {diagnosis.referralCount}件
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-md ${
                        diagnosis.status === "DESIGNATED" ? "bg-blue-100 text-blue-800" :
                        diagnosis.status === "RECRUITING" ? "bg-yellow-100 text-yellow-800" :
                        diagnosis.status === "COMPARING" ? "bg-purple-100 text-purple-800" :
                        diagnosis.status === "DECIDED" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {diagnosis.statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openDetailModal(diagnosis)}
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

      {/* 案件詳細モーダル */}
      {showDetailModal && selectedDiagnosis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {isEditMode ? '案件編集' : '案件詳細'} - {selectedDiagnosis.diagnosisNumber}
              </h3>
              <div className="flex items-center gap-2">
                {!isEditMode && (
                  <button
                    onClick={enterEditMode}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    編集
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setIsEditMode(false);
                  }}
                  className="text-gray-400 hover:text-gray-900 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              {isEditMode ? (
                // 編集モード
                <>
                  {/* 顧客情報（編集） */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">顧客情報</h4>
                    <div className="bg-gray-50 p-4 rounded-md space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
                          <input
                            type="text"
                            value={editFormData.customerName}
                            onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                          <input
                            type="text"
                            value={editFormData.customerPhone}
                            onChange={(e) => setEditFormData({ ...editFormData, customerPhone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                        <input
                          type="email"
                          value={editFormData.customerEmail}
                          onChange={(e) => setEditFormData({ ...editFormData, customerEmail: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                        <input
                          type="text"
                          value={editFormData.customerAddress}
                          onChange={(e) => setEditFormData({ ...editFormData, customerAddress: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ヒアリング情報（編集） */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">ヒアリング情報</h4>
                    <div className="bg-gray-50 p-4 rounded-md space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">熱量</label>
                        <StarRating
                          value={editFormData.customerEnthusiasm}
                          onChange={(value) => setEditFormData({ ...editFormData, customerEnthusiasm: value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">紹介希望業者数</label>
                          <select
                            value={editFormData.desiredPartnerCount}
                            onChange={(e) => setEditFormData({ ...editFormData, desiredPartnerCount: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {[1, 2, 3, 4].map((n) => (
                              <option key={n} value={n}>{n}社</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">情報単価</label>
                          <div className="flex items-center">
                            <input
                              type="number"
                              value={editFormData.referralFee}
                              onChange={(e) => setEditFormData({ ...editFormData, referralFee: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-gray-600">円</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">求めている業者（メモ）</label>
                        <textarea
                          value={editFormData.adminNote}
                          onChange={(e) => setEditFormData({ ...editFormData, adminNote: e.target.value })}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="顧客が求めている業者の条件など..."
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // 閲覧モード
                <>
                  {/* 顧客情報（閲覧） */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">顧客情報</h4>
                    <div className="bg-gray-50 p-4 rounded-md space-y-2 text-gray-900">
                      <p><span className="font-medium">氏名:</span> {selectedDiagnosis.customerName}</p>
                      <p><span className="font-medium">電話:</span> {selectedDiagnosis.customerPhone}</p>
                      {selectedDiagnosis.customerEmail && (
                        <p><span className="font-medium">メール:</span> {selectedDiagnosis.customerEmail}</p>
                      )}
                      {selectedDiagnosis.address && (
                        <p><span className="font-medium">住所:</span> {selectedDiagnosis.address}</p>
                      )}
                    </div>
                  </div>

                  {/* ヒアリング情報（閲覧） */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">ヒアリング情報</h4>
                    <div className="bg-gray-50 p-4 rounded-md space-y-3 text-gray-900">
                      <div className="flex items-center">
                        <span className="font-medium w-32">熱量:</span>
                        <StarRating value={selectedDiagnosis.customerEnthusiasm} readonly />
                      </div>
                      <p>
                        <span className="font-medium">紹介希望業者数:</span>{' '}
                        {selectedDiagnosis.desiredPartnerCount || 3}社
                      </p>
                      <p>
                        <span className="font-medium">情報単価:</span>{' '}
                        ¥{(selectedDiagnosis.referralFee || 30000).toLocaleString()}
                      </p>
                      {selectedDiagnosis.adminNote && (
                        <div>
                          <span className="font-medium">求めている業者:</span>
                          <div className="mt-1 p-3 bg-white rounded border border-gray-200 text-sm whitespace-pre-wrap">
                            {selectedDiagnosis.adminNote}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 診断情報（閲覧） */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">診断情報</h4>
                    <div className="bg-gray-50 p-4 rounded-md space-y-2 text-gray-900">
                      <p><span className="font-medium">都道府県:</span> {PREFECTURE_LABELS[selectedDiagnosis.prefecture] || selectedDiagnosis.prefecture}</p>
                      <p><span className="font-medium">延床面積:</span> {FLOOR_AREA_LABELS[selectedDiagnosis.floorArea] || selectedDiagnosis.floorArea}</p>
                      <p><span className="font-medium">現在の状況:</span> {CURRENT_SITUATION_LABELS[selectedDiagnosis.currentSituation] || selectedDiagnosis.currentSituation}</p>
                      <p><span className="font-medium">工事箇所:</span> {CONSTRUCTION_TYPE_LABELS[selectedDiagnosis.constructionType] || selectedDiagnosis.constructionType}</p>
                    </div>
                  </div>

                  {/* 紹介済み加盟店（閲覧） */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-900">
                        紹介済み加盟店 ({selectedDiagnosis.referralCount}件)
                      </h4>
                      {selectedDiagnosis.status !== 'DECIDED' && selectedDiagnosis.status !== 'CANCELLED' && (
                        <button
                          onClick={() => openReferralModal(selectedDiagnosis)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                        >
                          新規紹介
                        </button>
                      )}
                    </div>

                    {selectedDiagnosis.referralCount === 0 ? (
                      <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500">
                        まだ紹介がありません
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedDiagnosis.referrals.map((referral) => (
                          <div
                            key={referral.id}
                            className="border rounded-lg p-4 bg-white"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <h5 className="font-semibold text-gray-900">{referral.partnerName}</h5>
                                <p className="text-sm text-gray-600">
                                  紹介料: ¥{referral.referralFee.toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {referral.emailSent ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                    メール送信済み
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                    メール未送信
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              {isEditMode ? (
                <>
                  <button
                    onClick={cancelEditMode}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? '保存中...' : '保存'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  閉じる
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 新規紹介モーダル */}
      {showReferralModal && selectedDiagnosis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                加盟店に紹介 - {selectedDiagnosis.diagnosisNumber}
              </h3>
              <button
                onClick={() => setShowReferralModal(false)}
                className="text-gray-400 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4">
              {/* 紹介料設定 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  紹介料
                </label>
                <input
                  type="number"
                  value={newReferralFee}
                  onChange={(e) => setNewReferralFee(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  紹介時に加盟店の保証金から引き落とされます
                </p>
              </div>

              {/* 対応可能な加盟店一覧 */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {PREFECTURE_LABELS[selectedDiagnosis.prefecture]}対応の加盟店
                </h4>

                {loadingPartners ? (
                  <div className="text-center py-8 text-gray-500">
                    読み込み中...
                  </div>
                ) : partners.length === 0 ? (
                  <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
                    対応可能な加盟店がありません
                  </div>
                ) : (
                  <div className="space-y-3">
                    {partners.map((partner) => {
                      const isAlreadyReferred = selectedDiagnosis.referrals.some(
                        r => r.partnerId === partner.id
                      );
                      const hasEnoughBalance = partner.depositBalance >= newReferralFee;

                      return (
                        <div
                          key={partner.id}
                          className={`border rounded-lg p-4 ${
                            isAlreadyReferred ? 'bg-gray-100 border-gray-300' : 'bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="font-semibold text-gray-900">{partner.companyName}</h5>
                              <p className={`text-sm ${hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`}>
                                保証金残高: ¥{partner.depositBalance.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              {isAlreadyReferred ? (
                                <span className="px-3 py-1 bg-gray-200 text-gray-600 text-sm font-medium rounded-md">
                                  紹介済み
                                </span>
                              ) : !hasEnoughBalance ? (
                                <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-md">
                                  残高不足
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleCreateReferral(partner.id)}
                                  disabled={submittingReferral}
                                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                  {submittingReferral ? '処理中...' : '紹介する'}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowReferralModal(false)}
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
