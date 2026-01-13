"use client";

import { useState, useEffect } from "react";
import InquiryDetailModal from "./InquiryDetailModal";
import { ResponsiveTable } from "../../Common/ResponsiveTable";

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
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              お問い合わせ管理
            </h2>
          </div>

          {/* ステータスフィルタータブ */}
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {["すべて", "未対応", "対応中", "対応完了"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setInquiryFilter(filter)}
                  className={`px-4 py-3 min-h-[44px] rounded-md text-sm font-medium transition-colors ${
                    inquiryFilter === filter
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* テーブル */}
          <div className="p-4 sm:p-0">
            <ResponsiveTable
              data={inquiries}
              keyField="id"
              isLoading={loading}
              emptyMessage="お問い合わせデータがありません"
              columns={[
                {
                  key: "customerName",
                  label: "名前",
                  priority: 10,
                  render: (i) => <span className="font-medium">{i.customerName}</span>,
                },
                {
                  key: "customerEmail",
                  label: "メールアドレス",
                  hideOnMobile: true,
                },
                {
                  key: "subject",
                  label: "件名",
                  priority: 8,
                },
                {
                  key: "createdDate",
                  label: "作成日",
                  priority: 6,
                },
                {
                  key: "statusLabel",
                  label: "ステータス",
                  priority: 9,
                  render: (i) => (
                    <span className={`px-3 py-1 text-xs font-medium rounded-md ${getStatusColor(i.statusLabel)}`}>
                      {i.statusLabel}
                    </span>
                  ),
                },
              ]}
              onRowClick={(i) => setSelectedInquiryId(i.id)}
              mobileCardTitle={(i) => (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{i.customerName}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(i.statusLabel)}`}>
                    {i.statusLabel}
                  </span>
                </div>
              )}
              mobileCardActions={(i) => (
                <button
                  onClick={() => setSelectedInquiryId(i.id)}
                  className="w-full py-2 text-center text-blue-600 font-medium min-h-[44px] hover:bg-blue-50 rounded transition-colors"
                >
                  詳細を見る
                </button>
              )}
            />
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