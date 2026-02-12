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
 * High-performance hero carousel optimized for extreme content scaling.
 * Resolved Tailwind ambiguity warning by using inline style for custom duration.
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120 } }
  };

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
                <div className="relative w-full overflow-hidden rounded-[1.5rem] md:rounded-[2rem] shadow-2xl bg-black aspect-[16/10] sm:aspect-[16/7] md:aspect-[21/7] lg:aspect-[21/5]">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    className="object-cover opacity-50 group-hover/carousel:scale-110 transition-transform"
                    style={{ transitionDuration: '8000ms' }}
                    data-ai-hint={slide.dataAiHint}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
                  
                  <div className="absolute inset-0 z-20 p-6 sm:p-10 md:p-14 lg:p-16 flex items-center">
                    <motion.div 
                      key={`content-${current}`}
                      variants={containerVariants}
                      initial="hidden"
                      animate={current === index ? "visible" : "hidden"}
                      className="w-full max-w-4xl space-y-3 sm:space-y-4"
                    >
                      <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-1.5 bg-primary text-white font-black px-3 py-1 rounded-full text-[9px] sm:text-[10px] uppercase tracking-[0.15em] shadow-lg border border-white/10"
                      >
                        <Sparkles className="w-3 h-3" />
                        {slide.title}
                      </motion.div>

                      <motion.h2 
                        variants={itemVariants}
                        className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight drop-shadow-xl font-headline uppercase tracking-tight"
                      >
                        {slide.subtitle}
                      </motion.h2>

                      <motion.div 
                        variants={itemVariants}
                        className="flex flex-wrap items-center gap-3 sm:gap-6 pt-1"
                      >
                        <div className="flex flex-col">
                          <span className="text-white/40 text-[10px] sm:text-xs line-through font-bold">{slide.originalPrice}</span>
                          <span className="text-xl sm:text-2xl md:text-3xl font-black text-primary">{slide.price}</span>
                        </div>
                        
                        <Button asChild size="sm" className="bg-white hover:bg-primary hover:text-white text-black font-black text-[10px] sm:text-xs px-4 sm:px-6 h-8 sm:h-10 rounded-lg md:rounded-xl shadow-xl transition-all duration-300">
                          <Link href={slide.enrollHref}>
                            ENROLL NOW
                            <ChevronRight className="ml-1.5 w-3 h-3 sm:w-4 h-4" />
                          </Link>
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="hidden md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => api?.scrollPrev()}
            className="absolute top-1/2 -translate-y-1/2 left-4 z-30 h-10 w-10 rounded-full bg-black/20 backdrop-blur-xl border border-white/20 text-white hover:bg-primary opacity-0 group-hover/carousel:opacity-100 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => api?.scrollNext()}
            className="absolute top-1/2 -translate-y-1/2 right-4 z-30 h-10 w-10 rounded-full bg-black/20 backdrop-blur-xl border border-white/20 text-white hover:bg-primary opacity-0 group-hover/carousel:opacity-100 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex justify-center items-center gap-2 mt-4 sm:mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                'h-1 rounded-full transition-all duration-500',
                current === index 
                  ? 'w-6 sm:w-8 bg-primary shadow-md' 
                  : 'w-1.5 sm:w-2 bg-muted-foreground/30'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
