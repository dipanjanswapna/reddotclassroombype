
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { StoreHomepageBanner } from '@/lib/types';

export function StoreBannerCarousel({ banners }: { banners?: StoreHomepageBanner[] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      opts={{
        align: 'start',
        loop: true,
      }}
    >
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Link href={banner.linkUrl || '#'} className="block rounded-lg overflow-hidden group shadow-md hover:shadow-xl transition-shadow">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={banner.imageUrl}
                    alt="Promotional banner"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </Link>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
}
