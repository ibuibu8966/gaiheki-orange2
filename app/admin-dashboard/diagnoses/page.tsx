"use client";

import AdminSidebar from "../../components/Admin/Common/AdminSidebar";
import DiagnosesView from "../../components/Admin/Diagnoses/DiagnosesView";

export default function DiagnosesPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 min-w-0 overflow-y-auto h-screen">
        <DiagnosesView />
      </main>
    </div>
  );
}