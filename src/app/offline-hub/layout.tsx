
import React from 'react';
import { OfflineHubFooter } from '@/components/offline-hub-footer';
import { Header } from '@/components/header';

export default function OfflineHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 text-white font-bengali">
        <Header variant="dark" />
        <main>{children}</main>
        <OfflineHubFooter />
    </div>
  );
}
