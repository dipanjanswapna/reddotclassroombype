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
    <div className="container mx-auto px-4 py-4 md:py-8">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        opts={{ loop: true }}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <Card className="overflow-hidden rounded-3xl shadow-2xl border-2 border-primary/20 bg-black relative">
                <div className="relative aspect-[16/10] sm:aspect-[21/6] w-full">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    priority
                    className="object-cover opacity-60 sm:opacity-90"
                    data-ai-hint={slide.dataAiHint}
                  />
                  {/* Robust Multi-directional Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent sm:bg-gradient-to-r sm:from-black/80 sm:via-black/20 sm:to-transparent" />
                  
                  <div className="absolute inset-0 p-6 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between text-white gap-8">
                    <div className="flex-1 space-y-4 text-left">
                      <div className="bg-primary text-white font-black px-4 py-1.5 rounded-full text-[10px] sm:text-xs w-fit uppercase tracking-[0.2em] shadow-lg border border-white/10">
                        {slide.title}
                      </div>
                      <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight max-w-2xl drop-shadow-xl">
                        {slide.subtitle}
                      </h2>
                    </div>
                    
                    <div className="text-left md:text-right shrink-0 flex flex-col items-start md:items-end gap-4 w-full md:w-auto mt-auto md:mt-0 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:p-0">
                      <div className="flex flex-col items-start md:items-end">
                         <span className="text-sm sm:text-lg line-through opacity-60 font-medium">{slide.originalPrice}</span>
                         <span className="text-3xl sm:text-4xl md:text-5xl font-black text-yellow-400 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                            {slide.price}
                         </span>
                      </div>
                      <Button asChild className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl px-10 py-7 h-auto text-lg sm:text-xl shadow-2xl transition-all active:scale-95 border-b-4 border-primary-foreground/20">
                        <Link href={slide.enrollHref} aria-label={`Enroll in ${slide.title}`}>Enroll Now</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Modern Pills Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-500', 
                current === index ? 'w-10 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'w-3 bg-white/30 hover:bg-white/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
