'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import ClassNames from 'embla-carousel-class-names';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type HeroBanner = {
  id: number;
  href: string;
  imageUrl: string;
  alt: string;
  dataAiHint: string;
};

type AutoplaySettings = {
  autoplay: boolean;
  autoplayDelay: number;
};

/**
 * @fileOverview HeroCarousel Component
 * A premium, animated carousel for the homepage.
 * Uses Embla Carousel for logic and Framer Motion for UI effects.
 */
export function HeroCarousel({ banners, autoplaySettings }: { banners: HeroBanner[], autoplaySettings?: AutoplaySettings }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: autoplaySettings?.autoplayDelay ?? 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const classNamesPlugin = React.useRef(
    ClassNames({ selected: 'is-selected' })
  );

  const plugins = autoplaySettings?.autoplay 
    ? [classNamesPlugin.current, autoplayPlugin.current] 
    : [classNamesPlugin.current];

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    onSelect();

    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full overflow-hidden py-4 group/carousel"
    >
      <Carousel
        setApi={setApi}
        opts={{ align: 'center', loop: true, skipSnaps: false }}
        plugins={plugins}
        className="w-full"
      >
        <CarouselContent className="-ml-4 md:-ml-8">
          {banners.map((banner, index) => (
            <CarouselItem
              key={banner.id}
              className="pl-4 md:pl-8 basis-[90%] md:basis-[65%] lg:basis-[55%]"
            >
              <Link
                href={banner.href}
                className="block relative group outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl overflow-hidden shadow-lg transition-all duration-500"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.alt || "Hero Banner"}
                    width={1200}
                    height={675}
                    priority={index === 0}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 carousel-banner-image"
                    data-ai-hint={banner.dataAiHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows - Glassmorphism Style */}
        <div className="hidden md:flex">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute left-4 lg:left-12 top-1/2 -translate-y-1/2 z-20">
                <Button
                    onClick={() => api?.scrollPrev()}
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-background/20 backdrop-blur-xl border border-white/20 hover:bg-background/40 hover:border-white/40 shadow-2xl transition-all"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute right-4 lg:right-12 top-1/2 -translate-y-1/2 z-20">
                <Button
                    onClick={() => api?.scrollNext()}
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-background/20 backdrop-blur-xl border border-white/20 hover:bg-background/40 hover:border-white/40 shadow-2xl transition-all"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6 text-white" />
                </Button>
            </motion.div>
        </div>
      </Carousel>

      {/* Modern Progress Dots */}
      <div className="flex justify-center items-center gap-2.5 mt-6">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              index === current 
                ? "w-8 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style jsx global>{`
        .embla__slide {
          transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
          opacity: 0.4;
          transform: scale(0.92);
        }
        .embla__slide.is-selected {
          opacity: 1;
          transform: scale(1);
        }
        .carousel-banner-image {
            filter: grayscale(20%) brightness(0.9);
            transition: all 0.5s ease;
        }
        .is-selected .carousel-banner-image {
            filter: grayscale(0%) brightness(1);
        }
      `}</style>
    </motion.div>
  );
}
