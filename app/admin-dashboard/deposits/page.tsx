'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResponsiveTable } from '../../components/Common/ResponsiveTable';
import { ResponsiveModal } from '../../components/Common/ResponsiveModal';

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
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">入金管理</h2>
        </div>

        {/* ステータスフィルタータブ */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'すべて' },
              { value: 'PENDING', label: '申請中' },
              { value: 'APPROVED', label: '承認済み' },
              { value: 'REJECTED', label: '却下' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 min-h-[44px] rounded-md text-sm font-medium transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* テーブル */}
        <div className="p-4 sm:p-0">
          <ResponsiveTable
            data={depositRequests}
            keyField="id"
            isLoading={loading}
            emptyMessage="入金申請がありません"
            columns={[
              {
                key: 'createdAt',
                label: '申請日時',
                priority: 6,
                render: (r) => (
                  <span className="text-sm">
                    {new Date(r.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                ),
              },
              {
                key: 'companyName',
                label: '会社名',
                priority: 10,
                render: (r) => <span className="font-medium">{r.companyName}</span>,
              },
              {
                key: 'requestedAmount',
                label: '申請金額',
                priority: 9,
                render: (r) => (
                  <span className="font-semibold text-blue-600">
                    ¥{r.requestedAmount.toLocaleString()}
                  </span>
                ),
              },
              {
                key: 'approvedAmount',
                label: '承認金額',
                hideOnMobile: true,
                render: (r) =>
                  r.approvedAmount !== null
                    ? `¥${r.approvedAmount.toLocaleString()}`
                    : '-',
              },
              {
                key: 'currentBalance',
                label: '現在残高',
                hideOnMobile: true,
                render: (r) => `¥${r.currentBalance.toLocaleString()}`,
              },
              {
                key: 'status',
                label: 'ステータス',
                priority: 8,
                render: (r) => {
                  const status = getStatusLabel(r.status);
                  return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  );
                },
              },
            ]}
            onRowClick={(r) => r.status === 'PENDING' && openModal(r, 'approve')}
            mobileCardTitle={(r) => (
              <div className="flex items-center justify-between">
                <span className="font-semibold">{r.companyName}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusLabel(r.status).className}`}>
                  {getStatusLabel(r.status).label}
                </span>
              </div>
            )}
            mobileCardActions={(r) => (
              r.status === 'PENDING' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(r, 'approve')}
                    className="flex-1 py-2 text-center text-green-600 font-medium min-h-[44px] hover:bg-green-50 rounded transition-colors"
                  >
                    承認
                  </button>
                  <button
                    onClick={() => openModal(r, 'reject')}
                    className="flex-1 py-2 text-center text-red-600 font-medium min-h-[44px] hover:bg-red-50 rounded transition-colors"
                  >
                    却下
                  </button>
                </div>
              ) : (
                <div className="py-2 text-center text-gray-400 text-sm">処理済み</div>
              )
            )}
          />

          {/* ページネーション */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4 p-4 sm:p-6">
              <button
                onClick={() => fetchDepositRequests(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-3 min-h-[44px] border rounded-md disabled:opacity-50 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                前へ
              </button>
              <span className="px-4 py-3 min-h-[44px] flex items-center">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchDepositRequests(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-3 min-h-[44px] border rounded-md disabled:opacity-50 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                次へ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 承認/却下モーダル */}
      <ResponsiveModal
        isOpen={!!(selectedRequest && modalAction)}
        onClose={closeModal}
        title={modalAction === 'approve' ? '入金申請の承認' : '入金申請の却下'}
        size="md"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={processing}
              className="w-full sm:w-auto min-h-[44px]"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={processing}
              className={`w-full sm:w-auto min-h-[44px] ${
                modalAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {processing
                ? '処理中...'
                : modalAction === 'approve'
                ? '承認する'
                : '却下する'}
            </Button>
          </div>
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
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
                  className="min-h-[44px]"
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
        )}
      </ResponsiveModal>
    </div>
  );
}
