'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InvoiceItem {
  id: number;
  description: string;
  amount: number;
}

interface CompanyInvoice {
  id: number;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  billing_period_start: string;
  billing_period_end: string;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  status: string;
  payment_date: string | null;
  items: InvoiceItem[];
}

export default function BillingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<CompanyInvoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/partner/billing/${resolvedParams.id}`);
      const data = await res.json();

      if (data.success) {
        setInvoice(data.data);
      }
    } catch (error) {
      console.error('請求書詳細の取得に失敗しました:', error);
    } finally {
      setLoading(false);
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
        </div>
      </div>

      {/* 請求情報 */}
      <Card>
        <CardHeader>
          <CardTitle>請求情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">請求期間</p>
              <p className="text-lg font-medium">
                {new Date(invoice.billing_period_start).toLocaleDateString('ja-JP')} 〜{' '}
                {new Date(invoice.billing_period_end).toLocaleDateString('ja-JP')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">発行日</p>
              <p className="text-lg">{new Date(invoice.issue_date).toLocaleDateString('ja-JP')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">支払期日</p>
              <p className="text-lg">{new Date(invoice.due_date).toLocaleDateString('ja-JP')}</p>
            </div>
            {invoice.payment_date && (
              <div>
                <p className="text-sm text-gray-500">入金日</p>
                <p className="text-lg">{new Date(invoice.payment_date).toLocaleDateString('ja-JP')}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 請求明細 */}
      <Card>
        <CardHeader>
          <CardTitle>請求明細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">内容</th>
                  <th className="px-4 py-2 text-right">金額</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-2">{item.description}</td>
                    <td className="px-4 py-2 text-right">¥{item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            <span className="font-medium">¥{invoice.total_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>消費税（10%）:</span>
            <span className="font-medium">¥{invoice.tax_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>合計（税込）:</span>
            <span>¥{invoice.grand_total.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
