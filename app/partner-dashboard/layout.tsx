import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PartnerSidebar from "../components/Partner/Common/PartnerSidebar";

export default async function PartnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // サーバーサイド認証チェック
  const session = await auth()

  console.log("[PartnerDashboardLayout] Session:", session ? "exists" : "null")
  if (session?.user) {
    console.log("[PartnerDashboardLayout] UserType:", session.user.userType)
  }

  if (!session?.user || session.user.userType !== "partner") {
    console.log("[PartnerDashboardLayout] Redirecting to login")
    redirect("/auth/partner-login")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PartnerSidebar />
      <main className="flex-1 overflow-y-auto pt-16 sm:pt-0 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
