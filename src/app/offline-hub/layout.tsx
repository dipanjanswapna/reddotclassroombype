
import React from 'react';
import Image from 'next/image';
import { OfflineHubFooter } from '@/components/offline-hub-footer';
import offlineBanner from '@/public/rdcoffline.png';

export default function OfflineHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <main>{children}</main>
      
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
