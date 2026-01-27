"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ResponsiveTable } from "../../Common/ResponsiveTable";
import { ResponsiveModal } from "../../Common/ResponsiveModal";

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
  const { data: session } = useSession();
  const [applicationFilter, setApplicationFilter] = useState("すべて");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const adminId = session?.user?.id ? parseInt(session.user.id) : null;

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
          reviewedBy: adminId
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">加盟店申請</h2>
        </div>

        {/* ステータスフィルタータブ */}
        <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {["すべて", "審査中", "承認", "却下"].map((filter) => (
              <button
                key={filter}
                onClick={() => setApplicationFilter(filter)}
                className={`px-4 py-3 min-h-[44px] rounded-md text-sm font-medium transition-colors ${
                  applicationFilter === filter
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
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchApplications}
                className="mt-4 px-4 py-3 min-h-[44px] bg-primary text-primary-foreground rounded-md hover:bg-primary/90 active:bg-primary/80 transition-colors"
              >
                再読み込み
              </button>
            </div>
          ) : (
            <ResponsiveTable
              data={applications}
              keyField="id"
              isLoading={loading}
              emptyMessage="申請が見つかりません"
              columns={[
                {
                  key: "companyName",
                  label: "会社名",
                  priority: 10,
                  render: (a) => <span className="font-medium">{a.companyName}</span>,
                },
                {
                  key: "representativeName",
                  label: "代表者名",
                  priority: 8,
                },
                {
                  key: "phone",
                  label: "電話番号",
                  priority: 7,
                },
                {
                  key: "email",
                  label: "メールアドレス",
                  hideOnMobile: true,
                },
                {
                  key: "applicationDate",
                  label: "申請日",
                  priority: 6,
                },
                {
                  key: "statusLabel",
                  label: "ステータス",
                  priority: 9,
                  render: (a) => (
                    <span className={`px-3 py-1 text-xs font-medium rounded-md ${getStatusStyle(a.status)}`}>
                      {a.statusLabel}
                    </span>
                  ),
                },
              ]}
              onRowClick={(a) => setSelectedApplication(a)}
              mobileCardTitle={(a) => (
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{a.companyName}</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusStyle(a.status)}`}>
                    {a.statusLabel}
                  </span>
                </div>
              )}
              mobileCardActions={(a) => (
                <button
                  onClick={() => setSelectedApplication(a)}
                  className="w-full py-2 text-center text-primary font-medium min-h-[44px] hover:bg-primary/10 rounded transition-colors"
                >
                  詳細を見る
                </button>
              )}
            />
          )}
        </div>
      </div>

      {/* 詳細モーダル */}
      <ResponsiveModal
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        title="申請詳細"
        size="lg"
        footer={
          selectedApplication?.status === "UNDER_REVIEW" && (
            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
              <button
                onClick={() => handleStatusChange(selectedApplication.id, "REJECTED")}
                className="flex-1 px-4 py-3 min-h-[44px] bg-red-600 text-white rounded-md hover:bg-red-700 active:bg-red-800 font-medium transition-colors"
              >
                却下する
              </button>
              <button
                onClick={() => handleStatusChange(selectedApplication.id, "APPROVED")}
                className="flex-1 px-4 py-3 min-h-[44px] bg-green-600 text-white rounded-md hover:bg-green-700 active:bg-green-800 font-medium transition-colors"
              >
                承認する
              </button>
            </div>
          )
        }
      >
        {selectedApplication && (
          <div className="space-y-6">
            {/* 基本情報 */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">基本情報</h4>
              <div className="bg-gray-50 p-4 rounded-md space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">会社名</p>
                    <p className="font-medium">{selectedApplication.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">代表者名</p>
                    <p className="font-medium">{selectedApplication.representativeName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">電話番号</p>
                    <p className="font-medium">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">メールアドレス</p>
                    <p className="font-medium break-all">{selectedApplication.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">住所</p>
                  <p className="font-medium">{selectedApplication.address}</p>
                </div>
                {selectedApplication.websiteUrl && (
                  <div>
                    <p className="text-sm text-gray-500">Webサイト</p>
                    <a
                      href={selectedApplication.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {selectedApplication.websiteUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* 事業内容 */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">事業内容</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedApplication.businessDescription}</p>
              </div>
            </div>

            {/* アピール */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">アピール</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedApplication.selfPr}</p>
              </div>
            </div>
          </div>
        )}
      </ResponsiveModal>
    </div>
  );
};

export default ApplicationsView;