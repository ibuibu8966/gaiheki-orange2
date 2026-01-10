"use client";

import { useState, useEffect } from "react";
import OrderDetailModal from "./OrderDetailModal";

interface Order {
  id: number;
  diagnosisId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  quotationAmount: number;
  partnerName: string;
  status: string;
  statusLabel: string;
}

const STATUS_MAP: Record<string, string> = {
  "すべて": "",
  "受注": "ORDERED",
  "施工中": "IN_PROGRESS",
  "施工完了": "COMPLETED",
  "評価完了": "REVIEW_COMPLETED",
  "キャンセル": "CANCELLED",
};

const OrdersView = () => {
  const [orderFilter, setOrderFilter] = useState("すべて");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [orderFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const statusValue = STATUS_MAP[orderFilter];
      const statusParam = statusValue ? `?status=${statusValue}` : "";
      const response = await fetch(`/api/admin/orders${statusParam}`);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
      } else {
        console.error("Failed to fetch orders:", result.error);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  const getStatusBadgeClass = (statusLabel: string) => {
    switch (statusLabel) {
      case "受注":
        return "bg-blue-100 text-blue-800";
      case "施工中":
        return "bg-orange-100 text-orange-800";
      case "施工完了":
        return "bg-green-100 text-green-800";
      case "評価完了":
        return "bg-purple-100 text-purple-800";
      case "キャンセル":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">受注管理</h2>
          </div>

          {/* ステータスフィルタータブ */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex space-x-2">
              {["すべて", "受注", "施工中", "施工完了", "評価完了", "キャンセル"].map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setOrderFilter(filter)}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      orderFilter === filter
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">読み込み中...</div>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">受注データがありません</div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      診断ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      顧客名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      電話番号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      メールアドレス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      施工住所
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      施工金額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      施工業者
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
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.diagnosisId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customerPhone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customerEmail}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatAmount(order.quotationAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.partnerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-md ${getStatusBadgeClass(
                            order.statusLabel
                          )}`}
                        >
                          {order.statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
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

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => {
            setSelectedOrderId(null);
            fetchOrders(); // モーダルを閉じたら一覧を再取得
          }}
        />
      )}
    </>
  );
};

export default OrdersView;
