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
import { Card } from './ui/card';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

type OfflineHubCarouselProps = {
  slides?: HomepageConfig['offlineHubHeroCarousel']['slides'];
};

/**
 * @fileOverview OfflineHubCarousel Component
 * A premium, highly responsive hero carousel optimized for RDC SHOP.
 * Ensures text and buttons never overflow or get cut off on mobile.
 */
export function OfflineHubCarousel({ slides }: OfflineHubCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="px-2 sm:px-0"
              >
                <Card className="relative overflow-hidden rounded-2xl border-none shadow-2xl bg-black aspect-[16/10] sm:aspect-[21/9] md:aspect-[21/6]">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    className="object-cover opacity-60 transition-transform duration-[10000ms] ease-linear group-hover/carousel:scale-110"
                    data-ai-hint={slide.dataAiHint}
                  />
                  
                  {/* High-Impact Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />
                  
                  {/* Responsive Content Container */}
                  <div className="absolute inset-0 z-20 p-5 sm:p-8 md:p-12 flex items-center">
                    <div className="max-w-[85%] sm:max-w-2xl space-y-2 sm:space-y-4">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`badge-${current}`}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 10, opacity: 0 }}
                          className="inline-flex items-center gap-1.5 bg-primary/90 backdrop-blur-md text-white font-black px-3 py-1 rounded-full text-[10px] sm:text-xs md:text-sm uppercase tracking-widest shadow-xl border border-white/20"
                        >
                          <Sparkles className="w-3 h-3" />
                          {slide.title}
                        </motion.div>
                      </AnimatePresence>

                      <motion.h2 
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] drop-shadow-2xl font-headline uppercase tracking-tighter line-clamp-2"
                      >
                        {slide.subtitle}
                      </motion.h2>

                      <motion.div 
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-wrap items-center gap-3 sm:gap-6 pt-1 sm:pt-2"
                      >
                        <div className="flex flex-col">
                          <span className="text-white/60 text-[10px] sm:text-xs line-through font-bold">{slide.originalPrice}</span>
                          <span className="text-xl sm:text-3xl md:text-4xl font-black text-primary drop-shadow-md">{slide.price}</span>
                        </div>
                        
                        <Button asChild className="bg-white hover:bg-primary hover:text-white text-black font-black text-[10px] sm:text-sm md:text-base px-4 sm:px-8 h-9 sm:h-12 md:h-14 rounded-xl shadow-xl transition-all duration-300">
                          <Link href={slide.enrollHref}>
                            ENROLL NOW
                            <ChevronRight className="ml-1 sm:ml-2 w-4 h-4 sm:w-5 h-5" />
                          </Link>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Nav Controls - Desktop Only for UI cleanliness */}
        <div className="hidden lg:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => api?.scrollPrev()}
            className="absolute top-1/2 -translate-y-1/2 left-4 z-30 h-12 w-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/20 text-white hover:bg-primary hover:border-primary transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => api?.scrollNext()}
            className="absolute top-1/2 -translate-y-1/2 right-4 z-30 h-12 w-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/20 text-white hover:bg-primary hover:border-primary transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center items-center gap-2 mt-4 sm:mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'h-1 sm:h-1.5 rounded-full transition-all duration-500',
                current === index ? 'w-6 sm:w-8 bg-primary shadow-lg shadow-primary/20' : 'w-1.5 sm:w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}