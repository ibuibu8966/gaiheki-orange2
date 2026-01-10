"use client";

import { useState, useEffect } from "react";
import PartnerFormModal from "./PartnerFormModal";
import PartnerDetailModal from "./PartnerDetailModal";

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
  customerCount: number;
  quotationCount: number;
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
  const [partnerFilter, setPartnerFilter] = useState("すべて");
  const [partnerSearch, setPartnerSearch] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                reviewedBy: 1 // TODO: 実際のログインユーザーIDを使用
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
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={openCreateModal}
                className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                新規追加
              </button>
              <select
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="すべて">すべて</option>
                <option value="表示">表示</option>
                <option value="非表示">非表示</option>
              </select>
              <div className="relative">
                <input
                  type="text"
                  value={partnerSearch}
                  onChange={(e) => setPartnerSearch(e.target.value)}
                  placeholder="会社名、メールアドレスで検索..."
                  className="pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm w-64"
                />
                <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-500">{partners.length}</div>
              <div className="text-sm text-gray-500">登録加盟店数</div>
            </div>
          </div>
        </div>

        {/* テーブル */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-sm text-gray-500">読み込み中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchPartners}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                再読み込み
              </button>
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">加盟店が見つかりません</p>
            </div>
          ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">会社名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メールアドレス</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">電話番号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">対応都道府県</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作成日</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {partner.companyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {partner.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {partner.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {partner.prefectures.slice(0, 2).map((pref, idx) => (
                        <span key={idx} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {PREFECTURE_NAMES[pref] || pref}
                        </span>
                      ))}
                      {partner.prefectures.length > 2 && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                          +{partner.prefectures.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={partner.status}
                      onChange={(e) => handlePartnerStatusChange(partner.id, e.target.value)}
                      className={`px-3 py-1 text-xs font-medium rounded-md border-0 ${
                        partner.status === "表示"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <option value="表示">表示</option>
                      <option value="非表示">非表示</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {partner.registrationDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDetailModal(partner.id);
                      }}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      詳細
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePartner(partner.id, partner.companyName);
                      }}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
