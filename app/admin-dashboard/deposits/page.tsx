'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DepositRequest {
  id: string;
  partnerId: number;
  companyName: string;
  requestedAmount: number;
  approvedAmount: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  partnerNote: string | null;
  adminNote: string | null;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  currentBalance: number;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function AdminDepositsPage() {
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // モーダル関連
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);
  const [approvedAmount, setApprovedAmount] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchDepositRequests(1);
  }, [statusFilter]);

  const fetchDepositRequests = async (page: number) => {
    try {
      setLoading(true);
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const res = await fetch(`/api/admin/deposits?page=${page}&limit=20${statusParam}`);
      const data = await res.json();

      if (data.success) {
        setDepositRequests(data.data.depositRequests);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (request: DepositRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setModalAction(action);
    setApprovedAmount(request.requestedAmount.toString());
    setAdminNote('');
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setModalAction(null);
    setApprovedAmount('');
    setAdminNote('');
  };

  const handleSubmit = async () => {
    if (!selectedRequest || !modalAction) return;

    try {
      setProcessing(true);
      setMessage(null);

      const body: Record<string, unknown> = {
        id: selectedRequest.id,
        action: modalAction,
        admin_note: adminNote || null,
      };

      if (modalAction === 'approve') {
        const amount = parseInt(approvedAmount, 10);
        if (isNaN(amount) || amount <= 0) {
          setMessage({ type: 'error', text: '承認金額は1円以上で入力してください' });
          setProcessing(false);
          return;
        }
        body.approved_amount = amount;
      }

      const res = await fetch('/api/admin/deposits', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: modalAction === 'approve' ? '入金申請を承認しました' : '入金申請を却下しました',
        });
        closeModal();
        fetchDepositRequests(pagination?.page || 1);
      } else {
        setMessage({ type: 'error', text: data.error || '処理に失敗しました' });
      }
    } catch (error) {
      console.error('処理に失敗しました:', error);
      setMessage({ type: 'error', text: '処理に失敗しました' });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: '申請中', className: 'bg-yellow-100 text-yellow-800' };
      case 'APPROVED':
        return { label: '承認済み', className: 'bg-green-100 text-green-800' };
      case 'REJECTED':
        return { label: '却下', className: 'bg-red-100 text-red-800' };
      default:
        return { label: status, className: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading && depositRequests.length === 0) {
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">入金管理</h1>
        <a
          href="/admin-dashboard"
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          ← ダッシュボードに戻る
        </a>
      </div>

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

      {/* フィルター */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="status">ステータス</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" id="status">
                <SelectValue placeholder="ステータスを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="PENDING">申請中</SelectItem>
                <SelectItem value="APPROVED">承認済み</SelectItem>
                <SelectItem value="REJECTED">却下</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 申請一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>入金申請一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {depositRequests.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>申請日時</TableHead>
                      <TableHead>会社名</TableHead>
                      <TableHead>申請金額</TableHead>
                      <TableHead>承認金額</TableHead>
                      <TableHead>現在残高</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {depositRequests.map((request) => {
                      const status = getStatusLabel(request.status);
                      return (
                        <TableRow key={request.id}>
                          <TableCell className="text-sm">
                            {new Date(request.createdAt).toLocaleString('ja-JP')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {request.companyName}
                          </TableCell>
                          <TableCell>
                            ¥{request.requestedAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {request.approvedAmount !== null
                              ? `¥${request.approvedAmount.toLocaleString()}`
                              : '-'}
                          </TableCell>
                          <TableCell>
                            ¥{request.currentBalance.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            {request.status === 'PENDING' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openModal(request, 'approve')}
                                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                                >
                                  承認
                                </button>
                                <button
                                  onClick={() => openModal(request, 'reject')}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  却下
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">処理済み</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* ページネーション */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => fetchDepositRequests(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    前へ
                  </button>
                  <span className="px-3 py-1">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchDepositRequests(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    次へ
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              入金申請がありません
            </div>
          )}
        </CardContent>
      </Card>

      {/* 承認/却下モーダル */}
      {selectedRequest && modalAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {modalAction === 'approve' ? '入金申請の承認' : '入金申請の却下'}
              </h3>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">会社名:</span>{' '}
                  <span className="font-medium">{selectedRequest.companyName}</span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">申請金額:</span>{' '}
                  <span className="font-medium">
                    ¥{selectedRequest.requestedAmount.toLocaleString()}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">現在残高:</span>{' '}
                  <span className="font-medium">
                    ¥{selectedRequest.currentBalance.toLocaleString()}
                  </span>
                </p>
                {selectedRequest.partnerNote && (
                  <p className="text-sm">
                    <span className="text-gray-500">加盟店備考:</span>{' '}
                    <span>{selectedRequest.partnerNote}</span>
                  </p>
                )}
              </div>

              {modalAction === 'approve' && (
                <div className="space-y-2">
                  <Label htmlFor="approved_amount">承認金額</Label>
                  <Input
                    id="approved_amount"
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    placeholder="実際の振込金額を入力"
                    min="1"
                  />
                  <p className="text-xs text-gray-500">
                    実際に確認できた振込金額を入力してください（申請金額と異なる場合も対応可能）
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="admin_note">管理者メモ（任意）</Label>
                <Textarea
                  id="admin_note"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    modalAction === 'approve'
                      ? '確認日時や備考など'
                      : '却下理由を入力してください'
                  }
                  rows={3}
                />
              </div>

              {modalAction === 'approve' && (
                <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                  承認後の残高: ¥
                  {(
                    selectedRequest.currentBalance +
                    (parseInt(approvedAmount, 10) || 0)
                  ).toLocaleString()}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="outline" onClick={closeModal} disabled={processing}>
                キャンセル
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={processing}
                className={
                  modalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                {processing
                  ? '処理中...'
                  : modalAction === 'approve'
                  ? '承認する'
                  : '却下する'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
