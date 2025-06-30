import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { LanguageProvider } from '@/context/language-context';
import { Inter, Poppins } from 'next/font/google'
import { AuthProvider } from '@/context/auth-context';

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: {
    default: 'RED DOT CLASSROOM (RDC) powered by PRANGONS ECOSYSTEM',
    template: '%s | RED DOT CLASSROOM (RDC)',
  },
  description: 'RED DOT CLASSROOM (RDC) powered by PRANGONS ECOSYSTEM. A modern online learning management system for Bangladesh, offering courses for HSC, SSC, Admission Tests, and skills development.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('font-body antialiased min-h-screen bg-background', fontInter.variable, fontPoppins.variable)}>
        <AuthProvider>
          <LanguageProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
