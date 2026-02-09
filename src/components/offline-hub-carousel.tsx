
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
    <section className="relative w-full overflow-hidden py-6 md:py-10">
      <div className="container mx-auto px-4">
        <Carousel
          setApi={setApi}
          plugins={[plugin.current]}
          className="w-full group/carousel"
          opts={{ loop: true, align: 'center' }}
        >
          <CarouselContent className="-ml-4">
            {slides.map((slide, index) => (
              <CarouselItem key={slide.id} className="pl-4 basis-full">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="relative overflow-hidden rounded-2xl border-white/20 dark:border-white/5 shadow-2xl bg-black aspect-[21/9] md:aspect-[21/6]">
                    <Image
                      src={slide.imageUrl}
                      alt={slide.title}
                      fill
                      priority={index === 0}
                      className="object-cover opacity-70 transition-transform duration-[10000ms] ease-linear group-hover/carousel:scale-110"
                      data-ai-hint={slide.dataAiHint}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 z-20 p-6 md:p-12 flex items-center">
                      <div className="max-w-2xl space-y-4">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={`badge-${current}`}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 20, opacity: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 bg-primary/90 backdrop-blur-md text-white font-black px-4 py-1.5 rounded-full text-xs md:text-sm uppercase tracking-widest shadow-xl border border-white/20"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {slide.title}
                          </motion.div>
                        </AnimatePresence>

                        <motion.h2 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="text-2xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-2xl font-headline uppercase tracking-tighter"
                        >
                          {slide.subtitle}
                        </motion.h2>

                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="flex flex-wrap items-center gap-4 pt-2"
                        >
                          <div className="flex flex-col">
                            <span className="text-white/60 text-xs line-through font-bold">{slide.originalPrice}</span>
                            <span className="text-2xl md:text-4xl font-black text-primary drop-shadow-md">{slide.price}</span>
                          </div>
                          
                          <Button asChild size="lg" className="bg-white hover:bg-primary hover:text-white text-black font-black text-sm md:text-base px-8 h-12 md:h-14 rounded-xl shadow-xl shadow-white/5 transition-all duration-300">
                            <Link href={slide.enrollHref}>
                              ENROLL NOW
                              <ChevronRight className="ml-2 w-5 h-5" />
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

          {/* Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 left-8 right-8 flex justify-between z-30 pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => api?.scrollPrev()}
              className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/20 text-white hover:bg-primary hover:border-primary pointer-events-auto"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => api?.scrollNext()}
              className="h-12 w-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/20 text-white hover:bg-primary hover:border-primary pointer-events-auto"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Indicators */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-500',
                  current === index ? 'w-8 bg-primary shadow-lg shadow-primary/20' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </section>
  );
}
