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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ClassNames from 'embla-carousel-class-names';
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
 * @fileOverview Modern Hero Carousel component.
 * Features ultra-clean backgrounds using high-blur glassmorphism.
 */
export function HeroCarousel({ banners, autoplaySettings }: { banners: HeroBanner[], autoplaySettings?: AutoplaySettings }) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: autoplaySettings?.autoplayDelay ?? 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const plugins = autoplaySettings?.autoplay ? [ClassNames(), autoplayPlugin.current] : [ClassNames()];

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
    <div className="hero-carousel-container group/main relative w-full overflow-hidden">
      <Carousel
        setApi={setApi}
        opts={{ align: 'center', loop: true }}
        plugins={plugins}
        className="w-full hero-carousel"
      >
        <div className="relative">
            <CarouselContent className="-ml-4 md:-ml-8">
            {banners.map((banner, index) => (
                <CarouselItem
                key={banner.id}
                className="pl-4 md:pl-8 basis-full md:basis-[60%] lg:basis-[45%]"
                >
                <Link
                    href={banner.href}
                    className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-lg transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl"
                >
                    <div className="carousel-image-wrapper relative group/image aspect-[16/9] md:aspect-[21/9] bg-muted">
                    <Image
                        src={banner.imageUrl}
                        alt={banner.alt}
                        fill
                        priority={index === 0}
                        className="object-cover transition-transform duration-1000 group-hover/image:scale-105"
                        data-ai-hint={banner.dataAiHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-40" />
                    
                    <Button
                        onClick={(e) => { e.preventDefault(); api?.scrollPrev(); }}
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-xl hover:bg-white/90 rounded-full h-10 w-10 md:h-12 md:w-12 transition-all opacity-0 group-hover/image:opacity-100 hidden md:flex shadow-2xl border border-white/20"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-foreground" />
                    </Button>
                    <Button
                        onClick={(e) => { e.preventDefault(); api?.scrollNext(); }}
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-xl hover:bg-white/90 rounded-full h-10 w-10 md:h-12 md:w-12 transition-all opacity-0 group-hover/image:opacity-100 hidden md:flex shadow-2xl border border-white/20"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-foreground" />
                    </Button>
                    </div>
                </Link>
                </CarouselItem>
            ))}
            </CarouselContent>
        </div>
      </Carousel>
      
      <div className="hero-carousel-dots mt-6 flex justify-center gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={cn(
                "h-1.5 rounded-full transition-all duration-500 shadow-sm",
                index === current ? 'w-10 bg-primary' : 'w-2.5 bg-muted hover:bg-primary/40'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}