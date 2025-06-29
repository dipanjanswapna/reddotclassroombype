
import React from 'react';
import { notFound } from 'next/navigation';
import { PartnerHeader } from '@/components/partner-header';
import { PartnerFooter } from '@/components/partner-footer';
import { LanguageProvider } from '@/context/language-context';
import { getPartnerBySubdomain } from '@/lib/firebase/firestore';
import { Organization } from '@/lib/types';

export default async function PartnerSiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { site: string };
}) {
  const partner: Organization | null = await getPartnerBySubdomain(params.site);

  if (!partner) {
    notFound();
  }

  // Define CSS variables for dynamic theming
  const partnerThemeStyle = {
    '--primary': partner.primaryColor,
    '--secondary': partner.secondaryColor,
    '--ring': partner.primaryColor,
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
