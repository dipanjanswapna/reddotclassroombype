
"use client";

import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HomepageConfig } from '@/lib/types';
import { FloatingWhatsAppButton } from './floating-whatsapp-button';

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
  const segment = useSelectedLayoutSegment();

  // The 404 page will not have a layout segment, but the homepage ('/') also has a null segment.
  // We check the pathname to differentiate.
  const isNotFoundPage = segment === null && pathname !== '/';

  const isFullPageLayout =
    isNotFoundPage ||
    pathname.startsWith('/sites/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/seller-program/apply') ||
    pathname.startsWith('/password-reset') ||
    pathname.startsWith('/offline-hub');

  if (isFullPageLayout) {
    return <>{children}</>;
  }
  
  const isDashboardPage = 
    pathname.startsWith('/student') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/guardian') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/moderator') ||
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
      {homepageConfig?.floatingWhatsApp?.display && (
        <FloatingWhatsAppButton number={homepageConfig.floatingWhatsApp.number} />
      )}
    </div>
  );
}
