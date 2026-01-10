"use client";

import { useState, useEffect } from "react";

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

const PREFECTURES = Object.keys(PREFECTURE_MAP);

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    representativeName: "",
    phone: "",
    fax: "",
    website: "",
    address: "",
    businessHours: "",
    holidays: "",
    businessContent: "",
    appeal: "",
    loginEmail: "",
    newPassword: "",
    confirmPassword: "",
    serviceAreas: [] as string[],
    invoiceRegistrationNumber: "",
    bankName: "",
    bankBranchName: "",
    bankAccountType: "",
    bankAccountNumber: "",
    bankAccountHolder: ""
  });

  const [stats, setStats] = useState({
    rating: 0,
    reviewCount: 0,
    workCount: 0
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/partner/profile');
      const data = await response.json();

      if (data.success) {
        const profile = data.data;
        setFormData({
          companyName: profile.companyName,
          representativeName: profile.representativeName,
          phone: profile.phone,
          fax: profile.fax,
          website: profile.website,
          address: profile.address,
          businessHours: profile.businessHours,
          holidays: profile.holidays,
          businessContent: profile.businessContent,
          appeal: profile.appeal,
          loginEmail: profile.loginEmail,
          newPassword: "",
          confirmPassword: "",
          serviceAreas: profile.serviceAreas,
          invoiceRegistrationNumber: profile.invoiceRegistrationNumber || "",
          bankName: profile.bankName || "",
          bankBranchName: profile.bankBranchName || "",
          bankAccountType: profile.bankAccountType || "",
          bankAccountNumber: profile.bankAccountNumber || "",
          bankAccountHolder: profile.bankAccountHolder || ""
        });

        setStats({
          rating: profile.rating,
          reviewCount: profile.reviewCount,
          workCount: profile.workCount
        });
      } else {
        alert(data.error || 'プロフィール情報の取得に失敗しました');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      alert('プロフィール情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // パスワード確認
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/partner/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          representativeName: formData.representativeName,
          phone: formData.phone,
          fax: formData.fax,
          website: formData.website,
          address: formData.address,
          businessHours: formData.businessHours,
          holidays: formData.holidays,
          businessContent: formData.businessContent,
          appeal: formData.appeal,
          loginEmail: formData.loginEmail,
          newPassword: formData.newPassword,
          serviceAreas: formData.serviceAreas,
          invoiceRegistrationNumber: formData.invoiceRegistrationNumber,
          bankName: formData.bankName,
          bankBranchName: formData.bankBranchName,
          bankAccountType: formData.bankAccountType,
          bankAccountNumber: formData.bankAccountNumber,
          bankAccountHolder: formData.bankAccountHolder
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('会社情報を更新しました');
        setIsEditMode(false);
        setFormData(prev => ({
          ...prev,
          newPassword: "",
          confirmPassword: ""
        }));
        await fetchProfile();
      } else {
        alert(data.error || '更新に失敗しました');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const togglePrefecture = (prefEn: string) => {
    setFormData(prev => ({
      ...prev,
      serviceAreas: prev.serviceAreas.includes(prefEn)
        ? prev.serviceAreas.filter(p => p !== prefEn)
        : [...prev.serviceAreas, prefEn]
    }));
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
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">会社情報</h2>
            <p className="text-gray-600 mt-2">お客様に表示される会社情報を管理できます。</p>
          </div>
          {!isEditMode ? (
            <button
              onClick={() => setIsEditMode(true)}
              className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
            >
              編集
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditMode(false);
                  fetchProfile();
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 基本情報 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">基本情報</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">会社名</label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      />
                    ) : (
                      <div className="text-gray-900">{formData.companyName}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">代表者名</label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={formData.representativeName}
                        onChange={(e) => setFormData({...formData, representativeName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      />
                    ) : (
                      <div className="text-gray-900">{formData.representativeName}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">
                      メールアドレス
                      <span className="ml-2 text-xs text-gray-500">(ログインメールと同じ)</span>
                    </label>
                    <div className="text-gray-900 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                      {formData.loginEmail}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">電話番号</label>
                    {isEditMode ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      />
                    ) : (
                      <div className="text-gray-900">{formData.phone}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">FAX番号</label>
                    {isEditMode ? (
                      <input
                        type="tel"
                        value={formData.fax}
                        onChange={(e) => setFormData({...formData, fax: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      />
                    ) : (
                      <div className="text-gray-900">{formData.fax}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">ウェブサイト</label>
                    {isEditMode ? (
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      />
                    ) : (
                      <div className="text-blue-600">{formData.website}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">住所</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  ) : (
                    <div className="text-gray-900">{formData.address}</div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">営業時間</label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={formData.businessHours}
                        onChange={(e) => setFormData({...formData, businessHours: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      />
                    ) : (
                      <div className="text-gray-900">{formData.businessHours}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 font-medium mb-1">定休日</label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={formData.holidays}
                        onChange={(e) => setFormData({...formData, holidays: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      />
                    ) : (
                      <div className="text-gray-900">{formData.holidays}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">事業内容</label>
                  {isEditMode ? (
                    <textarea
                      value={formData.businessContent}
                      onChange={(e) => setFormData({...formData, businessContent: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  ) : (
                    <div className="text-gray-900">{formData.businessContent}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">アピール文章</label>
                  {isEditMode ? (
                    <textarea
                      value={formData.appeal}
                      onChange={(e) => setFormData({...formData, appeal: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  ) : (
                    <div className="text-gray-900">{formData.appeal}</div>
                  )}
                </div>
              </div>
            </div>

            {/* ログイン情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">ログイン情報</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">ログインメールアドレス</label>
                  {isEditMode ? (
                    <input
                      type="email"
                      value={formData.loginEmail}
                      onChange={(e) => setFormData({...formData, loginEmail: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  ) : (
                    <div className="text-gray-900">{formData.loginEmail}</div>
                  )}
                </div>
                {isEditMode && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-700 font-medium mb-1">新しいパスワード</label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        placeholder="変更する場合のみ入力"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 font-medium mb-1">パスワード確認</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        placeholder="パスワードを再入力"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 請求書情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">請求書情報</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 font-medium mb-1">
                    インボイス登録番号
                    <span className="ml-2 text-xs text-gray-500">(適格請求書発行事業者登録番号)</span>
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={formData.invoiceRegistrationNumber}
                      onChange={(e) => setFormData({...formData, invoiceRegistrationNumber: e.target.value})}
                      placeholder="T1234567890123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  ) : (
                    <div className="text-gray-900">{formData.invoiceRegistrationNumber || '未設定'}</div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">振込口座情報</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">銀行名</label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={formData.bankName}
                            onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                            placeholder="例: 三菱UFJ銀行"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                          />
                        ) : (
                          <div className="text-gray-900">{formData.bankName || '未設定'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">支店名</label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={formData.bankBranchName}
                            onChange={(e) => setFormData({...formData, bankBranchName: e.target.value})}
                            placeholder="例: 新宿支店"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                          />
                        ) : (
                          <div className="text-gray-900">{formData.bankBranchName || '未設定'}</div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">口座種別</label>
                        {isEditMode ? (
                          <select
                            value={formData.bankAccountType}
                            onChange={(e) => setFormData({...formData, bankAccountType: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                          >
                            <option value="">選択してください</option>
                            <option value="普通">普通</option>
                            <option value="当座">当座</option>
                          </select>
                        ) : (
                          <div className="text-gray-900">{formData.bankAccountType || '未設定'}</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 font-medium mb-1">口座番号</label>
                        {isEditMode ? (
                          <input
                            type="text"
                            value={formData.bankAccountNumber}
                            onChange={(e) => setFormData({...formData, bankAccountNumber: e.target.value})}
                            placeholder="1234567"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                          />
                        ) : (
                          <div className="text-gray-900">{formData.bankAccountNumber || '未設定'}</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 font-medium mb-1">口座名義</label>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={formData.bankAccountHolder}
                          onChange={(e) => setFormData({...formData, bankAccountHolder: e.target.value})}
                          placeholder="カ）ヤマダトソウ"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        />
                      ) : (
                        <div className="text-gray-900">{formData.bankAccountHolder || '未設定'}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* サイドバー情報 */}
          <div className="space-y-6">
            {/* 実績・評価 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">実績・評価</h3>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-orange-500">{stats.rating.toFixed(1)}</div>
                <div className="flex justify-center items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className={`w-4 h-4 ${star <= Math.floor(stats.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                  ))}
                </div>
                <div className="text-sm text-gray-600">{stats.reviewCount}件のレビュー</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{stats.workCount}件</div>
                <div className="text-sm text-gray-600">施工実績</div>
              </div>
            </div>

            {/* 対応エリア */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">対応エリア</h3>
              {isEditMode ? (
                <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {PREFECTURES.map(prefEn => (
                    <label key={prefEn} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.serviceAreas.includes(prefEn)}
                        onChange={() => togglePrefecture(prefEn)}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-900">{PREFECTURE_MAP[prefEn]}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.serviceAreas.map(prefEn => (
                    <span key={prefEn} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {PREFECTURE_MAP[prefEn]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
