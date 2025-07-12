
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { LanguageProvider } from '@/context/language-context';
import { Inter, Poppins, Hind_Siliguri } from 'next/font/google';
import { AuthProvider } from '@/context/auth-context';
import { getHomepageConfig } from '@/lib/firebase/firestore';
import logoSrc from '@/public/logo.png';
import Script from 'next/script';
import { ThemeProvider } from '@/components/theme-provider';

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
      <head />
      <body className={cn('font-body antialiased', fontInter.variable, fontPoppins.variable, fontHindSiliguri.variable)}>
        <LayoutWrapper homepageConfig={homepageConfig}>{children}</LayoutWrapper>
        <Script id="tawk-to-script" strategy="lazyOnload">
          {`
            var Tawk_API=Tawk_API||{};
            Tawk_API.onLoad = function(){
                Tawk_API.hideWidget();
            };
            var Tawk_LoadStart=new Date();
            (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/68700613affcbd1910f86331/1ivqpffc4';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
