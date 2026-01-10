"use client";

import { useState, useEffect } from "react";
import InquiryDetailModal from "./InquiryDetailModal";

interface Inquiry {
  id: number;
  customerName: string;
  customerEmail: string;
  subject: string;
  status: string;
  statusLabel: string;
  createdDate: string;
}

const STATUS_MAP: Record<string, string> = {
  すべて: "",
  未対応: "PENDING",
  対応中: "IN_PROGRESS",
  対応完了: "COMPLETED",
};

const InquiriesView = () => {
  const [inquiryFilter, setInquiryFilter] = useState("すべて");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(
    null
  );

  useEffect(() => {
    fetchInquiries();
  }, [inquiryFilter]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const statusValue = STATUS_MAP[inquiryFilter];
      const statusParam = statusValue ? `?status=${statusValue}` : "";
      const response = await fetch(`/api/admin/inquiries${statusParam}`);
      const result = await response.json();

      if (result.success) {
        setInquiries(result.data);
      } else {
        console.error("Failed to fetch inquiries:", result.error);
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusLabel: string) => {
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

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              お問い合わせ管理
            </h2>
          </div>

          {/* ステータスフィルタータブ */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex space-x-2">
              {["すべて", "未対応", "対応中", "対応完了"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setInquiryFilter(filter)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    inquiryFilter === filter
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">読み込み中...</div>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">
                  お問い合わせデータがありません
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名前
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      メールアドレス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      件名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      作成日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      詳細
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {inquiry.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inquiry.customerEmail}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {inquiry.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inquiry.createdDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-md ${getStatusColor(
                            inquiry.statusLabel
                          )}`}
                        >
                          {inquiry.statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedInquiryId(inquiry.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {selectedInquiryId && (
        <InquiryDetailModal
          inquiryId={selectedInquiryId}
          onClose={() => {
            setSelectedInquiryId(null);
            fetchInquiries(); // モーダルを閉じたら一覧を再取得
          }}
        />
      )}
    </>
  );
};

export default InquiriesView;