import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AdminSidebar from "../components/Admin/Common/AdminSidebar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // サーバーサイド認証チェック
  const session = await auth()

  console.log("[AdminDashboardLayout] Session:", session ? "exists" : "null")
  if (session?.user) {
    console.log("[AdminDashboardLayout] UserType:", session.user.userType)
  }

  if (!session?.user || session.user.userType !== "admin") {
    console.log("[AdminDashboardLayout] Redirecting to login")
    redirect("/auth/admin-login")
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto h-screen pt-16 sm:pt-0 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
