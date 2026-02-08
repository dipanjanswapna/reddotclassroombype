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
  type CarouselApi,
} from '@/components/ui/carousel';
import { StoreHomepageBanner } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * @fileOverview Refined Store Banner Carousel.
 * Features ultra-clean layouts, premium glassmorphism dots, and smooth transitions.
 */
export function StoreBannerCarousel({ banners }: { banners?: StoreHomepageBanner[] }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-2 group/main relative">
      <Carousel
        setApi={setApi}
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
              <Link href={banner.linkUrl || '#'} className="block rounded-[2rem] md:rounded-[3rem] overflow-hidden group shadow-xl border border-primary/10 transition-all duration-500 hover:shadow-2xl hover:scale-[1.01]">
                <div className="relative aspect-[16/7] md:aspect-[21/7] bg-muted">
                  <Image
                    src={banner.imageUrl}
                    alt="Promotional banner"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  {/* Premium Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-40" />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex left-8 bg-background/40 backdrop-blur-md border-none h-12 w-12 hover:bg-background/80 transition-opacity opacity-0 group-hover/main:opacity-100 shadow-lg" />
        <CarouselNext className="hidden md:flex right-8 bg-background/40 backdrop-blur-md border-none h-12 w-12 hover:bg-background/80 transition-opacity opacity-0 group-hover/main:opacity-100 shadow-lg" />
      </Carousel>

      {/* Modern Dots */}
      <div className="flex justify-center gap-1.5 mt-6">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              'h-1 rounded-full transition-all duration-500 shadow-sm', 
              current === index ? 'w-8 bg-primary' : 'w-2 bg-muted hover:bg-muted-foreground/50'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}