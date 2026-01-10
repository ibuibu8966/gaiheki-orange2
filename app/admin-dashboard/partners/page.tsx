import AdminSidebar from "../../components/Admin/Common/AdminSidebar";
import PartnersView from "../../components/Admin/Partners/PartnersView";

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 min-w-0 overflow-y-auto h-screen">
        <PartnersView />
      </main>
    </div>
  );
}