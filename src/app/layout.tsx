
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { LanguageProvider } from '@/context/language-context';
import { Inter, Poppins, Hind_Siliguri } from 'next/font/google';
import { AuthProvider } from '@/context/auth-context';
import { getHomepageConfig } from '@/lib/firebase/firestore';

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
})

const fontHindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '700'],
  variable: '--font-bengali',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://rdc.vercel.app'),
  title: {
    default: 'RED DOT CLASSROOM (RDC) powered by PRANGONS ECOSYSTEM',
    template: '%s | RED DOT CLASSROOM (RDC)',
  },
  description: 'RED DOT CLASSROOM (RDC) powered by PRANGONS ECOSYSTEM. A modern online learning management system for Bangladesh, offering courses for HSC, SSC, Admission Tests, and skills development.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const homepageConfig = await getHomepageConfig();
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('font-body antialiased min-h-screen bg-background', fontInter.variable, fontPoppins.variable, fontHindSiliguri.variable)}>
        <AuthProvider>
          <LanguageProvider>
            <LayoutWrapper homepageConfig={homepageConfig}>{children}</LayoutWrapper>
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
