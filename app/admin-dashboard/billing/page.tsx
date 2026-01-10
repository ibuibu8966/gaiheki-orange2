'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../components/Admin/Common/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// PDFコンポーネントは動的にインポート（SSRを無効化）
// サーバーサイドPDF生成に変更したため、これらは不要
// const PDFDownloadLink = dynamic(
//   () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
//   { ssr: false, loading: () => <Button variant="outline" disabled>PDF準備中...</Button> }
// );
// const CompanyInvoicePDF = dynamic(() => import('@/app/components/Admin/Invoice/CompanyInvoicePDFSimple'), {
//   ssr: false,
// });

interface Invoice {
  id: number;
  invoice_number: string;
  partner_id: number;
  company_name: string;
  billing_period_start: string;
  billing_period_end: string;
  grand_total: number;
  issue_date: string;
  due_date: string;
  status: string;
}

interface GeneratedInvoice {
  partner_id: number;
  company_name: string;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  items: Array<{
    description: string;
    amount: number;
  }>;
}

const ITEMS_PER_PAGE = 20;

export default function BillingManagementPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [generatedResult, setGeneratedResult] = useState<{
    generated: number;
    invoices: GeneratedInvoice[];
  } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<number[]>([]);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchInvoices();
  }, [status, currentPage]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString()
      });
      if (status !== 'all') params.append('status', status);

      const res = await fetch(`/api/admin/invoices?${params}`);
      const data = await res.json();

      if (data.success) {
        setInvoices(data.data.invoices);
        setTotalCount(data.data.total || 0);
      }
    } catch (error) {
      console.error('請求書一覧の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonthly = async () => {
    try {
      setGenerating(true);
      const res = await fetch('/api/admin/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'monthly',
          year: selectedYear,
          month: selectedMonth,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setGeneratedResult(data.data);
        setIsGenerateModalOpen(true);
        fetchInvoices();
      } else {
        alert(data.error || '請求書の生成に失敗しました');
      }
    } catch (error) {
      console.error('請求書生成エラー:', error);
      alert('請求書の生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateUnbilled = async () => {
    if (!confirm('未請求分の請求書を生成しますか？')) {
      return;
    }

    try {
      setGenerating(true);
      const res = await fetch('/api/admin/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'unbilled',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setGeneratedResult(data.data);
        setIsGenerateModalOpen(true);
        fetchInvoices();
      } else {
        alert(data.error || '請求書の生成に失敗しました');
      }
    } catch (error) {
      console.error('請求書生成エラー:', error);
      alert('請求書の生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleIssueInvoices = async (invoiceIds: number[]) => {
    if (invoiceIds.length === 0) {
      alert('発行する請求書を選択してください');
      return;
    }

    if (!confirm(`${invoiceIds.length}件の請求書を発行しますか？`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/invoices/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_ids: invoiceIds,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`${data.data.issued}件の請求書を発行しました`);
        setSelectedInvoiceIds([]);
        fetchInvoices();
      } else {
        alert(data.error || '請求書の発行に失敗しました');
      }
    } catch (error) {
      console.error('請求書発行エラー:', error);
      alert('請求書の発行に失敗しました');
    }
  };

  const handleIssueAll = () => {
    const draftInvoices = invoices.filter((inv) => inv.status === 'DRAFT');
    handleIssueInvoices(draftInvoices.map((inv) => inv.id));
  };

  const handleIssueSelected = () => {
    handleIssueInvoices(selectedInvoiceIds);
  };

  const handleDownloadPDF = async () => {
    if (selectedInvoiceIds.length === 0) {
      alert('請求書を選択してください');
      return;
    }

    // 現在は1件のみ対応
    if (selectedInvoiceIds.length > 1) {
      alert('現在は1件ずつのダウンロードのみ対応しています');
      return;
    }

    const invoiceId = selectedInvoiceIds[0];

    try {
      setDownloadingPDF(true);

      // サーバーサイドでPDFを生成してダウンロード
      const response = await fetch(`/api/admin/invoices/${invoiceId}/pdf`);
      
      if (!response.ok) {
        throw new Error('PDF生成に失敗しました');
      }

      // PDFをBlobとして取得
      const blob = await response.blob();
      
      // ダウンロードリンクを作成
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // クリーンアップ
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // 選択をクリア
      setSelectedInvoiceIds([]);
    } catch (error) {
      console.error('PDFダウンロードエラー:', error);
      alert('PDFのダウンロードに失敗しました');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const toggleSelectInvoice = (id: number) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((invId) => invId !== id) : [...prev, id]
    );
  };

  const handleStatusChange = async (invoiceId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchInvoices();
      } else {
        const data = await response.json();
        alert(data.error || 'ステータスの更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('ステータスの更新に失敗しました');
    }
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

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const draftCount = invoices.filter((inv) => inv.status === 'DRAFT').length;

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 min-w-0 overflow-y-auto h-screen">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">手数料請求管理</h1>
          </div>

          {/* 請求書生成セクション */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
              <CardTitle className="text-xl font-bold text-gray-800">請求書下書き生成</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 月別生成 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">月別請求書生成</h3>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label className="text-sm font-medium text-gray-700">年</Label>
                        <Select
                          value={selectedYear.toString()}
                          onValueChange={(val) => setSelectedYear(parseInt(val))}
                        >
                          <SelectTrigger className="mt-1.5 bg-white border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}年
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Label className="text-sm font-medium text-gray-700">月</Label>
                        <Select
                          value={selectedMonth.toString()}
                          onValueChange={(val) => setSelectedMonth(parseInt(val))}
                        >
                          <SelectTrigger className="mt-1.5 bg-white border-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month} value={month.toString()}>
                                {month}月
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateMonthly}
                    disabled={generating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  >
                    {generating ? '生成中...' : `${selectedYear}年${selectedMonth}月分の下書きを生成`}
                  </Button>
                </div>

                {/* 未請求分生成 */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">未請求分生成</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      これまでに請求書を発行していない全ての成約手数料を集計して請求書を生成します。
                    </p>
                  </div>
                  <Button
                    onClick={handleGenerateUnbilled}
                    disabled={generating}
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    {generating ? '生成中...' : '未請求分の下書きを生成'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 発行アクション */}
          {draftCount > 0 && (
            <Card className="shadow-sm border-gray-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      下書き請求書: {draftCount}件
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      選択中: {selectedInvoiceIds.length}件
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleIssueSelected}
                      disabled={selectedInvoiceIds.length === 0}
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-white"
                    >
                      選択したものを発行
                    </Button>
                    <Button
                      onClick={handleIssueAll}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      すべて発行
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* フィルター */}
          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-6">
              <div className="flex gap-4 justify-between items-end">
                <div className="w-48">
                  <Label className="text-sm font-medium text-gray-700">ステータスで絞り込み</Label>
                  <Select value={status} onValueChange={(val) => { setStatus(val); setCurrentPage(1); }}>
                    <SelectTrigger className="mt-1.5 bg-white border-gray-300 hover:border-gray-400">
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="DRAFT">下書き</SelectItem>
                      <SelectItem value="UNPAID">未払い</SelectItem>
                      <SelectItem value="PAID">支払い済み</SelectItem>
                      <SelectItem value="OVERDUE">遅延</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleDownloadPDF}
                  disabled={selectedInvoiceIds.length === 0 || downloadingPDF}
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  {downloadingPDF ? 'PDF生成中...' : '選択した請求書をPDFダウンロード'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 請求書一覧 */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <CardTitle className="text-xl font-bold text-gray-800">請求書一覧</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <p className="mt-2 text-gray-600">読み込み中...</p>
                </div>
              ) : invoices.length > 0 ? (
                <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={
                              selectedInvoiceIds.length > 0 &&
                              invoices.every((inv) => selectedInvoiceIds.includes(inv.id))
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                const allIds = invoices.map((inv) => inv.id);
                                setSelectedInvoiceIds(allIds);
                              } else {
                                setSelectedInvoiceIds([]);
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">請求書番号</TableHead>
                        <TableHead className="font-semibold text-gray-700">加盟店名</TableHead>
                        <TableHead className="font-semibold text-gray-700">請求期間</TableHead>
                        <TableHead className="text-right font-semibold text-gray-700">請求額</TableHead>
                        <TableHead className="font-semibold text-gray-700">発行日</TableHead>
                        <TableHead className="font-semibold text-gray-700">支払期日</TableHead>
                        <TableHead className="font-semibold text-gray-700">ステータス</TableHead>
                        <TableHead className="font-semibold text-gray-700">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedInvoiceIds.includes(invoice.id)}
                              onChange={() => toggleSelectInvoice(invoice.id)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
                          <TableCell>{invoice.company_name}</TableCell>
                          <TableCell className="text-sm">
                            {invoice.billing_period_start} 〜 {invoice.billing_period_end}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ¥{invoice.grand_total.toLocaleString()}
                          </TableCell>
                          <TableCell>{invoice.issue_date}</TableCell>
                          <TableCell>{invoice.due_date}</TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin-dashboard/billing/${invoice.id}`)}
                              className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-white"
                            >
                              詳細
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* ページネーション */}
                {totalCount > ITEMS_PER_PAGE && (
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      全{totalCount}件中 {(currentPage - 1) * ITEMS_PER_PAGE + 1}〜{Math.min(currentPage * ITEMS_PER_PAGE, totalCount)}件を表示
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        前へ
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.ceil(totalCount / ITEMS_PER_PAGE) }, (_, i) => i + 1)
                          .filter(page => {
                            const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
                            if (totalPages <= 7) return true;
                            if (page === 1 || page === totalPages) return true;
                            if (Math.abs(page - currentPage) <= 2) return true;
                            return false;
                          })
                          .map((page, index, array) => (
                            <span key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <button
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 text-sm rounded-md ${
                                  currentPage === page
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            </span>
                          ))}
                      </div>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / ITEMS_PER_PAGE), prev + 1))}
                        disabled={currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE)}
                        className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        次へ
                      </button>
                    </div>
                  </div>
                )}
                </>
              ) : (
                <p className="text-center text-gray-500 py-8">請求書がありません</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 生成結果モーダル */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>請求書生成完了</DialogTitle>
          </DialogHeader>
          {generatedResult && (
            <div className="space-y-4">
              <p className="text-lg font-semibold text-green-600">
                {generatedResult.generated}件の請求書下書きを生成しました
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {generatedResult.invoices.map((invoice, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-gray-50">
                    <p className="font-semibold">{invoice.company_name}</p>
                    <p className="text-sm text-gray-600">
                      請求額: ¥{invoice.grand_total.toLocaleString()}（税込）
                    </p>
                    <div className="text-xs text-gray-500 mt-1">
                      {invoice.items.map((item, i) => (
                        <div key={i}>
                          {item.description}: ¥{item.amount.toLocaleString()}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => setIsGenerateModalOpen(false)} className="w-full">
                閉じる
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

