
"use client";

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HomepageConfig } from '@/lib/types';

/**
 * @fileOverview LayoutWrapper component.
 * This component acts as a conditional layout manager for the entire application.
 * It inspects the current URL pathname to decide whether to render the main
 * Header and Footer components. This allows for different page types, such as
 * full-page marketing sites (e.g., partner sites), auth pages, and dashboard
 * interfaces, to have distinct layouts.
 */
export function LayoutWrapper({ children, homepageConfig }: { children: React.ReactNode, homepageConfig: HomepageConfig | null }) {
  const pathname = usePathname();
  
  // An array of path prefixes that should have a completely custom layout
  // (i.e., no main Header or Footer from this wrapper).
  const isFullPageLayout =
    pathname.startsWith('/sites/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/partner-program/apply') ||
    pathname.startsWith('/password-reset');

  if (isFullPageLayout) {
    return <>{children}</>;
  }
  
  // An array of path prefixes for internal dashboard pages.
  const isDashboardPage = 
    pathname.startsWith('/student') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/guardian') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/seller');

  if (isDashboardPage) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        {children}
      </div>
    );
  }

  // Default layout for all other pages (e.g., home, about, contact).
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex flex-col">{children}</main>
      <Footer homepageConfig={homepageConfig}/>
    </div>
  );
}
