'use client';

import { useState, useEffect } from 'react';

interface PartnerSettings {
  id: number;
  partner_id: number;
  company_name: string;
  phone_number: string;
  address: string;
  representative_name: string;
  fax_number: string | null;
  website_url: string | null;
  invoice_registration_number: string | null;
  bank_name: string | null;
  bank_branch_name: string | null;
  bank_account_type: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
}

export default function PartnerSettingsPage() {
  const [settings, setSettings] = useState<PartnerSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // フォームデータ
  const [formData, setFormData] = useState({
    company_name: '',
    phone_number: '',
    address: '',
    representative_name: '',
    fax_number: '',
    website_url: '',
    invoice_registration_number: '',
    bank_name: '',
    bank_branch_name: '',
    bank_account_type: '',
    bank_account_number: '',
    bank_account_holder: '',
  });

  // 設定データを取得
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/partner/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setFormData({
          company_name: data.company_name || '',
          phone_number: data.phone_number || '',
          address: data.address || '',
          representative_name: data.representative_name || '',
          fax_number: data.fax_number || '',
          website_url: data.website_url || '',
          invoice_registration_number: data.invoice_registration_number || '',
          bank_name: data.bank_name || '',
          bank_branch_name: data.bank_branch_name || '',
          bank_account_type: data.bank_account_type || '',
          bank_account_number: data.bank_account_number || '',
          bank_account_holder: data.bank_account_holder || '',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: '設定の取得に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/partner/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setMessage({ type: 'success', text: '設定を保存しました' });
      } else {
        setMessage({ type: 'error', text: '設定の保存に失敗しました' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: '設定の保存に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">加盟店設定</h1>

      {message && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* 基本情報 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">基本情報</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                会社名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                代表者名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="representative_name"
                value={formData.representative_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                住所 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">FAX番号</label>
                <input
                  type="tel"
                  name="fax_number"
                  value={formData.fax_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ウェブサイトURL</label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* インボイス情報 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">インボイス情報</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">インボイス登録番号</label>
            <input
              type="text"
              name="invoice_registration_number"
              value={formData.invoice_registration_number}
              onChange={handleChange}
              placeholder="T1234567890123"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
            <p className="text-sm text-gray-500 mt-1">
              適格請求書発行事業者の登録番号（T + 13桁の数字）
            </p>
          </div>
        </div>

        {/* 銀行口座情報 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">銀行口座情報</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">銀行名</label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  placeholder="例：三菱UFJ銀行"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">支店名</label>
                <input
                  type="text"
                  name="bank_branch_name"
                  value={formData.bank_branch_name}
                  onChange={handleChange}
                  placeholder="例：東京支店"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">口座種別</label>
                <select
                  name="bank_account_type"
                  value={formData.bank_account_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="">選択してください</option>
                  <option value="普通">普通</option>
                  <option value="当座">当座</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">口座番号</label>
                <input
                  type="text"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleChange}
                  placeholder="1234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">口座名義</label>
              <input
                type="text"
                name="bank_account_holder"
                value={formData.bank_account_holder}
                onChange={handleChange}
                placeholder="カ）サンプルカイシャ"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <p className="text-sm text-gray-500 mt-1">
                カタカナで入力してください
              </p>
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {saving ? '保存中...' : '保存する'}
          </button>
        </div>
      </form>
    </div>
  );
}

