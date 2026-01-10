"use client";

import { useState, useEffect } from "react";

interface PartnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  partner?: any;
}

const PREFECTURES = [
  'Hokkaido', 'Aomori', 'Iwate', 'Miyagi', 'Akita', 'Yamagata', 'Fukushima',
  'Ibaraki', 'Tochigi', 'Gunma', 'Saitama', 'Chiba', 'Tokyo', 'Kanagawa',
  'Niigata', 'Toyama', 'Ishikawa', 'Fukui', 'Yamanashi', 'Nagano',
  'Gifu', 'Shizuoka', 'Aichi', 'Mie',
  'Shiga', 'Kyoto', 'Osaka', 'Hyogo', 'Nara', 'Wakayama',
  'Tottori', 'Shimane', 'Okayama', 'Hiroshima', 'Yamaguchi',
  'Tokushima', 'Kagawa', 'Ehime', 'Kochi',
  'Fukuoka', 'Saga', 'Nagasaki', 'Kumamoto', 'Oita', 'Miyazaki', 'Kagoshima', 'Okinawa'
];

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

const PartnerFormModal = ({ isOpen, onClose, onSubmit, partner }: PartnerFormModalProps) => {
  const [formData, setFormData] = useState({
    username: '',
    loginEmail: '',
    password: '',
    companyName: '',
    phone: '',
    address: '',
    representativeName: '',
    prefectures: [] as string[],
    businessDescription: '',
    appealText: '',
    websiteUrl: '',
    faxNumber: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (partner) {
      setFormData({
        username: partner.username || '',
        loginEmail: partner.loginEmail || '',
        password: '',
        companyName: partner.companyName || '',
        phone: partner.phone || '',
        address: partner.address || '',
        representativeName: partner.representativeName || '',
        prefectures: partner.prefectures || [],
        businessDescription: partner.businessDescription || '',
        appealText: partner.appealText || '',
        websiteUrl: partner.websiteUrl || '',
        faxNumber: partner.fax || ''
      });
    } else {
      // 新規登録の場合はフォームをリセット
      setFormData({
        username: '',
        loginEmail: '',
        password: '',
        companyName: '',
        phone: '',
        address: '',
        representativeName: '',
        prefectures: [],
        businessDescription: '',
        appealText: '',
        websiteUrl: '',
        faxNumber: ''
      });
    }
  }, [partner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePrefecture = (pref: string) => {
    setFormData(prev => ({
      ...prev,
      prefectures: prev.prefectures.includes(pref)
        ? prev.prefectures.filter(p => p !== pref)
        : [...prev.prefectures, pref]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            {partner ? '加盟店編集' : '新規加盟店登録'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ログイン情報 */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900">ログイン情報</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ユーザー名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={partner && partner.id !== undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ログインメールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.loginEmail}
                  onChange={(e) => setFormData({ ...formData, loginEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード {!partner && <span className="text-red-500">*</span>}
                  {partner && <span className="text-xs text-gray-500">（変更する場合のみ入力）</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required={!partner}
                />
              </div>
            </div>
          </div>

          {/* 基本情報 */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900">基本情報</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  会社名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  FAX番号
                </label>
                <input
                  type="tel"
                  value={formData.faxNumber}
                  onChange={(e) => setFormData({ ...formData, faxNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  住所
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  代表者名
                </label>
                <input
                  type="text"
                  value={formData.representativeName}
                  onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ウェブサイトURL
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* 対応都道府県 */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900">対応都道府県</h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {PREFECTURES.map(pref => (
                <label key={pref} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.prefectures.includes(pref)}
                    onChange={() => togglePrefecture(pref)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">{PREFECTURE_NAMES[pref]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 事業内容とアピール文 */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-900">詳細情報</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  事業内容
                </label>
                <textarea
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  アピール文章
                </label>
                <textarea
                  value={formData.appealText}
                  onChange={(e) => setFormData({ ...formData, appealText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? '処理中...' : partner ? '更新' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartnerFormModal;
