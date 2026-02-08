
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
import { cn } from '@/lib/utils';

export function StoreBannerCarousel({ banners }: { banners?: StoreHomepageBanner[] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        opts={{
          align: 'center',
          loop: true,
        }}
      >
        <CarouselContent className="-ml-4">
          {banners.map((banner) => (
            <CarouselItem key={banner.id} className="pl-4 basis-full md:basis-[80%] lg:basis-[70%]">
              <Link href={banner.linkUrl || '#'} className="block rounded-[2rem] overflow-hidden group shadow-xl border border-primary/10 transition-all duration-500 hover:shadow-2xl">
                <div className="relative aspect-[16/7] md:aspect-[21/7]">
                  <Image
                    src={banner.imageUrl}
                    alt="Promotional banner"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex left-8 bg-background/40 backdrop-blur-md border-none h-12 w-12 hover:bg-background/80" />
        <CarouselNext className="hidden md:flex right-8 bg-background/40 backdrop-blur-md border-none h-12 w-12 hover:bg-background/80" />
      </Carousel>
    </div>
  );
}
