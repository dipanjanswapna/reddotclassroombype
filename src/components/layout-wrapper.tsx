
"use client";

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // These pages have a completely custom layout, no Header or Footer from here.
  const isFullPageLayout =
    pathname.startsWith('/sites/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/teacher-signup') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/partner-program/apply') ||
    pathname.startsWith('/password-reset');

  if (isFullPageLayout) {
    return <>{children}</>;
  }
  
  // These pages get the Header, but not the Footer.
  const isDashboardPage = 
    pathname.startsWith('/student') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/guardian') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/partner');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex flex-col">{children}</main>
      {!isDashboardPage && <Footer />}
    </div>
  );
}
