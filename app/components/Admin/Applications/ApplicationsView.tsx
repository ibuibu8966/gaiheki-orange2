"use client";

import { useState, useEffect } from "react";

interface Application {
  id: number;
  companyName: string;
  representativeName: string;
  address: string;
  phone: string;
  email: string;
  websiteUrl: string | null;
  businessDescription: string;
  selfPr: string;
  status: string;
  statusLabel: string;
  prefectures: string[];
  applicationDate: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminMemo?: string;
  reviewNotes?: string;
}

const ApplicationsView = () => {
  const [applicationFilter, setApplicationFilter] = useState("すべて");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [applicationFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (applicationFilter !== "すべて") {
        const statusMap: Record<string, string> = {
          "審査中": "UNDER_REVIEW",
          "承認": "APPROVED",
          "却下": "REJECTED"
        };
        params.append('status', statusMap[applicationFilter]);
      }

      const response = await fetch(`/api/admin/applications?${params}`);
      const data = await response.json();

      if (data.success) {
        setApplications(data.data);
        setError(null);
      } else {
        setError(data.error || '申請の取得に失敗しました');
      }
    } catch (err) {
      setError('申請の取得に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    if (newStatus === "APPROVED") {
      // 承認の場合は加盟店登録画面に遷移
      if (!confirm("この申請を承認しますか？加盟店登録フォームに情報が引き継がれます。")) {
        return;
      }

      // 申請情報をセッションストレージに保存
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        sessionStorage.setItem('pendingPartnerApplication', JSON.stringify({
          applicationId: application.id,
          companyName: application.companyName,
          representativeName: application.representativeName,
          email: application.email,
          phone: application.phone,
          address: application.address,
          websiteUrl: application.websiteUrl,
          businessDescription: application.businessDescription,
          selfPr: application.selfPr,
          prefectures: application.prefectures
        }));

        // 加盟店管理画面に遷移
        window.location.href = '/admin-dashboard/partners?openForm=true';
      }
      return;
    }

    // 却下の場合
    if (!confirm("この申請を却下しますか？")) {
      return;
    }

    try {
      const response = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
          reviewedBy: 1 // TODO: 実際のログインユーザーIDを使用
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('申請を却下しました');
        setSelectedApplication(null);
        fetchApplications();
      } else {
        alert(data.error || 'ステータスの更新に失敗しました');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('ステータスの更新に失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">加盟店申請</h2>
        </div>
        
        {/* ステータスフィルタータブ */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex space-x-2">
            {["すべて", "審査中", "承認", "却下"].map((filter) => (
              <button
                key={filter}
                onClick={() => setApplicationFilter(filter)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  applicationFilter === filter
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
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-sm text-gray-500">読み込み中...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchApplications}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                再読み込み
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">申請が見つかりません</p>
            </div>
          ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">会社名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">代表者名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">住所</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">電話番号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メールアドレス</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申請日</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">詳細</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {application.companyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.representativeName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {application.websiteUrl ? (
                      <a
                        href={application.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        サイト
                      </a>
                    ) : (
                      <span className="text-gray-400">なし</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {application.applicationDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      詳細
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-md ${
                      application.status === "UNDER_REVIEW" ? "bg-yellow-100 text-yellow-800" :
                      application.status === "APPROVED" ? "bg-green-100 text-green-800" :
                      application.status === "REJECTED" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {application.statusLabel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {/* 詳細モーダル */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">申請詳細</h3>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 事業内容・アピール */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">事業内容</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedApplication.businessDescription}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">アピール</h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedApplication.selfPr}</p>
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              {selectedApplication.status === "UNDER_REVIEW" && (
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleStatusChange(selectedApplication.id, "APPROVED")}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                  >
                    承認する
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedApplication.id, "REJECTED")}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                  >
                    却下する
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsView;