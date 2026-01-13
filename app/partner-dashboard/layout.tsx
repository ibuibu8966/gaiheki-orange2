import PartnerSidebar from "../components/Partner/Common/PartnerSidebar";

export default function PartnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <PartnerSidebar />
      <main className="flex-1 overflow-y-auto pt-16 sm:pt-0 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
