"use client";

import { useState, useEffect } from "react";

// ステータスのラベルマッピング
const STATUS_LABELS: Record<string, string> = {
  ORDERED: "受注",
  IN_PROGRESS: "施工中",
  COMPLETED: "施工完了",
  CANCELLED: "キャンセル"
};

interface Order {
  id: number;
  diagnosisId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  constructionAddress: string;
  constructionAmount: number;
  quotationAmount: number;
  partnerMemo: string | null;
  constructionStartDate: string | null;
  constructionEndDate: string | null;
  orderStatus: string;
  orderDate: string;
  photos: Array<{
    id: number;
    photoUrl: string;
    photoType: string | null;
    description: string | null;
    uploadedAt: string;
  }>;
  customerId: number;
  quotationId: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // 編集モーダル管理
  const [editModal, setEditModal] = useState<{ isOpen: boolean; order: Order | null }>({ isOpen: false, order: null });

  // 編集フォーム
  const [editForm, setEditForm] = useState<{
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    constructionAddress: string;
    constructionAmount: string;
    partnerMemo: string;
    constructionStartDate: string;
    constructionEndDate: string;
    orderStatus: string;
  }>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    constructionAddress: "",
    constructionAmount: "",
    partnerMemo: "",
    constructionStartDate: "",
    constructionEndDate: "",
    orderStatus: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = statusFilter
        ? `/api/partner/orders?status=${statusFilter}`
        : '/api/partner/orders';

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      } else {
        alert(data.error || '受注一覧の取得に失敗しました');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      alert('受注一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (order: Order) => {
    setEditForm({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      constructionAddress: order.constructionAddress,
      constructionAmount: order.constructionAmount.toString(),
      partnerMemo: order.partnerMemo || "",
      constructionStartDate: order.constructionStartDate || "",
      constructionEndDate: order.constructionEndDate || "",
      orderStatus: order.orderStatus
    });
    setEditModal({ isOpen: true, order });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, order: null });
    setSelectedFiles(null);
  };

  const handlePhotoUpload = async () => {
    if (!editModal.order || !selectedFiles || selectedFiles.length === 0) {
      alert('写真を選択してください');
      return;
    }

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('orderId', editModal.order.id.toString());

      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('photos', selectedFiles[i]);
      }

      const response = await fetch('/api/partner/orders/photos', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert('写真をアップロードしました');
        setSelectedFiles(null);

        // 受注データを再取得
        await fetchOrders();

        // モーダルの受注データを更新
        const updatedOrders = await fetch('/api/partner/orders').then(res => res.json());
        if (updatedOrders.success) {
          const updatedOrder = updatedOrders.data.find((o: Order) => o.id === editModal.order?.id);
          if (updatedOrder) {
            setEditModal({ isOpen: true, order: updatedOrder });
          }
        }
      } else {
        alert(data.error || '写真のアップロードに失敗しました');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      alert('写真のアップロードに失敗しました');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!editModal.order) return;

    if (!editForm.customerName || !editForm.customerPhone || !editForm.customerEmail || !editForm.constructionAddress || !editForm.constructionAmount) {
      alert('必須項目を入力してください');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch('/api/partner/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: editModal.order.id,
          customerName: editForm.customerName,
          customerPhone: editForm.customerPhone,
          customerEmail: editForm.customerEmail,
          constructionAddress: editForm.constructionAddress,
          constructionAmount: editForm.constructionAmount,
          partnerMemo: editForm.partnerMemo,
          constructionStartDate: editForm.constructionStartDate || null,
          constructionEndDate: editForm.constructionEndDate || null,
          orderStatus: editForm.orderStatus
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('受注情報を更新しました');

        // 施工完了の場合は確認メッセージ
        if (editForm.orderStatus === 'COMPLETED') {
          alert('施工完了に変更しました。この案件は施工完了管理に移動します。');
        }

        closeEditModal();
        await fetchOrders();
      } else {
        alert(data.error || '受注情報の更新に失敗しました');
      }
    } catch (error) {
      console.error('Update order error:', error);
      alert('受注情報の更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow">
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">受注管理</h2>
          </div>

          {/* ステータスフィルタータブ */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter("")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === ""
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                すべて
              </button>
              <button
                onClick={() => setStatusFilter("ORDERED")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === "ORDERED"
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                受注
              </button>
              <button
                onClick={() => setStatusFilter("IN_PROGRESS")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === "IN_PROGRESS"
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                施工中
              </button>
              <button
                onClick={() => setStatusFilter("CANCELLED")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === "CANCELLED"
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                キャンセル
              </button>
            </div>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                受注案件がありません
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">診断ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">顧客名</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">施工住所</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">施工金額</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">メールアドレス</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">受注日</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{order.diagnosisId}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{order.customerName}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{order.constructionAddress}</td>
                      <td className="px-4 py-4 text-sm font-bold text-blue-600">
                        ¥{order.constructionAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{order.customerEmail}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.orderStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                          order.orderStatus === 'ORDERED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {STATUS_LABELS[order.orderStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {new Date(order.orderDate).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <button
                          onClick={() => openEditModal(order)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
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

      {/* 編集モーダル */}
      {editModal.isOpen && editModal.order && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto" onClick={closeEditModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">受注情報編集</h3>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* 案件情報 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-bold text-gray-700 mb-2">案件情報</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">診断ID:</span>
                    <span className="font-medium text-gray-900">{editModal.order.diagnosisId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">元の見積もり金額:</span>
                    <span className="font-medium text-gray-900">¥{editModal.order.quotationAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* フォーム */}
              <div className="space-y-6">
                {/* 顧客情報セクション */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">顧客情報</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        顧客名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.customerName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, customerName: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        電話番号 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={editForm.customerPhone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        メールアドレス <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={editForm.customerEmail}
                        onChange={(e) => setEditForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        施工住所 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.constructionAddress}
                        onChange={(e) => setEditForm(prev => ({ ...prev, constructionAddress: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 写真管理セクション */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">現場写真</h4>

                  {/* 既存の写真一覧 */}
                  {editModal.order.photos && editModal.order.photos.length > 0 ? (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">登録済みの写真 ({editModal.order.photos.length}枚)</p>
                      <div className="grid grid-cols-3 gap-4">
                        {editModal.order.photos.map((photo) => {
                          console.log('Photo URL:', photo.photoUrl);
                          return (
                          <div key={photo.id} className="relative">
                            <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={photo.photoUrl}
                                alt={photo.description || '現場写真'}
                                className="w-full h-full object-cover"
                                style={{ display: 'block' }}
                                onLoad={(e) => {
                                  console.log('✅ Image loaded:', photo.photoUrl);
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                onError={(e) => {
                                  console.error('❌ Image load error:', photo.photoUrl);
                                  console.error('Full URL attempted:', e.currentTarget.src);
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%236b7280" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="12"%3E読込失敗%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                            {photo.description && (
                              <p className="text-xs text-gray-600 mt-1 truncate">{photo.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(photo.uploadedAt).toLocaleDateString('ja-JP')}
                            </p>
                          </div>
                        );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 text-center py-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">まだ写真がアップロードされていません</p>
                    </div>
                  )}

                  {/* 写真アップロード */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="mt-4">
                        <label htmlFor="photo-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            写真をアップロード
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PNG, JPG, GIF (最大10MB)
                          </span>
                          <input
                            id="photo-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setSelectedFiles(e.target.files)}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      {selectedFiles && selectedFiles.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-700">
                            {selectedFiles.length}枚の写真を選択中
                          </p>
                          <button
                            onClick={handlePhotoUpload}
                            disabled={uploadingPhoto}
                            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {uploadingPhoto ? 'アップロード中...' : '写真をアップロード'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 施工情報セクション */}
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4">施工情報</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        施工金額(円) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={editForm.constructionAmount}
                        onChange={(e) => setEditForm(prev => ({ ...prev, constructionAmount: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        ステータス
                      </label>
                      <select
                        value={editForm.orderStatus}
                        onChange={(e) => setEditForm(prev => ({ ...prev, orderStatus: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      >
                        <option value="ORDERED">受注</option>
                        <option value="IN_PROGRESS">施工中</option>
                        <option value="COMPLETED">施工完了</option>
                        <option value="CANCELLED">キャンセル</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        施工開始予定日
                      </label>
                      <input
                        type="date"
                        value={editForm.constructionStartDate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, constructionStartDate: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        施工終了予定日
                      </label>
                      <input
                        type="date"
                        value={editForm.constructionEndDate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, constructionEndDate: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        加盟店メモ
                      </label>
                      <textarea
                        value={editForm.partnerMemo}
                        onChange={(e) => setEditForm(prev => ({ ...prev, partnerMemo: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="施工に関するメモを記入してください"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleUpdateOrder}
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '更新中...' : '更新する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
