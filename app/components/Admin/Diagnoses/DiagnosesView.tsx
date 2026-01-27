"use client";

import { useState, useEffect } from "react";
import { ResponsiveTable } from "../../Common/ResponsiveTable";
import { ResponsiveModal } from "../../Common/ResponsiveModal";

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
  monthlyDesiredLeads?: number | null;
  monthlyLeadsCount: number;
}

interface EditFormData {
  // 顧客情報
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  // ヒアリング情報
  customerEnthusiasm: number | null;
  desiredPartnerCount: number;
  referralFee: number;
  adminNote: string;
  // 診断情報
  prefecture: string;
  floorArea: string;
  currentSituation: string;
  constructionType: string;
  status: string;
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

  // 編集フォームデータ
  const [editFormData, setEditFormData] = useState<EditFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerEnthusiasm: null,
    desiredPartnerCount: 3,
    referralFee: 30000,
    adminNote: '',
    prefecture: '',
    floorArea: '',
    currentSituation: '',
    constructionType: '',
    status: ''
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
    // モーダルを開いた時点でフォームデータを初期化
    setEditFormData({
      customerName: diagnosis.customerName,
      customerEmail: diagnosis.customerEmail || '',
      customerPhone: diagnosis.customerPhone,
      customerAddress: diagnosis.address || '',
      customerEnthusiasm: diagnosis.customerEnthusiasm,
      desiredPartnerCount: diagnosis.desiredPartnerCount || 3,
      referralFee: diagnosis.referralFee || 30000,
      adminNote: diagnosis.adminNote || '',
      prefecture: diagnosis.prefecture,
      floorArea: diagnosis.floorArea,
      currentSituation: diagnosis.currentSituation,
      constructionType: diagnosis.constructionType,
      status: diagnosis.status,
    });
    setShowDetailModal(true);
  };

  const openReferralModal = async (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    setNewReferralFee(diagnosis.referralFee || 30000);
    await fetchPartners(diagnosis.prefecture);
    setShowReferralModal(true);
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
          // 顧客情報
          customerName: editFormData.customerName,
          customerEmail: editFormData.customerEmail || null,
          customerPhone: editFormData.customerPhone,
          customerAddress: editFormData.customerAddress || null,
          // ヒアリング情報
          customerEnthusiasm: editFormData.customerEnthusiasm,
          desiredPartnerCount: editFormData.desiredPartnerCount,
          referralFee: editFormData.referralFee,
          adminNote: editFormData.adminNote || null,
          // 診断情報
          prefecture: editFormData.prefecture,
          floorArea: editFormData.floorArea,
          currentSituation: editFormData.currentSituation,
          constructionType: editFormData.constructionType,
          status: editFormData.status
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('保存しました');
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
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
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
                className={`px-4 py-2 min-h-[44px] rounded-md text-sm font-medium transition-colors ${
                  diagnosisFilter === filter.value
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* テーブル */}
        <div className="p-4 sm:p-0">
          <ResponsiveTable
            data={diagnoses}
            keyField="id"
            isLoading={loading}
            emptyMessage="診断データがありません"
            columns={[
              {
                key: "diagnosisNumber",
                label: "診断ID",
                priority: 10,
                render: (d) => (
                  <span className="font-medium">{d.diagnosisNumber}</span>
                ),
              },
              {
                key: "customerName",
                label: "顧客名",
                priority: 9,
              },
              {
                key: "prefecture",
                label: "都道府県",
                priority: 7,
                render: (d) => PREFECTURE_LABELS[d.prefecture] || d.prefecture,
              },
              {
                key: "constructionType",
                label: "工事箇所",
                hideOnMobile: true,
                render: (d) => CONSTRUCTION_TYPE_LABELS[d.constructionType] || d.constructionType,
              },
              {
                key: "createdAt",
                label: "診断依頼日",
                hideOnMobile: true,
              },
              {
                key: "referralCount",
                label: "紹介数",
                priority: 6,
                render: (d) => (
                  <span className={`font-semibold ${d.referralCount > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                    {d.referralCount}件
                  </span>
                ),
              },
              {
                key: "status",
                label: "ステータス",
                priority: 8,
                render: (d) => (
                  <span className={`px-3 py-1 text-xs font-medium rounded-md ${
                    d.status === "DESIGNATED" ? "bg-blue-100 text-blue-800" :
                    d.status === "RECRUITING" ? "bg-yellow-100 text-yellow-800" :
                    d.status === "COMPARING" ? "bg-purple-100 text-purple-800" :
                    d.status === "DECIDED" ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {d.statusLabel}
                  </span>
                ),
              },
            ]}
            onRowClick={openDetailModal}
            mobileCardTitle={(d) => (
              <div className="flex items-center justify-between">
                <span>{d.diagnosisNumber}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  d.status === "DESIGNATED" ? "bg-blue-100 text-blue-800" :
                  d.status === "RECRUITING" ? "bg-yellow-100 text-yellow-800" :
                  d.status === "COMPARING" ? "bg-purple-100 text-purple-800" :
                  d.status === "DECIDED" ? "bg-green-100 text-green-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {d.statusLabel}
                </span>
              </div>
            )}
            mobileCardActions={(d) => (
              <button
                onClick={() => openDetailModal(d)}
                className="w-full py-2 text-center text-blue-600 font-medium min-h-[44px]"
              >
                詳細を見る
              </button>
            )}
          />
        </div>
      </div>

      {/* 案件詳細モーダル */}
      {selectedDiagnosis && (
        <ResponsiveModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`案件詳細 - ${selectedDiagnosis.diagnosisNumber}`}
          size="full"
          footer={
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 active:bg-gray-400 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-primary text-primary-foreground rounded-md hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 transition-colors"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左カラム: 顧客情報 + 診断情報 */}
            <div className="space-y-5">
              {/* 顧客情報 */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">顧客情報</h4>
                <div className="bg-white border border-gray-200 p-4 rounded-md space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
                      <input
                        type="text"
                        value={editFormData.customerName}
                        onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                        className="w-full px-3 py-2 min-h-[40px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                      <input
                        type="text"
                        value={editFormData.customerPhone}
                        onChange={(e) => setEditFormData({ ...editFormData, customerPhone: e.target.value })}
                        className="w-full px-3 py-2 min-h-[40px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                    <input
                      type="email"
                      value={editFormData.customerEmail}
                      onChange={(e) => setEditFormData({ ...editFormData, customerEmail: e.target.value })}
                      className="w-full px-3 py-2 min-h-[40px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                    <input
                      type="text"
                      value={editFormData.customerAddress}
                      onChange={(e) => setEditFormData({ ...editFormData, customerAddress: e.target.value })}
                      className="w-full px-3 py-2 min-h-[40px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* 診断情報 */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">診断情報</h4>
                <div className="bg-white border border-gray-200 p-4 rounded-md space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">都道府県</label>
                      <select
                        value={editFormData.prefecture}
                        onChange={(e) => setEditFormData({ ...editFormData, prefecture: e.target.value })}
                        className="w-full px-3 py-2 min-h-[40px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                      >
                        {Object.entries(PREFECTURE_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">延床面積</label>
                      <select
                        value={editFormData.floorArea}
                        onChange={(e) => setEditFormData({ ...editFormData, floorArea: e.target.value })}
                        className="w-full px-3 py-2 min-h-[40px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                      >
                        {Object.entries(FLOOR_AREA_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">現在の状況</label>
                      <select
                        value={editFormData.currentSituation}
                        onChange={(e) => setEditFormData({ ...editFormData, currentSituation: e.target.value })}
                        className="w-full px-3 py-2 min-h-[40px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                      >
                        {Object.entries(CURRENT_SITUATION_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">工事箇所</label>
                      <select
                        value={editFormData.constructionType}
                        onChange={(e) => setEditFormData({ ...editFormData, constructionType: e.target.value })}
                        className="w-full px-3 py-2 min-h-[40px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                      >
                        {Object.entries(CONSTRUCTION_TYPE_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full px-3 py-2 min-h-[40px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                    >
                      {[
                        { value: 'DESIGNATED', label: '業者指定' },
                        { value: 'RECRUITING', label: '紹介募集中' },
                        { value: 'COMPARING', label: '紹介中' },
                        { value: 'DECIDED', label: '業者決定' },
                        { value: 'CANCELLED', label: 'キャンセル' },
                      ].map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 右カラム: ヒアリング情報 + 紹介済み加盟店 */}
            <div className="space-y-5">
              {/* ヒアリング情報 */}
              <div>
                <h4 className="font-bold text-gray-800 mb-3 border-b border-gray-300 pb-2">ヒアリング情報</h4>
                <div className="bg-white border border-gray-200 p-4 rounded-md space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">熱量</label>
                    <StarRating
                      value={editFormData.customerEnthusiasm}
                      onChange={(value) => setEditFormData({ ...editFormData, customerEnthusiasm: value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">紹介希望業者数</label>
                      <select
                        value={editFormData.desiredPartnerCount}
                        onChange={(e) => setEditFormData({ ...editFormData, desiredPartnerCount: Number(e.target.value) })}
                        className="w-full px-3 py-2 min-h-[40px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
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
                          className="w-full px-3 py-2 min-h-[40px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
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
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                      placeholder="顧客が求めている業者の条件など..."
                    />
                  </div>
                </div>
              </div>

              {/* 紹介済み加盟店 */}
              <div>
                <div className="flex justify-between items-center mb-3 border-b border-gray-300 pb-2">
                  <h4 className="font-bold text-gray-800">
                    紹介済み加盟店 ({selectedDiagnosis.referralCount}件)
                  </h4>
                  {editFormData.status !== 'DECIDED' && editFormData.status !== 'CANCELLED' && (
                    <button
                      onClick={() => openReferralModal(selectedDiagnosis)}
                      className="px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 active:bg-primary/80 transition-colors"
                    >
                      新規紹介
                    </button>
                  )}
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-md max-h-48 overflow-y-auto">
                  {selectedDiagnosis.referralCount === 0 ? (
                    <p className="text-gray-500 text-center py-2">まだ紹介がありません</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDiagnosis.referrals.map((referral) => (
                        <div key={referral.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                          <div>
                            <span className="font-medium text-gray-900">{referral.partnerName}</span>
                            <span className="text-gray-600 ml-2">¥{referral.referralFee.toLocaleString()}</span>
                          </div>
                          {referral.emailSent ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                              送信済
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                              未送信
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ResponsiveModal>
      )}

      {/* 新規紹介モーダル */}
      {selectedDiagnosis && (
        <ResponsiveModal
          isOpen={showReferralModal}
          onClose={() => setShowReferralModal(false)}
          title={`加盟店に紹介 - ${selectedDiagnosis.diagnosisNumber}`}
          size="lg"
          footer={
            <button
              onClick={() => setShowReferralModal(false)}
              className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 active:bg-gray-400 transition-colors"
            >
              閉じる
            </button>
          }
        >
          {/* 紹介料設定 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              紹介料
            </label>
            <input
              type="number"
              value={newReferralFee}
              onChange={(e) => setNewReferralFee(Number(e.target.value))}
              className="w-full px-3 py-3 min-h-[44px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                  const hasReachedMonthlyLimit = partner.monthlyDesiredLeads !== null &&
                    partner.monthlyDesiredLeads !== undefined &&
                    partner.monthlyLeadsCount >= partner.monthlyDesiredLeads;

                  return (
                    <div
                      key={partner.id}
                      className={`border rounded-lg p-4 ${
                        isAlreadyReferred || hasReachedMonthlyLimit ? 'bg-gray-100 border-gray-300' : 'bg-white'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div>
                          <h5 className="font-semibold text-gray-900">{partner.companyName}</h5>
                          <p className={`text-sm ${hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`}>
                            保証金残高: ¥{partner.depositBalance.toLocaleString()}
                          </p>
                          {partner.monthlyDesiredLeads !== null && partner.monthlyDesiredLeads !== undefined && (
                            <p className={`text-sm ${hasReachedMonthlyLimit ? 'text-orange-600' : 'text-gray-600'}`}>
                              今月: {partner.monthlyLeadsCount} / {partner.monthlyDesiredLeads} 件
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {isAlreadyReferred ? (
                            <span className="inline-block px-3 py-2 bg-gray-200 text-gray-600 text-sm font-medium rounded-md">
                              紹介済み
                            </span>
                          ) : hasReachedMonthlyLimit ? (
                            <span className="inline-block px-3 py-2 bg-orange-100 text-orange-600 text-sm font-medium rounded-md">
                              月間上限
                            </span>
                          ) : !hasEnoughBalance ? (
                            <span className="inline-block px-3 py-2 bg-red-100 text-red-600 text-sm font-medium rounded-md">
                              残高不足
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCreateReferral(partner.id)}
                              disabled={submittingReferral}
                              className="w-full sm:w-auto px-4 py-3 min-h-[44px] bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 transition-colors"
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
        </ResponsiveModal>
      )}
    </div>
  );
};

export default DiagnosesView;
