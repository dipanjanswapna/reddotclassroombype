import React from 'react';
import { notFound } from 'next/navigation';
import { PartnerHeader } from '@/components/partner-header';
import { PartnerFooter } from '@/components/partner-footer';
import { LanguageProvider } from '@/context/language-context';
import { getPartnerBySubdomain } from '@/lib/firebase/firestore';
import { Organization } from '@/lib/types';

/**
 * @fileOverview Partner Site Layout.
 * Updated for Next.js 15 async params compliance and refined visual radius.
 */
export default async function PartnerSiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  const partner: Organization | null = await getPartnerBySubdomain(site);

  if (!partner) {
    notFound();
  }

  const partnerThemeStyle = {
    '--primary': partner.primaryColor || '346.8 77.2% 49.8%',
    '--secondary': partner.secondaryColor || '210 40% 96.1%',
    '--ring': partner.primaryColor || '346.8 77.2% 49.8%',
  } as React.CSSProperties;

  return (
    <LanguageProvider>
        <div style={partnerThemeStyle} className="min-h-screen flex flex-col">
            <PartnerHeader partner={partner} />
            <main className="flex-grow bg-background">{children}</main>
            <PartnerFooter partner={partner} />
        </div>
    </LanguageProvider>
  );
}