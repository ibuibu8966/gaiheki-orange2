import AdminSidebar from "../../components/Admin/Common/AdminSidebar";
import OrdersView from "../../components/Admin/Orders/OrdersView";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 min-w-0 overflow-y-auto h-screen">
        <OrdersView />
      </main>
    </div>
  );
}