'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from './ui/button';
import { HomepageConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

type OfflineHubCarouselProps = {
  slides?: HomepageConfig['offlineHubHeroCarousel']['slides'];
};

/**
 * @fileOverview OfflineHubCarousel Component
 * A premium, highly responsive hero carousel optimized for RDC SHOP.
 * Features unified background blending and zero-cutoff responsive logic.
 */
export function OfflineHubCarousel({ slides }: OfflineHubCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  React.useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full group/carousel"
        opts={{ loop: true, align: 'center' }}
      >
        <CarouselContent className="-ml-0">
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id} className="pl-0 basis-full">
              <div className="px-0 sm:px-0">
                {/* Responsive Container: Taller on mobile to avoid cut-offs */}
                <div className="relative w-full overflow-hidden rounded-[2rem] shadow-2xl bg-black aspect-[16/13] sm:aspect-[21/9] md:aspect-[21/7] lg:aspect-[21/6]">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    className="object-cover opacity-50 transition-transform duration-[10000ms] ease-linear group-hover/carousel:scale-110"
                    data-ai-hint={slide.dataAiHint}
                  />
                  
                  {/* High-Impact Cinematic Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 z-20 p-6 sm:p-10 md:p-16 flex items-center">
                    <div className="w-full max-w-4xl space-y-4 sm:space-y-6">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`badge-${current}`}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="inline-flex items-center gap-2 bg-primary/90 backdrop-blur-xl text-white font-black px-4 py-1.5 rounded-full text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] shadow-xl border border-white/20"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {slide.title}
                        </motion.div>
                      </AnimatePresence>

                      <motion.h2 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] drop-shadow-2xl font-headline uppercase tracking-tighter"
                      >
                        {slide.subtitle}
                      </motion.h2>

                      <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-wrap items-center gap-4 sm:gap-8 pt-2 sm:pt-4"
                      >
                        <div className="flex flex-col">
                          <span className="text-white/50 text-xs sm:text-sm line-through font-bold tracking-tight">{slide.originalPrice}</span>
                          <span className="text-2xl sm:text-4xl md:text-5xl font-black text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.4)]">{slide.price}</span>
                        </div>
                        
                        <Button asChild className="bg-white hover:bg-primary hover:text-white text-black font-black text-xs sm:text-base px-6 sm:px-10 h-10 sm:h-14 rounded-2xl shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95">
                          <Link href={slide.enrollHref}>
                            ENROLL NOW
                            <ChevronRight className="ml-2 w-4 h-4 sm:w-6 h-6" />
                          </Link>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation - Edge aligned for premium look */}
        <div className="hidden lg:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => api?.scrollPrev()}
            className="absolute top-1/2 -translate-y-1/2 left-6 z-30 h-14 w-14 rounded-full bg-black/20 backdrop-blur-2xl border border-white/20 text-white hover:bg-primary hover:border-primary transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => api?.scrollNext()}
            className="absolute top-1/2 -translate-y-1/2 right-6 z-30 h-14 w-14 rounded-full bg-black/20 backdrop-blur-2xl border border-white/20 text-white hover:bg-primary hover:border-primary transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>

        {/* Navigation Progress Dots */}
        <div className="flex justify-center items-center gap-3 mt-6 sm:mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'h-1.5 sm:h-2 rounded-full transition-all duration-500',
                current === index 
                  ? 'w-10 sm:w-12 bg-primary shadow-lg shadow-primary/30' 
                  : 'w-2 sm:w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
