import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { LanguageProvider } from '@/context/language-context';

export const metadata: Metadata = {
  title: {
    default: 'Red Dot Classroom | Online Learning Platform for Bangladesh',
    template: '%s | Red Dot Classroom',
  },
  description: 'A modern online learning management system for Bangladesh, offering courses for HSC, SSC, Admission Tests, and skills development.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased min-h-screen bg-background')}>
        <LanguageProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
