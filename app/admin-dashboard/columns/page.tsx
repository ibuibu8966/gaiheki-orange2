import AdminSidebar from "../../components/Admin/Common/AdminSidebar";
import ColumnsView from "../../components/Admin/Columns/ColumnsView";

export default function ColumnsPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 min-w-0 overflow-y-auto h-screen">
        <ColumnsView />
      </main>
    </div>
  );
}