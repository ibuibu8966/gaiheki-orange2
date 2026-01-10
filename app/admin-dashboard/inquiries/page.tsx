import AdminSidebar from "../../components/Admin/Common/AdminSidebar";
import InquiriesView from "../../components/Admin/Inquiries/InquiriesView";

export default function InquiriesPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 min-w-0 overflow-y-auto h-screen">
        <InquiriesView />
      </main>
    </div>
  );
}