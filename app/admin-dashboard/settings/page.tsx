'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/Admin/Common/AdminSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface FeePlan {
  id: number;
  name: string;
  monthly_fee: number | null;
  per_order_fee: number | null;
  per_project_fee: number | null;
  project_fee_rate: number | null;
  is_default: boolean;
}

interface SystemSettings {
  billing_cycle_closing_day: number;
  billing_cycle_payment_day: number;
  tax_rate: number;
}

interface CompanySettings {
  id: number;
  company_name: string;
  postal_code: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  invoice_registration_number: string | null;
  bank_name: string | null;
  bank_branch_name: string | null;
  bank_account_type: string | null;
  bank_account_number: string | null;
  bank_account_holder: string | null;
}

export default function SettingsPage() {
  const [feePlans, setFeePlans] = useState<FeePlan[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<FeePlan | null>(null);
  const [newPlan, setNewPlan] = useState<Partial<FeePlan>>({
    name: '',
    monthly_fee: null,
    per_order_fee: null,
    per_project_fee: null,
    project_fee_rate: null,
    is_default: false,
  });

  useEffect(() => {
    fetchFeePlans();
    fetchSystemSettings();
    fetchCompanySettings();
  }, []);

  const fetchFeePlans = async () => {
    try {
      const res = await fetch('/api/admin/settings/fee-plans');
      const data = await res.json();

      if (data.success) {
        setFeePlans(data.data.plans);
      }
    } catch (error) {
      console.error('料金プラン一覧の取得に失敗しました:', error);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings/system');
      const data = await res.json();

      if (data.success) {
        setSystemSettings(data.data);
      }
    } catch (error) {
      console.error('システム設定の取得に失敗しました:', error);
    }
  };

  const fetchCompanySettings = async () => {
    try {
      const res = await fetch('/api/admin/settings/company');
      const data = await res.json();

      if (data.success && data.data) {
        setCompanySettings(data.data);
      } else {
        // 初期値設定
        setCompanySettings({
          id: 0,
          company_name: '',
          postal_code: '',
          address: '',
          phone: '',
          email: '',
          invoice_registration_number: '',
          bank_name: '',
          bank_branch_name: '',
          bank_account_type: '普通',
          bank_account_number: '',
          bank_account_holder: '',
        });
      }
    } catch (error) {
      console.error('会社情報の取得に失敗しました:', error);
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlan.name) {
      alert('プラン名を入力してください');
      return;
    }

    try {
      const res = await fetch('/api/admin/settings/fee-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlan),
      });

      const data = await res.json();

      if (data.success) {
        alert('料金プランを作成しました');
        setIsCreateModalOpen(false);
        setNewPlan({
          name: '',
          monthly_fee: null,
          per_order_fee: null,
          per_project_fee: null,
          project_fee_rate: null,
          is_default: false,
        });
        fetchFeePlans();
      } else {
        alert(data.error || '料金プランの作成に失敗しました');
      }
    } catch (error) {
      console.error('料金プラン作成エラー:', error);
      alert('料金プランの作成に失敗しました');
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan || !editingPlan.name) {
      alert('プラン名を入力してください');
      return;
    }

    try {
      const res = await fetch(`/api/admin/settings/fee-plans/${editingPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingPlan.name,
          monthly_fee: editingPlan.monthly_fee,
          per_order_fee: editingPlan.per_order_fee,
          per_project_fee: editingPlan.per_project_fee,
          project_fee_rate: editingPlan.project_fee_rate,
          is_default: editingPlan.is_default,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('料金プランを更新しました');
        setIsEditModalOpen(false);
        setEditingPlan(null);
        fetchFeePlans();
      } else {
        alert(data.error || '料金プランの更新に失敗しました');
      }
    } catch (error) {
      console.error('料金プラン更新エラー:', error);
      alert('料金プランの更新に失敗しました');
    }
  };

  const handleUpdateSystemSettings = async () => {
    if (!systemSettings) return;

    try {
      const res = await fetch('/api/admin/settings/system', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(systemSettings),
      });

      const data = await res.json();

      if (data.success) {
        alert('システム設定を更新しました');
        fetchSystemSettings();
      } else {
        alert(data.error || 'システム設定の更新に失敗しました');
      }
    } catch (error) {
      console.error('システム設定更新エラー:', error);
      alert('システム設定の更新に失敗しました');
    }
  };

  const handleUpdateCompanySettings = async () => {
    if (!companySettings) return;

    if (!companySettings.company_name) {
      alert('会社名を入力してください');
      return;
    }

    try {
      const res = await fetch('/api/admin/settings/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companySettings),
      });

      const data = await res.json();

      if (data.success) {
        alert('会社情報を更新しました');
        fetchCompanySettings();
      } else {
        alert(data.error || '会社情報の更新に失敗しました');
      }
    } catch (error) {
      console.error('会社情報更新エラー:', error);
      alert('会社情報の更新に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 min-w-0 overflow-y-auto h-screen">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">設定</h1>

          <Tabs defaultValue="fee-plans">
        <TabsList className="bg-white border border-gray-200 shadow-sm">
          <TabsTrigger value="fee-plans" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">料金プラン設定</TabsTrigger>
          <TabsTrigger value="company" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">運営会社情報</TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">システム設定</TabsTrigger>
        </TabsList>

        <TabsContent value="fee-plans">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-gray-800">料金プラン一覧</CardTitle>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">新規作成</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>料金プラン作成</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>プラン名</Label>
                        <Input
                          value={newPlan.name}
                          onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>月額固定（円）</Label>
                        <Input
                          type="number"
                          value={newPlan.monthly_fee || ''}
                          onChange={(e) =>
                            setNewPlan({
                              ...newPlan,
                              monthly_fee: e.target.value ? parseInt(e.target.value) : null,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>受注ごと（円）</Label>
                        <Input
                          type="number"
                          value={newPlan.per_order_fee || ''}
                          onChange={(e) =>
                            setNewPlan({
                              ...newPlan,
                              per_order_fee: e.target.value ? parseInt(e.target.value) : null,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>施工完了ごと固定（円）</Label>
                        <Input
                          type="number"
                          value={newPlan.per_project_fee || ''}
                          onChange={(e) =>
                            setNewPlan({
                              ...newPlan,
                              per_project_fee: e.target.value ? parseInt(e.target.value) : null,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>施工完了料率（0.05 = 5%）</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newPlan.project_fee_rate || ''}
                          onChange={(e) =>
                            setNewPlan({
                              ...newPlan,
                              project_fee_rate: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newPlan.is_default || false}
                          onChange={(e) =>
                            setNewPlan({ ...newPlan, is_default: e.target.checked })
                          }
                        />
                        <Label>デフォルトプランに設定</Label>
                      </div>
                      <Button onClick={handleCreatePlan} className="w-full">
                        作成
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">プラン名</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">月額固定</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">受注ごと</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">施工完了ごと</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">施工完了料率</TableHead>
                    <TableHead className="font-semibold text-gray-700">デフォルト</TableHead>
                    <TableHead className="font-semibold text-gray-700">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feePlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell className="text-right">
                        {plan.monthly_fee ? `¥${plan.monthly_fee.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {plan.per_order_fee ? `¥${plan.per_order_fee.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {plan.per_project_fee ? `¥${plan.per_project_fee.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {plan.project_fee_rate
                          ? `${(plan.project_fee_rate * 100).toFixed(1)}%`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {plan.is_default && <Badge>デフォルト</Badge>}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => {
                            setEditingPlan(plan);
                            setIsEditModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                        >
                          編集
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* 編集モーダル */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>料金プラン編集</DialogTitle>
              </DialogHeader>
              {editingPlan && (
                <div className="space-y-4">
                  <div>
                    <Label>プラン名</Label>
                    <Input
                      value={editingPlan.name}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>月額固定（円）</Label>
                    <Input
                      type="number"
                      value={editingPlan.monthly_fee || ''}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          monthly_fee: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>受注ごと（円）</Label>
                    <Input
                      type="number"
                      value={editingPlan.per_order_fee || ''}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          per_order_fee: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>施工完了ごと固定（円）</Label>
                    <Input
                      type="number"
                      value={editingPlan.per_project_fee || ''}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          per_project_fee: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>施工完了料率（0.05 = 5%）</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingPlan.project_fee_rate || ''}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          project_fee_rate: e.target.value ? parseFloat(e.target.value) : null,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingPlan.is_default}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, is_default: e.target.checked })
                      }
                    />
                    <Label>デフォルトプランに設定</Label>
                  </div>
                  <Button onClick={handleUpdatePlan} className="w-full">
                    更新
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="company">
          {companySettings && (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <CardTitle className="text-xl font-bold text-gray-800">運営会社情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* 基本情報 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">基本情報</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">会社名 <span className="text-red-500">*</span></Label>
                      <Input
                        value={companySettings.company_name}
                        onChange={(e) => setCompanySettings({ ...companySettings, company_name: e.target.value })}
                        className="mt-1.5 border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">郵便番号</Label>
                      <Input
                        value={companySettings.postal_code || ''}
                        onChange={(e) => setCompanySettings({ ...companySettings, postal_code: e.target.value })}
                        placeholder="123-4567"
                        className="mt-1.5 border-gray-300 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">住所</Label>
                    <Input
                      value={companySettings.address || ''}
                      onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                      className="mt-1.5 border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">電話番号</Label>
                      <Input
                        value={companySettings.phone || ''}
                        onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                        placeholder="03-1234-5678"
                        className="mt-1.5 border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">メールアドレス</Label>
                      <Input
                        type="email"
                        value={companySettings.email || ''}
                        onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                        className="mt-1.5 border-gray-300 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* インボイス情報 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">インボイス情報</h3>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">適格請求書発行事業者登録番号</Label>
                    <Input
                      value={companySettings.invoice_registration_number || ''}
                      onChange={(e) => setCompanySettings({ ...companySettings, invoice_registration_number: e.target.value })}
                      placeholder="T1234567890123"
                      className="mt-1.5 border-gray-300 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">Tから始まる13桁の番号</p>
                  </div>
                </div>

                {/* 振込先情報 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">振込先情報</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">銀行名</Label>
                      <Input
                        value={companySettings.bank_name || ''}
                        onChange={(e) => setCompanySettings({ ...companySettings, bank_name: e.target.value })}
                        className="mt-1.5 border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">支店名</Label>
                      <Input
                        value={companySettings.bank_branch_name || ''}
                        onChange={(e) => setCompanySettings({ ...companySettings, bank_branch_name: e.target.value })}
                        className="mt-1.5 border-gray-300 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">口座種別</Label>
                      <select
                        value={companySettings.bank_account_type || '普通'}
                        onChange={(e) => setCompanySettings({ ...companySettings, bank_account_type: e.target.value })}
                        className="mt-1.5 w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500"
                      >
                        <option value="普通">普通</option>
                        <option value="当座">当座</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">口座番号</Label>
                      <Input
                        value={companySettings.bank_account_number || ''}
                        onChange={(e) => setCompanySettings({ ...companySettings, bank_account_number: e.target.value })}
                        className="mt-1.5 border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">口座名義</Label>
                      <Input
                        value={companySettings.bank_account_holder || ''}
                        onChange={(e) => setCompanySettings({ ...companySettings, bank_account_holder: e.target.value })}
                        className="mt-1.5 border-gray-300 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleUpdateCompanySettings} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                  会社情報を保存
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="system">
          {systemSettings && (
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <CardTitle className="text-xl font-bold text-gray-800">システム設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">請求締め日</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={systemSettings.billing_cycle_closing_day}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        billing_cycle_closing_day: parseInt(e.target.value),
                      })
                    }
                    className="mt-1.5 border-gray-300 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">月末の場合は31を入力</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">支払期日（翌月の日付）</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={systemSettings.billing_cycle_payment_day}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        billing_cycle_payment_day: parseInt(e.target.value),
                      })
                    }
                    className="mt-1.5 border-gray-300 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">例: 20日払いの場合は20を入力</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">消費税率</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={systemSettings.tax_rate}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        tax_rate: parseFloat(e.target.value),
                      })
                    }
                    className="mt-1.5 border-gray-300 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">10%の場合は0.10を入力</p>
                </div>
                <Button onClick={handleUpdateSystemSettings} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">設定を保存</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
