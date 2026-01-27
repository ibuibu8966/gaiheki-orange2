'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BankSettings {
  bank_name: string;
  branch_name: string;
  account_type: string;
  account_number: string;
  account_holder: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BankSettings>({
    bank_name: '',
    branch_name: '',
    account_type: '普通',
    account_number: '',
    account_holder: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      const data = await res.json();

      if (data.success) {
        setSettings({
          bank_name: data.data.bank_name || '',
          branch_name: data.data.branch_name || '',
          account_type: data.data.account_type || '普通',
          account_number: data.data.account_number || '',
          account_holder: data.data.account_holder || '',
        });
      }
    } catch (error) {
      console.error('設定の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: '設定を保存しました' });
      } else {
        setMessage({ type: 'error', text: data.error || '保存に失敗しました' });
      }
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      setMessage({ type: 'error', text: '保存に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">システム設定</h2>
          <p className="text-sm text-gray-500 mt-1">
            加盟店が保証金を振り込む際に表示される銀行口座情報を設定します
          </p>
        </div>

        <div className="px-4 sm:px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bank_name">銀行名</Label>
              <Input
                id="bank_name"
                value={settings.bank_name}
                onChange={(e) =>
                  setSettings({ ...settings, bank_name: e.target.value })
                }
                placeholder="例: 三菱UFJ銀行"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch_name">支店名</Label>
              <Input
                id="branch_name"
                value={settings.branch_name}
                onChange={(e) =>
                  setSettings({ ...settings, branch_name: e.target.value })
                }
                placeholder="例: 渋谷支店"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_type">口座種別</Label>
              <Select
                value={settings.account_type}
                onValueChange={(value) =>
                  setSettings({ ...settings, account_type: value })
                }
              >
                <SelectTrigger id="account_type" className="min-h-[44px]">
                  <SelectValue placeholder="口座種別を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="普通">普通</SelectItem>
                  <SelectItem value="当座">当座</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">口座番号</Label>
              <Input
                id="account_number"
                value={settings.account_number}
                onChange={(e) =>
                  setSettings({ ...settings, account_number: e.target.value })
                }
                placeholder="例: 1234567"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="account_holder">口座名義</Label>
              <Input
                id="account_holder"
                value={settings.account_holder}
                onChange={(e) =>
                  setSettings({ ...settings, account_holder: e.target.value })
                }
                placeholder="例: ガイヘキオレンジ（カ"
              />
              <p className="text-xs text-gray-500">
                カタカナで入力してください
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">プレビュー</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="text-gray-500">銀行名:</span>{' '}
                  {settings.bank_name || '未設定'}
                </p>
                <p>
                  <span className="text-gray-500">支店名:</span>{' '}
                  {settings.branch_name || '未設定'}
                </p>
                <p>
                  <span className="text-gray-500">口座種別:</span>{' '}
                  {settings.account_type}
                </p>
                <p>
                  <span className="text-gray-500">口座番号:</span>{' '}
                  {settings.account_number || '未設定'}
                </p>
                <p>
                  <span className="text-gray-500">口座名義:</span>{' '}
                  {settings.account_holder || '未設定'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto min-h-[44px]">
              {saving ? '保存中...' : '設定を保存'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
