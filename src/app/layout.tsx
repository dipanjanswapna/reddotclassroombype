

import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { Inter, Poppins, Hind_Siliguri } from 'next/font/google';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import logoSrc from '@/public/logo.png';
import FacebookPixel from '@/components/facebook-pixel';
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
  weight: ['400', '700'],
  variable: '--font-bengali',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://rdc.vercel.app'),
  title: {
    default: 'RED DOT CLASSROOM (RDC) powered by PRANGONS ECOSYSTEM',
    template: '%s | RED DOT CLASSROOM (RDC)',
  },
  description: 'RED DOT CLASSROOM (RDC) powered by PRANGONS ECOSYSTEM. A modern online learning management system for Bangladesh, offering courses for HSC, SSC, Admission Tests, and skills development.',
  icons: {
    icon: logoSrc.src,
    shortcut: logoSrc.src,
    apple: logoSrc.src,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const homepageConfig = await getHomepageConfig();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-body antialiased bg-gradient-to-br from-indigo-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-red-900/50', fontInter.variable, fontPoppins.variable, fontHindSiliguri.variable)}>
        <LayoutWrapper homepageConfig={homepageConfig}>
            {children}
        </LayoutWrapper>
         <Suspense fallback={null}>
            <FacebookPixel />
        </Suspense>
      </body>
    </html>
  );
}
