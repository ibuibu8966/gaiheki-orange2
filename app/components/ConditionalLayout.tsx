"use client";

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Routes that should not have header/footer
  const adminRoutes = ['/admin-dashboard', '/partner-dashboard', '/admin-login', '/partner-login'];
  const shouldHideHeaderFooter = adminRoutes.some(route => pathname.startsWith(route));

  if (shouldHideHeaderFooter) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </>
  );
}