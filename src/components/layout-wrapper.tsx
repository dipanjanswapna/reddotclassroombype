
"use client";

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullPageLayout = 
    pathname.startsWith('/student') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/guardian') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/partner') || // Partner's own dashboard
    pathname.startsWith('/sites/') ||   // Partner's public site
    pathname.startsWith('/tutor') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/teacher-signup') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/partner-program/apply') ||
    pathname.startsWith('/password-reset');

  if (isFullPageLayout) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
