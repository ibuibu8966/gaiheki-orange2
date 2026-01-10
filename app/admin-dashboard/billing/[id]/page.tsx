'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Partner {
  id: number;
  company_name: string;
  email: string;
  phone: string;
  address: string;
}

interface InvoiceItem {
  id: number;
  description: string;
  amount: number;
  related_order_id: number | null;
}

interface Invoice {
  id: number;
  invoice_number: string;
  partner: Partner;
  billing_period_start: string;
  billing_period_end: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  status: string;
  payment_date: string | null;
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedIssueDate, setEditedIssueDate] = useState('');
  const [editedDueDate, setEditedDueDate] = useState('');
  const [editedItems, setEditedItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/invoices/${resolvedParams.id}`);
      const data = await res.json();

      if (data.success) {
        setInvoice(data.data);
        setEditedIssueDate(data.data.issue_date);
        setEditedDueDate(data.data.due_date);
        setEditedItems(data.data.items);
      }
    } catch (error) {
      console.error('請求書詳細の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string, paymentDate?: string) => {
    try {
      const body: any = { status: newStatus };
      if (paymentDate) body.payment_date = paymentDate;

      const res = await fetch(`/api/admin/invoices/${resolvedParams.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        alert('ステータスを更新しました');
        fetchInvoice();
      } else {
        alert(data.error || 'ステータスの更新に失敗しました');
      }
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const handleIssue = () => {
    if (confirm('請求書を発行しますか？')) {
      handleStatusChange('UNPAID');
    }
  };

  const handlePaid = () => {
    const today = new Date().toISOString().split('T')[0];
    if (confirm('入金確認を行いますか？')) {
      handleStatusChange('PAID', today);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (invoice) {
      setEditedIssueDate(invoice.issue_date);
      setEditedDueDate(invoice.due_date);
      setEditedItems([...invoice.items]);
    }
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/admin/invoices/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_date: editedIssueDate,
          due_date: editedDueDate,
          items: editedItems,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('請求書を更新しました');
        setIsEditing(false);
        fetchInvoice();
      } else {
        alert(data.error || '請求書の更新に失敗しました');
      }
    } catch (error) {
      console.error('更新エラー:', error);
      alert('請求書の更新に失敗しました');
    }
  };

  const handleItemChange = (index: number, field: 'description' | 'amount', value: string | number) => {
    const newItems = [...editedItems];
    if (field === 'description') {
      newItems[index].description = value as string;
    } else {
      newItems[index].amount = typeof value === 'string' ? parseInt(value) : value;
    }
    setEditedItems(newItems);
  };

  const handleAddItem = () => {
    setEditedItems([
      ...editedItems,
      { id: Date.now(), description: '', amount: 0, related_order_id: null },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setEditedItems(editedItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const items = isEditing ? editedItems : invoice?.items || [];
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = Math.floor(totalAmount * 0.1);
    const grandTotal = totalAmount + taxAmount;
    return { totalAmount, taxAmount, grandTotal };
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
      DRAFT: 'secondary',
      UNPAID: 'outline',
      PAID: 'default',
      OVERDUE: 'destructive',
      CANCELLED: 'outline',
    };

    const labels: { [key: string]: string } = {
      DRAFT: '下書き',
      UNPAID: '未払い',
      PAID: '支払い済み',
      OVERDUE: '遅延',
      CANCELLED: 'キャンセル',
    };

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
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

  if (!invoice) {
    return (
      <div className="p-6">
        <p className="text-center text-gray-600">請求書が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{invoice.invoice_number}</h1>
          <p className="text-gray-600 mt-1">{getStatusBadge(invoice.status)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            戻る
          </Button>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit}>
                キャンセル
              </Button>
              <Button onClick={handleSaveEdit}>保存</Button>
            </>
          ) : (
            <>
              {invoice.status === 'DRAFT' && (
                <>
                  <Button variant="outline" onClick={handleEdit}>
                    修正
                  </Button>
                  <Button onClick={handleIssue}>発行</Button>
                </>
              )}
              {invoice.status === 'UNPAID' && (
                <Button onClick={handlePaid}>入金確認</Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 加盟店情報 */}
      <Card>
        <CardHeader>
          <CardTitle>加盟店情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">会社名:</span> {invoice.partner.company_name}
          </div>
          <div>
            <span className="font-medium">メールアドレス:</span> {invoice.partner.email}
          </div>
          <div>
            <span className="font-medium">電話番号:</span> {invoice.partner.phone}
          </div>
          <div>
            <span className="font-medium">住所:</span> {invoice.partner.address}
          </div>
        </CardContent>
      </Card>

      {/* 請求情報 */}
      <Card>
        <CardHeader>
          <CardTitle>請求情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">請求期間:</span> {invoice.billing_period_start} 〜{' '}
            {invoice.billing_period_end}
          </div>
          <div>
            <span className="font-medium">発行日:</span>{' '}
            {isEditing ? (
              <input
                type="date"
                value={editedIssueDate}
                onChange={(e) => setEditedIssueDate(e.target.value)}
                className="ml-2 border rounded px-2 py-1"
              />
            ) : (
              invoice.issue_date
            )}
          </div>
          <div>
            <span className="font-medium">支払期日:</span>{' '}
            {isEditing ? (
              <input
                type="date"
                value={editedDueDate}
                onChange={(e) => setEditedDueDate(e.target.value)}
                className="ml-2 border rounded px-2 py-1"
              />
            ) : (
              invoice.due_date
            )}
          </div>
          {invoice.payment_date && (
            <div>
              <span className="font-medium">入金日:</span> {invoice.payment_date}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 請求項目 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>請求項目</CardTitle>
            {isEditing && (
              <Button size="sm" onClick={handleAddItem}>
                項目追加
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>項目</TableHead>
                <TableHead className="text-right">金額</TableHead>
                {isEditing && <TableHead className="w-[100px]">操作</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isEditing ? editedItems : invoice.items).map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      />
                    ) : (
                      item.description
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                        className="w-full border rounded px-2 py-1 text-right"
                      />
                    ) : (
                      `¥${item.amount.toLocaleString()}`
                    )}
                  </TableCell>
                  {isEditing && (
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveItem(index)}
                      >
                        削除
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 合計 */}
      <Card>
        <CardHeader>
          <CardTitle>合計</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>小計（税抜）:</span>
            <span className="font-medium">¥{calculateTotals().totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>消費税（10%）:</span>
            <span className="font-medium">¥{calculateTotals().taxAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>合計（税込）:</span>
            <span>¥{calculateTotals().grandTotal.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
