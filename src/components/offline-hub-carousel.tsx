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
 * A high-performance hero carousel optimized for Tablet, Mobile, and Desktop.
 * Features fluid typography and zero-cutoff responsive logic.
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

  // Animation variants for staggered entrance
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
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
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
                {/* Responsive Container: Generous aspect ratios to prevent content cutoff on tab/mobile */}
                <div className="relative w-full overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] shadow-3xl bg-black aspect-[16/12] sm:aspect-[16/8] md:aspect-[21/8] lg:aspect-[21/6]">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    className="object-cover opacity-60 transition-transform duration-[8000ms] ease-linear group-hover/carousel:scale-110"
                    data-ai-hint={slide.dataAiHint}
                  />
                  
                  {/* Cinematic Gradient for Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 z-20 p-6 sm:p-12 md:p-16 lg:p-20 flex items-center">
                    <motion.div 
                      key={`content-${current}`}
                      variants={containerVariants}
                      initial="hidden"
                      animate={current === index ? "visible" : "hidden"}
                      className="w-full max-w-5xl space-y-4 sm:space-y-6"
                    >
                      <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 bg-primary text-white font-black px-4 py-1.5 rounded-full text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-xl border border-white/20"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {slide.title}
                      </motion.div>

                      <motion.h2 
                        variants={itemVariants}
                        className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] drop-shadow-2xl font-headline uppercase tracking-tighter"
                      >
                        {slide.subtitle}
                      </motion.h2>

                      <motion.div 
                        variants={itemVariants}
                        className="flex flex-wrap items-center gap-4 sm:gap-8 pt-2"
                      >
                        <div className="flex flex-col">
                          <span className="text-white/50 text-xs sm:text-sm line-through font-bold tracking-tight">{slide.originalPrice}</span>
                          <span className="text-2xl sm:text-4xl md:text-5xl font-black text-primary drop-shadow-[0_0_20px_rgba(var(--primary),0.5)]">{slide.price}</span>
                        </div>
                        
                        <Button asChild className="bg-white hover:bg-primary hover:text-white text-black font-black text-xs sm:text-base px-6 sm:px-10 h-10 sm:h-14 rounded-xl md:rounded-2xl shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95">
                          <Link href={slide.enrollHref}>
                            ENROLL NOW
                            <ChevronRight className="ml-2 w-4 h-4 sm:w-6 h-6" />
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

        {/* Navigation - Strategic Placement for Tablet/Desktop */}
        <div className="hidden md:flex">
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

        {/* Navigation Progress Indicators */}
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
