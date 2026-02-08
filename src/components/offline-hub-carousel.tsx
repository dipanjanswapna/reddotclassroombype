
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
 * @fileOverview Refined Offline Hub Carousel.
 * Synchronized with main page aesthetic: removed solid black, added glassmorphism.
 * Standardized padding and vertical rhythm.
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
    <div className="container mx-auto px-4 py-4 md:py-6 max-w-full overflow-hidden">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        opts={{ loop: true }}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <Card className="overflow-hidden rounded-[2.5rem] md:rounded-[3rem] shadow-xl border border-primary/10 bg-background relative group/card">
                <div className="relative aspect-[16/10] sm:aspect-[21/7] md:aspect-[21/6] w-full bg-muted">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    priority
                    className="object-cover transition-transform duration-1000 group-hover/card:scale-105"
                    data-ai-hint={slide.dataAiHint}
                  />
                  
                  {/* Glassmorphism Overlay Logic */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70" />
                  
                  <div className="absolute inset-0 p-6 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between text-white gap-6">
                    <div className="flex-1 space-y-2 sm:space-y-4 text-left max-w-2xl">
                      <div className="bg-primary text-white font-black px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] uppercase tracking-[0.2em] shadow-lg inline-block select-none">
                        {slide.title}
                      </div>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight drop-shadow-xl uppercase tracking-tight">
                        {slide.subtitle}
                      </h2>
                    </div>
                    
                    <div className="text-left md:text-right shrink-0 flex flex-col items-start md:items-end gap-4 w-full md:w-auto mt-auto md:mt-0 p-5 md:p-0 rounded-[2rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl md:bg-transparent md:backdrop-blur-none md:border-none md:shadow-none">
                      <div className="flex flex-col items-start md:items-end">
                         <span className="text-[10px] md:text-sm line-through opacity-70 font-black tracking-widest">{slide.originalPrice}</span>
                         <span className="text-3xl md:text-5xl font-black text-yellow-400 drop-shadow-2xl tracking-tighter">
                            {slide.price}
                         </span>
                      </div>
                      <Button asChild className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl px-10 h-12 md:h-14 shadow-2xl transition-all active:scale-95 border-none">
                        <Link href={slide.enrollHref}>Enroll Now</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'h-1 rounded-full transition-all duration-500 shadow-sm', 
                current === index ? 'w-10 bg-white shadow-xl' : 'w-2.5 bg-white/30 hover:bg-white/60'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
