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
              <Card className="overflow-hidden rounded-2xl shadow-lg border-0 bg-black relative">
                <div className="relative aspect-video sm:aspect-[21/6] w-full">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    className="object-cover opacity-70 sm:opacity-100"
                    data-ai-hint={slide.dataAiHint}
                  />
                  {/* Dynamic Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent sm:bg-gradient-to-r sm:from-black/70 sm:via-black/30 sm:to-transparent" />
                  
                  <div className="absolute inset-0 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between text-white gap-6">
                    <div className="flex-1 space-y-3 sm:space-y-4">
                      <div className="bg-yellow-400 text-black font-black px-3 py-1 rounded-md text-[10px] sm:text-xs w-fit uppercase tracking-wider">
                        {slide.title}
                      </div>
                      <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-shadow leading-tight max-w-2xl" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.8)'}}>
                        {slide.subtitle}
                      </h2>
                    </div>
                    
                    <div className="text-left md:text-right shrink-0 flex flex-col items-start md:items-end gap-3 w-full md:w-auto mt-auto md:mt-0">
                      <div className="flex items-baseline gap-2">
                         <span className="text-2xl sm:text-3xl md:text-4xl font-black text-yellow-300 drop-shadow-md">{slide.price}</span>
                         <span className="text-sm sm:text-lg line-through opacity-60">{slide.originalPrice}</span>
                      </div>
                      <Button asChild className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-8 py-6 h-auto text-base sm:text-lg shadow-2xl transition-transform active:scale-95">
                        <Link href={slide.enrollHref} aria-label={`Enroll in ${slide.title}`}>ENROLL NOW!</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 sm:bottom-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300', 
                current === index ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
