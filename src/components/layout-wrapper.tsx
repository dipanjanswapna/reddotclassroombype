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

  // Remove locale prefix for layout logic checks
  const segments = pathname.split('/');
  const isLocalized = segments[1] === 'en' || segments[1] === 'bn';
  const cleanPath = isLocalized ? '/' + segments.slice(2).join('/') : pathname;

  const isFullPageLayout =
    cleanPath.startsWith('/login') ||
    cleanPath.startsWith('/signup') ||
    cleanPath.startsWith('/auth/') ||
    cleanPath.startsWith('/password-reset') ||
    cleanPath.startsWith('/seller-program/apply');
    
  const isStore = cleanPath.startsWith('/store') || cleanPath.startsWith('/store/');
  const isOfflineHub = cleanPath.startsWith('/offline-hub');

  if (isFullPageLayout || isOfflineHub) {
    return <>{children}</>;
  }

  if (isStore) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <StoreHeader categories={categories} />
        <main className="flex-grow pt-12 lg:pt-16 px-1">
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
    pathname.startsWith('/seller') ||
    pathname.startsWith('/doubt-solver');

  return (
    <div className={cn(
        "min-h-screen flex flex-col",
        isDashboardPage && "bg-background"
    )}>
        <Header homepageConfig={homepageConfig} />
        <main className={cn("flex-grow pt-16 px-1", isDashboardPage && "min-h-screen")}>
          {children}
        </main>
        {!isDashboardPage && homepageConfig && <Footer homepageConfig={homepageConfig} />}
         {homepageConfig?.floatingWhatsApp?.display && (
            <FloatingActionButton whatsappNumber={homepageConfig.floatingWhatsApp.number} />
        )}
    </div>
  );
}

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
