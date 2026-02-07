
import React from 'react';
import { OfflineHubFooter } from '@/components/offline-hub-footer';

export default function OfflineHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 text-white font-bengali">
        <main>{children}</main>
        <OfflineHubFooter />
    </div>
  );
}
