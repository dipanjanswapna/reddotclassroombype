import React from 'react';
import { OfflineHubFooter } from '@/components/offline-hub-footer';
import { Header } from '@/components/header';
import { getHomepageConfig } from '@/lib/firebase/firestore';

export default async function OfflineHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const homepageConfig = await getHomepageConfig();
  
  return (
    <div className="bg-gray-900 text-white font-bengali">
        <Header variant="dark" homepageConfig={homepageConfig} />
        <main className="pt-16">{children}</main>
        <OfflineHubFooter />
    </div>
  );
}
