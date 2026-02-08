'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from './ui/button';
import { HomepageConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card } from './ui/card';

type OfflineHubCarouselProps = {
  slides?: HomepageConfig['offlineHubHeroCarousel']['slides'];
};

/**
 * @fileOverview Optimized Offline Hub Carousel.
 * Matches the main page aesthetic by removing heavy black backgrounds.
 * Fully responsive content stack for mobile, tablet, and desktop.
 */
export function OfflineHubCarousel({ slides }: OfflineHubCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        opts={{ loop: true }}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <Card className="overflow-hidden rounded-3xl shadow-xl border border-primary/10 bg-background relative group/card">
                <div className="relative aspect-[16/10] sm:aspect-[21/6] w-full bg-muted">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    priority
                    className="object-cover transition-transform duration-1000 group-hover/card:scale-105"
                    data-ai-hint={slide.dataAiHint}
                  />
                  
                  {/* Subtle Gradient Overlays for Readability - Lightened to match main page */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent sm:bg-gradient-to-r sm:from-black/40 sm:via-transparent sm:to-transparent" />
                  
                  <div className="absolute inset-0 p-6 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between text-white gap-6">
                    <div className="flex-1 space-y-3 text-left">
                      <div className="bg-primary text-white font-black px-4 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] shadow-lg inline-block">
                        {slide.title}
                      </div>
                      <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight max-w-2xl drop-shadow-lg">
                        {slide.subtitle}
                      </h2>
                    </div>
                    
                    <div className="text-left md:text-right shrink-0 flex flex-col items-start md:items-end gap-4 w-full md:w-auto mt-auto md:mt-0 p-4 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:p-0">
                      <div className="flex flex-col items-start md:items-end">
                         <span className="text-xs sm:text-base line-through opacity-80 font-medium">{slide.originalPrice}</span>
                         <span className="text-2xl sm:text-3xl md:text-4xl font-black text-yellow-400 drop-shadow-md">
                            {slide.price}
                         </span>
                      </div>
                      <Button asChild className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8 h-12 shadow-xl transition-all active:scale-95">
                        <Link href={slide.enrollHref}>Enroll Now</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Modern Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'h-1 rounded-full transition-all duration-500', 
                current === index ? 'w-8 bg-white shadow-sm' : 'w-2 bg-white/40 hover:bg-white/60'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}