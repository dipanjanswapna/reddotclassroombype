
import React from 'react';
import { Header } from '@/components/header';
import { OfflineHubFooter } from '@/components/offline-hub-footer';

export default function OfflineHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow">{children}</main>
      <OfflineHubFooter />
    </div>
  );
}
