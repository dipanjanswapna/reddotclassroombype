
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
import { Toaster } from 'sonner';
import { CartProvider } from '@/context/cart-context';
import { CartSheet } from './cart-sheet';
import { StoreHeader } from './store-header';
import { StoreFooter } from './store-footer';
import { getHomepageConfig, getStoreCategories } from '@/lib/firebase/firestore';
import React, { Suspense, useState, useEffect } from 'react';
import FacebookPixel from './facebook-pixel';
import { LenisProvider } from './lenis-provider';
import { NextProgressBar } from './next-progress-bar';
import { AlertCircle, WifiOff } from 'lucide-react';
import { scan } from 'react-scan';

// Initialize react-scan in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  scan({
    enabled: true,
    log: true,
  });
}

// Local hook to avoid react-use barrel optimization issues in Next.js 15
function useIsOnline() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Initial check
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

const NetworkStatus = () => {
  const isOnline = useIsOnline();
  
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-destructive text-destructive-foreground py-2 px-4 flex items-center justify-center gap-2 text-sm font-bold animate-in slide-in-from-top duration-300">
      <WifiOff className="h-4 w-4" />
      <span>You are currently offline. Some features may not work correctly.</span>
    </div>
  );
};

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
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
        <StoreHeader categories={categories} />
        <main className="flex-grow">
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
    
  return (
    <div lang={language} dir="ltr">
        <div className={cn(
            "min-h-screen flex flex-col",
            isDashboardPage && "bg-background"
        )}>
            <Header homepageConfig={homepageConfig} />
            <main className={cn("flex-grow")}>
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
            <LenisProvider>
                <Suspense fallback={null}>
                    <NextProgressBar />
                </Suspense>
                <NetworkStatus />
                <InnerLayout>
                    {children}
                </InnerLayout>
            </LenisProvider>
            <CartSheet />
            <Toaster position="bottom-right" richColors closeButton />
            <Suspense fallback={null}>
                <FacebookPixel />
            </Suspense>
            </LanguageProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
 )
}
