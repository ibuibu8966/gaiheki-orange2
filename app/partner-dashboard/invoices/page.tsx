'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CustomerInvoice {
  id: number;
  invoice_number: string;
  order_id: number;
  issue_date: string;
  due_date: string;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  status: string;
  payment_date: string | null;
  order?: {
    quotations?: {
      diagnosis_requests?: {
        customers?: {
          customer_name: string;
        };
      };
    };
  };
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
  items: {
    id: number;
    description: string;
    amount: number;
  }[];
}

type TabType = 'customer' | 'company';

export default function PartnerInvoicesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('customer');
  const [customerInvoices, setCustomerInvoices] = useState<CustomerInvoice[]>([]);
  const [companyInvoices, setCompanyInvoices] = useState<CompanyInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (activeTab === 'customer') {
      fetchCustomerInvoices();
    } else {
      fetchCompanyInvoices();
    }
  }, [activeTab, statusFilter]);

  const fetchCustomerInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      const response = await fetch(`/api/partner/invoices?${params}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCustomerInvoices(result.data.invoices || []);
        } else {
          setCustomerInvoices([]);
        }
      }
    } catch (error) {
      console.error('Error fetching customer invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      const response = await fetch(`/api/partner/billing?${params}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCompanyInvoices(result.data.invoices || []);
        } else {
          setCompanyInvoices([]);
        }
      }
    } catch (error) {
      console.error('Error fetching company invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCustomerPDF = async (invoiceId: number) => {
    try {
      const response = await fetch(`/api/partner/invoices/${invoiceId}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${invoiceId}.pdf`;
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
    }
  };

  const handleDownloadCompanyPDF = async (invoiceId: number) => {
    try {
      const response = await fetch(`/api/partner/billing/${invoiceId}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `billing_${invoiceId}.pdf`;
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
    }
  };

  const handleStatusChange = async (invoiceId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/partner/invoices/${invoiceId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        // 一覧を再取得
        fetchCustomerInvoices();
      } else {
        alert('ステータスの更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: string } = {
      DRAFT: '下書き',
      UNPAID: '未払い',
      PAID: '支払済',
      OVERDUE: '期限切れ',
      CANCELLED: 'キャンセル',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      DRAFT: 'bg-gray-500 text-white',
      UNPAID: 'bg-orange-500 text-white',
      PAID: 'bg-green-600 text-white',
      OVERDUE: 'bg-red-600 text-white',
      CANCELLED: 'bg-gray-400 text-white',
    };
    return colorMap[status] || 'bg-gray-500 text-white';
  };

  const getSelectColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      DRAFT: 'bg-gray-500 text-white border-gray-500',
      UNPAID: 'bg-orange-500 text-white border-orange-500',
      PAID: 'bg-green-600 text-white border-green-600',
      OVERDUE: 'bg-red-600 text-white border-red-600',
      CANCELLED: 'bg-gray-400 text-white border-gray-400',
    };
    return colorMap[status] || 'bg-gray-500 text-white border-gray-500';
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">請求書管理</h1>
        <Link
          href="/partner-dashboard/invoices/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          新規作成
        </Link>
      </div>

      {/* タブ切り替えとフィルター */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'customer'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            顧客への請求
          </button>
          <button
            onClick={() => setActiveTab('company')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'company'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            運営からの請求
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="statusFilter" className="text-sm text-gray-600">ステータス:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="DRAFT">下書き</option>
            <option value="UNPAID">未払い</option>
            <option value="PAID">支払済</option>
            <option value="OVERDUE">期限切れ</option>
            <option value="CANCELLED">キャンセル</option>
          </select>
        </div>
      </div>

      {/* 顧客への請求書一覧 */}
      {activeTab === 'customer' && (
        <>
          {customerInvoices.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              顧客への請求書がありません
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      請求書番号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      顧客名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      発行日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      支払期限
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      合計金額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.order?.quotations?.diagnosis_requests?.customers?.customer_name || '不明'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.issue_date).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.due_date).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ¥{invoice.grand_total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={invoice.status}
                          onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                          className={`px-3 py-1 text-sm font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${getSelectColor(invoice.status)}`}
                        >
                          <option value="DRAFT" className="bg-white text-gray-900">下書き</option>
                          <option value="UNPAID" className="bg-white text-gray-900">未払い</option>
                          <option value="PAID" className="bg-white text-gray-900">支払済</option>
                          <option value="OVERDUE" className="bg-white text-gray-900">期限切れ</option>
                          <option value="CANCELLED" className="bg-white text-gray-900">キャンセル</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDownloadCustomerPDF(invoice.id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          PDF
                        </button>
                        <Link
                          href={`/partner-dashboard/invoices/${invoice.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          詳細
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* 運営からの請求書一覧 */}
      {activeTab === 'company' && (
        <>
          {companyInvoices.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              運営からの請求書がありません
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      請求書番号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      請求期間
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      発行日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      支払期限
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      合計金額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companyInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.billing_period_start).toLocaleDateString('ja-JP')} 〜{' '}
                        {new Date(invoice.billing_period_end).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.issue_date).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invoice.due_date).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        ¥{invoice.grand_total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}
                        >
                          {getStatusLabel(invoice.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDownloadCompanyPDF(invoice.id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          PDF
                        </button>
                        <Link
                          href={`/partner-dashboard/billing/${invoice.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          詳細
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
