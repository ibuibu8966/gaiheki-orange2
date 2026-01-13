import AdminSidebar from "../components/Admin/Common/AdminSidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto h-screen pt-16 sm:pt-0 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
