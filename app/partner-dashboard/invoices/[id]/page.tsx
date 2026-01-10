'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface PartnerDetails {
  company_name: string;
  address: string;
  phone_number: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  order_id: number;
  customer: Customer;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  status: string;
  payment_date: string | null;
  partner_details?: PartnerDetails;
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/partner/invoices/${resolvedParams.id}`);
      const data = await res.json();

      if (data.success) {
        setInvoice(data.data);
        setIssueDate(data.data.issue_date);
        setDueDate(data.data.due_date);
        setItems(data.data.items);
      }
    } catch (error) {
      console.error('請求書詳細の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    try {
      setPdfLoading(true);
      const response = await fetch(`/api/partner/invoices/${invoice.id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoice.invoice_number}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('PDFのダウンロードに失敗しました');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('PDFのダウンロードに失敗しました');
    } finally {
      setPdfLoading(false);
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unit_price;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit: '式', unit_price: 0, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = Math.floor(totalAmount * 0.1);
    const grandTotal = totalAmount + taxAmount;
    return { totalAmount, taxAmount, grandTotal };
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/partner/invoices/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_date: issueDate,
          due_date: dueDate,
          items: items.filter(item => item.description && item.amount > 0),
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('請求書を更新しました');
        setEditing(false);
        fetchInvoice();
      } else {
        alert(data.error || '請求書の更新に失敗しました');
      }
    } catch (error) {
      console.error('請求書更新エラー:', error);
      alert('請求書の更新に失敗しました');
    }
  };

  const handleStatusChange = async (newStatus: string, paymentDate?: string) => {
    try {
      const body: any = { status: newStatus };
      if (paymentDate) body.payment_date = paymentDate;

      const res = await fetch(`/api/partner/invoices/${resolvedParams.id}/status`, {
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
    if (confirm('請求書を発行しますか？発行後は編集できません。')) {
      handleStatusChange('UNPAID');
    }
  };

  const handlePaid = () => {
    const today = new Date().toISOString().split('T')[0];
    if (confirm('入金確認を行いますか？')) {
      handleStatusChange('PAID', today);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      DRAFT: 'bg-gray-500 text-white',
      UNPAID: 'bg-yellow-500 text-white',
      PAID: 'bg-green-600 text-white',
      OVERDUE: 'bg-red-600 text-white',
      CANCELLED: 'bg-gray-400 text-white',
    };

    const labels: { [key: string]: string } = {
      DRAFT: '下書き',
      UNPAID: '未払い',
      PAID: '支払い済み',
      OVERDUE: '遅延',
      CANCELLED: 'キャンセル',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'bg-gray-500 text-white'}`}>
        {labels[status] || status}
      </span>
    );
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

  const { totalAmount, taxAmount, grandTotal } = editing ? calculateTotals() : {
    totalAmount: invoice.total_amount,
    taxAmount: invoice.tax_amount,
    grandTotal: invoice.grand_total,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{invoice.invoice_number}</h1>
          <p className="text-gray-600 mt-1">{getStatusBadge(invoice.status)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            戻る
          </button>
          {invoice.status === 'DRAFT' && !editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                編集
              </button>
              <button
                onClick={handleIssue}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                発行
              </button>
            </>
          )}
          {invoice.status === 'UNPAID' && (
            <button
              onClick={handlePaid}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              入金確認
            </button>
          )}
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400"
          >
            {pdfLoading ? 'PDF準備中...' : 'PDF出力'}
          </button>
        </div>
      </div>

      {/* 顧客情報 */}
      <Card>
        <CardHeader>
          <CardTitle>顧客情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">氏名:</span> {invoice.customer.name}
          </div>
          <div>
            <span className="font-medium">メールアドレス:</span> {invoice.customer.email}
          </div>
          <div>
            <span className="font-medium">電話番号:</span> {invoice.customer.phone}
          </div>
          <div>
            <span className="font-medium">住所:</span> {invoice.customer.address}
          </div>
        </CardContent>
      </Card>

      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>発行日</Label>
              {editing ? (
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              ) : (
                <p className="text-lg">{invoice.issue_date}</p>
              )}
            </div>
            <div>
              <Label>支払期日</Label>
              {editing ? (
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              ) : (
                <p className="text-lg">{invoice.due_date}</p>
              )}
            </div>
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
            {editing && (
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                + 項目を追加
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>品目</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <Label>数量</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="w-20">
                    <Label>単位</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) => updateItem(index, 'unit', e.target.value)}
                    />
                  </div>
                  <div className="w-32">
                    <Label>単価</Label>
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, 'unit_price', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="w-32">
                    <Label>金額</Label>
                    <Input value={item.amount} readOnly className="bg-gray-50" />
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      削除
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">品目</th>
                    <th className="px-4 py-2 text-right">数量</th>
                    <th className="px-4 py-2 text-left">単位</th>
                    <th className="px-4 py-2 text-right">単価</th>
                    <th className="px-4 py-2 text-right">金額</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{item.description}</td>
                      <td className="px-4 py-2 text-right">{item.quantity}</td>
                      <td className="px-4 py-2">{item.unit}</td>
                      <td className="px-4 py-2 text-right">¥{item.unit_price.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right">¥{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
            <span className="font-medium">¥{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>消費税（10%）:</span>
            <span className="font-medium">¥{taxAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>合計（税込）:</span>
            <span>¥{grandTotal.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* 編集モードのアクション */}
      {editing && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => {
            setEditing(false);
            setIssueDate(invoice.issue_date);
            setDueDate(invoice.due_date);
            setItems(invoice.items);
          }}>
            キャンセル
          </Button>
          <Button onClick={handleUpdate}>
            更新
          </Button>
        </div>
      )}
    </div>
  );
}
