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
              <Card className="overflow-hidden rounded-2xl shadow-lg border-0 bg-black">
                <div className="relative aspect-video sm:aspect-[21/6] w-full">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    className="object-cover opacity-70 sm:opacity-100"
                    data-ai-hint={slide.dataAiHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent sm:from-black/50" />
                  <div className="absolute inset-0 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between text-white gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="bg-yellow-400 text-black font-black px-3 py-1 rounded-md text-xs w-fit uppercase tracking-tighter">
                        {slide.title}
                      </div>
                      <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-shadow leading-tight" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.5)'}}>
                        {slide.subtitle}
                      </h2>
                    </div>
                    <div className="text-left md:text-right shrink-0 flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
                      <div className="flex items-center gap-2">
                         <span className="text-2xl md:text-3xl font-black text-yellow-300">{slide.price}</span>
                         <span className="text-sm md:text-lg line-through opacity-60">{slide.originalPrice}</span>
                      </div>
                      <Button asChild className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg px-8 py-6 h-auto text-base shadow-xl">
                        <Link href={slide.enrollHref} aria-label={`Enroll in ${slide.title}`}>ENROLL NOW!</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn('w-2 h-2 rounded-full transition-all', current === index ? 'w-6 bg-white' : 'bg-white/50')}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
