
"use client";

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HomepageConfig } from '@/lib/types';
import { FloatingActionButton } from './floating-whatsapp-button';
import { cn } from '@/lib/utils';

/**
 * @fileOverview LayoutWrapper component.
 * This component acts as a conditional layout manager for the entire application.
 * It inspects the current URL pathname to decide whether to render the main
 * Header and Footer components. This allows for different page types, such as
 * full-page marketing sites (e.g., partner sites), auth pages, and dashboard
 * interfaces, to have distinct layouts.
 */
export function LayoutWrapper({ children, homepageConfig }: { children: React.ReactNode, homepageConfig: HomepageConfig }) {
  const pathname = usePathname();

  // Paths that should have a completely custom layout (no header/footer)
  const isFullPageLayout =
    pathname.startsWith('/sites/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/seller-program/apply') ||
    pathname.startsWith('/password-reset');
    
  // The offline hub has its own special layout, so we exclude it from the default wrapper.
  const isOfflineHub = pathname.startsWith('/offline-hub');

  if (isFullPageLayout || isOfflineHub) {
    return <>{children}</>;
  }
  
  // Paths for dashboard interfaces which have a header but no footer
  const isDashboardPage = 
    pathname.startsWith('/student') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/guardian') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/moderator') ||
    pathname.startsWith('/seller');
    
  const isHomePage = pathname === '/';

  if (isDashboardPage) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow">{children}</main>
      </div>
    );
  }

  // Default layout for all other pages (e.g., home, about, contact, and now 404)
  return (
    <div className={cn("min-h-screen flex flex-col", isHomePage ? "bg-[#FFFDF6]" : "bg-background")}>
      <Header />
      <main>{children}</main>
      <Footer homepageConfig={homepageConfig}/>
      {homepageConfig.floatingWhatsApp?.display && (
        <FloatingActionButton whatsappNumber={homepageConfig.floatingWhatsApp.number} />
      )}
    </div>
  );
}
