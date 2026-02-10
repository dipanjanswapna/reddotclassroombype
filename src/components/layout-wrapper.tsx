
"use client";

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { HomepageConfig } from '@/lib/types';
import { FloatingActionButton } from './floating-whatsapp-button';
import { cn } from '@/lib/utils';
import { ThemeProvider } from './theme-provider';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider, useLanguage } from '@/context/language-context';
import { Toaster } from './ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { CartSheet } from './cart-sheet';
import { StoreHeader } from './store-header';
import { StoreFooter } from './store-footer';
import { getHomepageConfig, getStoreCategories } from '@/lib/firebase/firestore';
import React, { Suspense } from 'react';
import FacebookPixel from './facebook-pixel';


const InnerLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [categories, setCategories] = React.useState([]);
  const [homepageConfig, setHomepageConfig] = React.useState<HomepageConfig | null>(null);

  React.useEffect(() => {
    getStoreCategories().then(setCategories as any);
    getHomepageConfig().then(setHomepageConfig);
  }, []);

  const isFullPageLayout =
    pathname.startsWith('/sites/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/seller-program/apply') ||
    pathname.startsWith('/password-reset');
    
  const isOfflineHub = pathname.startsWith('/offline-hub');
  const isStore = pathname.startsWith('/store');

  if (isFullPageLayout || isOfflineHub) {
    return <>{children}</>;
  }

  if (isStore) {
    return (
      <div className={cn(
        "min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900",
        language === 'bn' ? 'font-bengali' : 'font-body'
      )}>
        <StoreHeader categories={categories} />
        <main className="flex-grow pt-16 lg:pt-28">
            {children}
        </main>
        <StoreFooter categories={categories} />
      </div>
    );
  }
  
  const isDashboardPage = 
    pathname.startsWith('/student') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/guardian') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/moderator') ||
    pathname.startsWith('/seller');
    
  const isHomePage = pathname === '/';

  return (
    <div lang={language} dir="ltr">
        <div className={cn(
            "min-h-screen flex flex-col",
            isDashboardPage && "bg-background",
            language === 'bn' ? 'font-bengali' : 'font-body'
        )}>
            <Header homepageConfig={homepageConfig} />
            <main className={cn("flex-grow pt-16", isDashboardPage && "min-h-screen")}>
              {children}
            </main>
            {!isDashboardPage && homepageConfig && <Footer homepageConfig={homepageConfig} />}
             {homepageConfig?.floatingWhatsApp?.display && (
                <FloatingActionButton whatsappNumber={homepageConfig.floatingWhatsApp.number} />
            )}
        </div>
    </div>
  );
}


/**
 * @fileOverview LayoutWrapper component.
 * This component acts as a conditional layout manager for the entire application.
 * It inspects the current URL pathname to decide whether to render the main
 * Header and Footer components. This allows for different page types, such as
 * full-page marketing sites (e.g., partner sites), auth pages, and dashboard
 * interfaces, to have distinct layouts.
 */
export function LayoutWrapper({ children }: { children: React.ReactNode }) {
 return (
     <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
    >
      <AuthProvider>
        <CartProvider>
            <LanguageProvider>
            <InnerLayout>
                {children}
            </InnerLayout>
            <CartSheet />
            <Toaster />
            <Suspense fallback={null}>
                <FacebookPixel />
            </Suspense>
            </LanguageProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
 )
}
