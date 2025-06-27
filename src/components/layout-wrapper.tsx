"use client";

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/footer';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardPage = 
    pathname.startsWith('/student/dashboard') ||
    pathname.startsWith('/teacher/dashboard') ||
    pathname.startsWith('/guardian/dashboard') ||
    pathname.startsWith('/admin/dashboard');

  return (
    <>
      <main className="flex-grow flex flex-col">{children}</main>
      {!isDashboardPage && <Footer />}
    </>
  );
}
