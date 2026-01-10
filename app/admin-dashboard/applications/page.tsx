import AdminSidebar from "../../components/Admin/Common/AdminSidebar";
import ApplicationsView from "../../components/Admin/Applications/ApplicationsView";

export default function ApplicationsPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 min-w-0 overflow-y-auto h-screen">
        <ApplicationsView />
      </main>
    </div>
  );
}