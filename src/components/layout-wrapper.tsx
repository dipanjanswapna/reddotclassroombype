
"use client";

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardPage = 
    pathname.startsWith('/student') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/guardian') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/tutor');

  return (
    <>
      {!isDashboardPage && <Header />}
      <main className="flex-grow flex flex-col">{children}</main>
      {!isDashboardPage && <Footer />}
    </>
  );
}
