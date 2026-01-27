"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import PartnerFormModal from "./PartnerFormModal";
import PartnerDetailModal from "./PartnerDetailModal";
import { ResponsiveTable } from "../../Common/ResponsiveTable";

interface Partner {
  id: number;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  prefectures: string[];
  status: string;
  isActive: boolean;
  registrationDate: string;
  depositBalance: number;
  referralCount: number;
}

const PREFECTURE_NAMES: Record<string, string> = {
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

const PartnersView = () => {
  const { data: session } = useSession();
  const [partnerFilter, setPartnerFilter] = useState("すべて");
  const [partnerSearch, setPartnerSearch] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const adminId = session?.user?.id ? parseInt(session.user.id) : null;

  // モーダル状態
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<any>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(null);

  useEffect(() => {
    fetchPartners();
  }, [partnerFilter, partnerSearch]);

  // 申請承認からの遷移を処理
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openForm') === 'true') {
      const pendingApplication = sessionStorage.getItem('pendingPartnerApplication');
      if (pendingApplication) {
        try {
          const applicationData = JSON.parse(pendingApplication);

          // フォームデータをセット
          setEditingPartner({
            applicationId: applicationData.applicationId,
            username: '', // 新規登録なので空
            loginEmail: applicationData.email,
            companyName: applicationData.companyName,
            phone: applicationData.phone,
            address: applicationData.address,
            representativeName: applicationData.representativeName,
            websiteUrl: applicationData.websiteUrl,
            businessDescription: applicationData.businessDescription,
            appealText: applicationData.selfPr,
            prefectures: applicationData.prefectures
          });

          setIsFormModalOpen(true);

          // セッションストレージをクリア
          sessionStorage.removeItem('pendingPartnerApplication');

          // URLパラメータをクリア
          window.history.replaceState({}, '', '/admin-dashboard/partners');
        } catch (error) {
          console.error('Failed to load application data:', error);
        }
      }
    }
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (partnerFilter === "表示") params.append('status', 'active');
      if (partnerFilter === "非表示") params.append('status', 'inactive');
      if (partnerSearch) params.append('search', partnerSearch);

      const response = await fetch(`/api/admin/partners?${params}`);
      const data = await response.json();

      if (data.success) {
        setPartners(data.data);
        setError(null);
      } else {
        setError(data.error || '加盟店の取得に失敗しました');
      }
    } catch (err) {
      setError('加盟店の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerStatusChange = async (partnerId: number, newStatus: string) => {
    try {
      const isActive = newStatus === "表示";

      const response = await fetch('/api/admin/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId, isActive })
      });

      const data = await response.json();

      if (data.success) {
        setPartners(partners.map(partner =>
          partner.id === partnerId ? { ...partner, status: newStatus, isActive } : partner
        ));
      } else {
        alert(data.error || 'ステータス更新に失敗しました');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('ステータス更新に失敗しました');
    }
  };

  const handleCreatePartner = async (formData: any) => {
    try {
      const response = await fetch('/api/admin/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // 申請からの登録の場合、申請ステータスを承認に更新
        if (editingPartner?.applicationId) {
          try {
            await fetch('/api/admin/applications', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                applicationId: editingPartner.applicationId,
                status: 'APPROVED',
                reviewedBy: adminId
              })
            });
          } catch (err) {
            console.error('Failed to update application status:', err);
          }
        }

        alert(data.message || '加盟店を登録しました');
        fetchPartners();
        setIsFormModalOpen(false);
        setEditingPartner(null);
      } else {
        alert(data.error || '加盟店の登録に失敗しました');
      }
    } catch (err) {
      console.error('Create error:', err);
      alert('加盟店の登録に失敗しました');
    }
  };

  const handleUpdatePartner = async (formData: any) => {
    try {
      const response = await fetch('/api/admin/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId: editingPartner.id, ...formData })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || '加盟店情報を更新しました');
        fetchPartners();
        setIsFormModalOpen(false);
        setEditingPartner(null);
      } else {
        alert(data.error || '加盟店の更新に失敗しました');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('加盟店の更新に失敗しました');
    }
  };

  const handleDeletePartner = async (partnerId: number, companyName: string) => {
    if (!confirm(`本当に「${companyName}」を削除しますか？この操作は取り消せません。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/partners?id=${partnerId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || '加盟店を削除しました');
        fetchPartners();
      } else {
        alert(data.error || '加盟店の削除に失敗しました');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('加盟店の削除に失敗しました');
    }
  };

  const openDetailModal = (partnerId: number) => {
    setSelectedPartnerId(partnerId);
    setIsDetailModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingPartner(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (partner: any) => {
    setEditingPartner(partner);
    setIsDetailModalOpen(false);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">加盟店管理</h2>
        </div>

        {/* ツールバー */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <button
                onClick={openCreateModal}
                className="w-full sm:w-auto bg-gray-800 text-white px-4 py-3 min-h-[44px] rounded-md text-sm font-medium hover:bg-gray-700 active:bg-gray-900 transition-colors"
              >
                新規追加
              </button>
              <select
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-3 min-h-[44px] border border-gray-300 rounded-md text-sm"
              >
                <option value="すべて">すべて</option>
                <option value="表示">表示</option>
                <option value="非表示">非表示</option>
              </select>
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={partnerSearch}
                  onChange={(e) => setPartnerSearch(e.target.value)}
                  placeholder="会社名、メールアドレスで検索..."
                  className="w-full pl-3 pr-10 py-3 min-h-[44px] border border-gray-300 rounded-md text-sm"
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-2xl font-bold text-blue-500">{partners.length}</div>
              <div className="text-sm text-gray-500">登録加盟店数</div>
            </div>
          </div>
        </div>

        {/* テーブル */}
        <div className="p-4 sm:p-0">
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchPartners}
                className="mt-4 px-4 py-3 min-h-[44px] bg-primary text-primary-foreground rounded-md hover:bg-primary/90 active:bg-primary/80 transition-colors"
              >
                再読み込み
              </button>
            </div>
          ) : (
            <ResponsiveTable
              data={partners}
              keyField="id"
              isLoading={loading}
              emptyMessage="加盟店が見つかりません"
              columns={[
                {
                  key: "companyName",
                  label: "会社名",
                  priority: 10,
                  render: (p) => <span className="font-medium">{p.companyName}</span>,
                },
                {
                  key: "email",
                  label: "メールアドレス",
                  hideOnMobile: true,
                },
                {
                  key: "phone",
                  label: "電話番号",
                  priority: 8,
                },
                {
                  key: "prefectures",
                  label: "対応都道府県",
                  priority: 7,
                  render: (p) => (
                    <div className="flex flex-wrap gap-1">
                      {p.prefectures.slice(0, 2).map((pref, idx) => (
                        <span key={idx} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {PREFECTURE_NAMES[pref] || pref}
                        </span>
                      ))}
                      {p.prefectures.length > 2 && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{p.prefectures.length - 2}
                        </span>
                      )}
                    </div>
                  ),
                },
                {
                  key: "status",
                  label: "ステータス",
                  priority: 9,
                  render: (p) => (
                    <select
                      value={p.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handlePartnerStatusChange(p.id, e.target.value)}
                      className={`px-3 py-2 min-h-[36px] text-xs font-medium rounded-md border-0 ${
                        p.status === "表示"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <option value="表示">表示</option>
                      <option value="非表示">非表示</option>
                    </select>
                  ),
                },
                {
                  key: "registrationDate",
                  label: "作成日",
                  hideOnMobile: true,
                },
              ]}
              onRowClick={(p) => openDetailModal(p.id)}
              mobileCardTitle={(p) => (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{p.companyName}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    p.status === "表示" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {p.status}
                  </span>
                </div>
              )}
              mobileCardActions={(p) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => openDetailModal(p.id)}
                    className="flex-1 py-2 text-center text-primary font-medium min-h-[44px] hover:bg-primary/10 rounded transition-colors"
                  >
                    詳細
                  </button>
                  <button
                    onClick={() => handleDeletePartner(p.id, p.companyName)}
                    className="flex-1 py-2 text-center text-red-600 font-medium min-h-[44px] hover:bg-red-50 rounded transition-colors"
                  >
                    削除
                  </button>
                </div>
              )}
            />
          )}
        </div>
      </div>

      {/* モーダル */}
      <PartnerFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingPartner(null);
        }}
        onSubmit={editingPartner?.id ? handleUpdatePartner : handleCreatePartner}
        partner={editingPartner}
      />

      <PartnerDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPartnerId(null);
        }}
        partnerId={selectedPartnerId}
        onEdit={openEditModal}
      />
    </div>
  );
};

export default PartnersView;
