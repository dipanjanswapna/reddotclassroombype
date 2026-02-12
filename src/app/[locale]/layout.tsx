import type { Metadata } from 'next';
import '@/app/globals.css';
import { cn } from '@/lib/utils';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { Poppins, Hind_Siliguri, Inter } from 'next/font/google';
import logoSrc from '@/public/logo.png';
import { PageProgressLoader } from '@/components/page-progress-loader';
import { Suspense } from 'react';

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const fontHindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://rdc.vercel.app'),
  title: {
    default: 'RED DOT CLASSROOM (RDC) powered by PRANGONS ECOSYSTEM',
    template: '%s | RED DOT CLASSROOM (RDC)',
  },
  description: 'RED DOT CLASSROOM (RDC) powered by PRANGONS ECOSYSTEM. A modern online learning management system for Bangladesh.',
  icons: {
    icon: logoSrc.src,
    shortcut: logoSrc.src,
    apple: logoSrc.src,
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(
        'font-body antialiased', 
        fontInter.variable, 
        fontPoppins.variable, 
        fontHindSiliguri.variable
      )}>
        <Suspense fallback={null}>
          <PageProgressLoader />
        </Suspense>
        <LayoutWrapper>
            {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
