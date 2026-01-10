"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  newDiagnoses: number;
  pendingQuotations: number;
  activeOrders: number;
  completedOrders: number;
  averageRating: number;
  reviewCount: number;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({
    newDiagnoses: 0,
    pendingQuotations: 0,
    activeOrders: 0,
    completedOrders: 0,
    averageRating: 0,
    reviewCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats({
      newDiagnoses: 5,
      pendingQuotations: 3,
      activeOrders: 8,
      completedOrders: 45,
      averageRating: 4.5,
      reviewCount: 128,
    });
    setLoading(false);
  }, []);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-2 text-gray-600">加盟店の活動状況を確認できます</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">新規診断依頼</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.newDiagnoses}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">対応待ちの依頼</p>
          </div>
        </div>
      </div>
    </div>
  );
}
