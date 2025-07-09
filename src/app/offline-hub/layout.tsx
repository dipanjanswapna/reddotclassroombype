
import React from 'react';
import Image from 'next/image';
import { Header } from '@/components/header';
import { OfflineHubFooter } from '@/components/offline-hub-footer';
import offlineBanner from '@/public/rdcoffline.png';

export default function OfflineHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <Header containerClassName="bg-[rgb(34,25,38)] text-white border-gray-700" />
      <main className="flex-grow">{children}</main>
      
      <div 
        className="relative w-full aspect-[4/3] sm:aspect-video md:aspect-[16/6]"
        style={{ backgroundColor: 'rgb(17, 24, 38)' }}
      >
          <Image
              src={offlineBanner}
              alt="RDC Offline Hub Banner"
              fill
              className="object-contain"
              placeholder="blur"
              data-ai-hint="offline hub banner"
          />
      </div>

      <OfflineHubFooter />
    </div>
  );
}
