
import React from 'react';
import { Footer } from '@/components/footer';
import { getHomepageConfig } from '@/lib/firebase/firestore';

export default async function OfflineHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const homepageConfig = await getHomepageConfig();

  return (
    <div className="bg-gray-900 text-white font-bengali">
        <main>{children}</main>
        <Footer homepageConfig={homepageConfig} />
    </div>
  );
}
