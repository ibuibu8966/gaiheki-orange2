"use client";

import { useState, useEffect } from "react";

interface OrderDetail {
  id: number;
  diagnosisId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  constructionType: string;
  quotationAmount: number;
  partnerName: string;
  partnerPhone: string;
  status: string;
  statusLabel: string;
  orderDate: string;
  constructionStartDate?: string;
  constructionEndDate?: string;
  completionDate?: string;
  partnerMemo?: string;
  adminMemo?: string;
  evaluationToken?: string;
  evaluationTokenSentAt?: string;
}

interface OrderDetailModalProps {
  orderId: number;
  onClose: () => void;
}

const OrderDetailModal = ({ orderId, onClose }: OrderDetailModalProps) => {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminMemo, setAdminMemo] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [evaluationUrl, setEvaluationUrl] = useState("");
  const [showEvaluationUrl, setShowEvaluationUrl] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      const result = await response.json();

      if (result.success) {
        setOrder(result.data);
        setAdminMemo(result.data.adminMemo || "");
        setNewStatus(result.data.status);
      } else {
        console.error("Failed to fetch order detail:", result.error);
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminMemo,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("保存しました");
        fetchOrderDetail();
      } else {
        alert(`保存に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving order:", error);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleIssueEvaluationForm = async () => {
    if (!confirm("評価フォームを発行しますか？")) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/orders/${orderId}/evaluation-form`, {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        setEvaluationUrl(result.data.evaluationUrl);
        setShowEvaluationUrl(true);
        alert(result.data.message);
        fetchOrderDetail();
      } else {
        alert(`評価フォーム発行に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error("Error issuing evaluation form:", error);
      alert("評価フォーム発行に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("クリップボードにコピーしました");
  };

  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">受注詳細</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 基本情報 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">診断ID</label>
                <p className="font-medium text-gray-900">{order.diagnosisId}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">受注日</label>
                <p className="font-medium text-gray-900">{order.orderDate}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">顧客名</label>
                <p className="font-medium text-gray-900">{order.customerName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">電話番号</label>
                <p className="font-medium text-gray-900">{order.customerPhone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">メールアドレス</label>
                <p className="font-medium text-gray-900">{order.customerEmail}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">施工金額</label>
                <p className="font-medium text-gray-900">
                  {formatAmount(order.quotationAmount)}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600">施工住所</label>
                <p className="font-medium text-gray-900">{order.address}</p>
              </div>
            </div>
          </div>

          {/* 施工情報 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">施工情報</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">施工業者</label>
                <p className="font-medium text-gray-900">{order.partnerName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">業者電話番号</label>
                <p className="font-medium text-gray-900">{order.partnerPhone || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">施工開始予定日</label>
                <p className="font-medium text-gray-900">
                  {order.constructionStartDate || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">施工終了予定日</label>
                <p className="font-medium text-gray-900">
                  {order.constructionEndDate || "-"}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600">加盟店メモ</label>
                <p className="font-medium text-gray-900 whitespace-pre-wrap">
                  {order.partnerMemo || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* ステータス管理 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ステータス管理</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータス
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ORDERED">受注</option>
                  <option value="IN_PROGRESS">施工中</option>
                  <option value="COMPLETED">施工完了</option>
                  <option value="REVIEW_COMPLETED">評価完了</option>
                  <option value="CANCELLED">キャンセル</option>
                </select>
              </div>

              {newStatus === "COMPLETED" && !order.evaluationToken && (
                <div>
                  <button
                    onClick={handleIssueEvaluationForm}
                    disabled={saving}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300"
                  >
                    {saving ? "発行中..." : "評価フォーム発行"}
                  </button>
                </div>
              )}

              {(order.evaluationToken || showEvaluationUrl) && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    評価フォームURL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={
                        evaluationUrl ||
                        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/evaluation/${order.evaluationToken}`
                      }
                      className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-md text-sm"
                    />
                    <button
                      onClick={() =>
                        copyToClipboard(
                          evaluationUrl ||
                            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/evaluation/${order.evaluationToken}`
                        )
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      コピー
                    </button>
                  </div>
                  {order.evaluationTokenSentAt && (
                    <p className="text-xs text-blue-700 mt-2">
                      発行日時: {new Date(order.evaluationTokenSentAt).toLocaleString("ja-JP")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 管理者メモ */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">管理者メモ</h3>
            <textarea
              value={adminMemo}
              onChange={(e) => setAdminMemo(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="管理者用のメモを入力してください"
            />
          </div>

          {/* 保存ボタン */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              閉じる
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
            >
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
