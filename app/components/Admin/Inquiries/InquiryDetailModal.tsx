"use client";

import { useState, useEffect } from "react";

interface InquiryDetail {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subject: string;
  content: string;
  status: string;
  statusLabel: string;
  adminMemo?: string;
  createdAt: string;
  createdDate: string;
}

interface InquiryDetailModalProps {
  inquiryId: number;
  onClose: () => void;
}

const InquiryDetailModal = ({
  inquiryId,
  onClose,
}: InquiryDetailModalProps) => {
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminMemo, setAdminMemo] = useState("");
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchInquiryDetail();
  }, [inquiryId]);

  const fetchInquiryDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`);
      const result = await response.json();

      if (result.success) {
        setInquiry(result.data);
        setAdminMemo(result.data.adminMemo || "");
        setNewStatus(result.data.status);
      } else {
        console.error("Failed to fetch inquiry detail:", result.error);
      }
    } catch (error) {
      console.error("Error fetching inquiry detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/admin/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          adminMemo,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("保存しました");
        fetchInquiryDetail();
      } else {
        alert(`保存に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving inquiry:", error);
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadgeClass = (statusLabel: string) => {
    switch (statusLabel) {
      case "未対応":
        return "bg-red-100 text-red-800";
      case "対応中":
        return "bg-yellow-100 text-yellow-800";
      case "対応完了":
      case "完了":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  if (!inquiry) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">お問い合わせ詳細</h2>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              お問い合わせ情報
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">お名前</label>
                <p className="font-medium text-gray-900">
                  {inquiry.customerName}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">メールアドレス</label>
                <p className="font-medium text-gray-900">
                  {inquiry.customerEmail}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">電話番号</label>
                <p className="font-medium text-gray-900">
                  {inquiry.customerPhone || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">作成日</label>
                <p className="font-medium text-gray-900">
                  {inquiry.createdDate}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-600">件名</label>
                <p className="font-medium text-gray-900">{inquiry.subject}</p>
              </div>
            </div>
          </div>

          {/* お問い合わせ内容 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              お問い合わせ内容
            </h3>
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <p className="text-gray-900 whitespace-pre-wrap">
                {inquiry.content}
              </p>
            </div>
          </div>

          {/* ステータス管理 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              対応状況
            </h3>
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
                  <option value="PENDING">未対応</option>
                  <option value="IN_PROGRESS">対応中</option>
                  <option value="COMPLETED">対応完了</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  現在のステータス
                </label>
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-md ${getStatusBadgeClass(
                    inquiry.statusLabel
                  )}`}
                >
                  {inquiry.statusLabel}
                </span>
              </div>
            </div>
          </div>

          {/* 管理者メモ */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              管理者メモ
            </h3>
            <textarea
              value={adminMemo}
              onChange={(e) => setAdminMemo(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="対応履歴や管理者用のメモを入力してください"
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

export default InquiryDetailModal;
