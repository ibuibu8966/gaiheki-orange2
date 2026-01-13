'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface BankInfo {
  bank_name?: string;
  branch_name?: string;
  account_type?: string;
  account_number?: string;
  account_holder?: string;
}

interface DepositRequest {
  id: string;
  requestedAmount: number;
  approvedAmount: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  partnerNote: string | null;
  adminNote: string | null;
  createdAt: string;
  approvedAt: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function PartnerDepositPage() {
  const [bankInfo, setBankInfo] = useState<BankInfo>({});
  const [depositBalance, setDepositBalance] = useState(0);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // フォーム入力
  const [requestedAmount, setRequestedAmount] = useState('');
  const [partnerNote, setPartnerNote] = useState('');

  useEffect(() => {
    fetchDepositData(1);
  }, []);

  const fetchDepositData = async (page: number) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/partner/deposits?page=${page}&limit=10`);
      const data = await res.json();

      if (data.success) {
        setBankInfo(data.data.bankInfo);
        setDepositBalance(data.data.depositBalance);
        setDepositRequests(data.data.depositRequests);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseInt(requestedAmount, 10);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: '申請金額は1円以上で入力してください' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      const res = await fetch('/api/partner/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requested_amount: amount,
          partner_note: partnerNote || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: '入金申請を送信しました' });
        setRequestedAmount('');
        setPartnerNote('');
        fetchDepositData(1);
      } else {
        setMessage({ type: 'error', text: data.error || '申請に失敗しました' });
      }
    } catch (error) {
      console.error('申請に失敗しました:', error);
      setMessage({ type: 'error', text: '申請に失敗しました' });
    } finally {
      setSubmitting(false);
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">入金申請</h1>
        <a
          href="/partner-dashboard"
          className="text-blue-600 hover:text-blue-800 text-sm min-h-[44px] flex items-center"
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

      {/* 現在の残高 */}
      <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-600">
            現在の保証金残高
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-900">
            ¥{depositBalance.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 振込先情報 */}
        <Card>
          <CardHeader>
            <CardTitle>振込先口座</CardTitle>
            <p className="text-sm text-gray-500">
              以下の口座に保証金をお振込みください
            </p>
          </CardHeader>
          <CardContent>
            {bankInfo.bank_name ? (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500">銀行名</p>
                    <p className="font-medium">{bankInfo.bank_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">支店名</p>
                    <p className="font-medium">{bankInfo.branch_name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500">口座種別</p>
                    <p className="font-medium">{bankInfo.account_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">口座番号</p>
                    <p className="font-medium">{bankInfo.account_number}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">口座名義</p>
                  <p className="font-medium">{bankInfo.account_holder}</p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg text-yellow-700">
                振込先口座情報が設定されていません。管理者にお問い合わせください。
              </div>
            )}
          </CardContent>
        </Card>

        {/* 入金申請フォーム */}
        <Card>
          <CardHeader>
            <CardTitle>入金申請フォーム</CardTitle>
            <p className="text-sm text-gray-500">
              振込完了後、以下のフォームから入金申請を行ってください
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">振込金額</Label>
                <Input
                  id="amount"
                  type="number"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  placeholder="例: 100000"
                  min="1"
                  required
                />
                <p className="text-xs text-gray-500">
                  実際に振り込んだ金額を入力してください
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">備考（任意）</Label>
                <Textarea
                  id="note"
                  value={partnerNote}
                  onChange={(e) => setPartnerNote(e.target.value)}
                  placeholder="振込日時や振込名義が異なる場合など"
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full min-h-[44px]">
                {submitting ? '送信中...' : '入金申請を送信'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* 申請履歴 */}
      <Card>
        <CardHeader>
          <CardTitle>申請履歴</CardTitle>
        </CardHeader>
        <CardContent>
          {depositRequests.length > 0 ? (
            <>
              <div className="space-y-3">
                {depositRequests.map((request) => {
                  const status = getStatusLabel(request.status);
                  return (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleString('ja-JP')}
                          </p>
                          <p className="text-lg font-semibold">
                            ¥{request.requestedAmount.toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {request.status === 'APPROVED' && request.approvedAmount !== null && (
                        <div className="bg-green-50 p-2 rounded text-sm">
                          <span className="text-green-700">
                            承認金額: ¥{request.approvedAmount.toLocaleString()}
                          </span>
                          {request.approvedAmount !== request.requestedAmount && (
                            <span className="text-orange-600 ml-2">
                              （申請金額と異なります）
                            </span>
                          )}
                        </div>
                      )}

                      {request.partnerNote && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">備考:</span>{' '}
                          {request.partnerNote}
                        </div>
                      )}

                      {request.adminNote && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <span className="font-medium">管理者メモ:</span>{' '}
                          {request.adminNote}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ページネーション */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => fetchDepositData(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-3 min-h-[44px] border rounded-md disabled:opacity-50 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    前へ
                  </button>
                  <span className="px-4 py-3 min-h-[44px] flex items-center">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchDepositData(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-3 min-h-[44px] border rounded-md disabled:opacity-50 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    次へ
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              申請履歴がありません
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
