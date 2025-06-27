'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ClassNames from 'embla-carousel-class-names';

const heroBanners = [
  { id: 1, href: '/courses/9', imageUrl: 'https://placehold.co/800x450.png', alt: 'Engineering Program', dataAiHint: 'engineering program' },
  { id: 2, href: '/courses/2', imageUrl: 'https://placehold.co/800x450.png', alt: 'Medical 25 Program', dataAiHint: 'medical program students' },
  { id: 3, href: '/courses/1', imageUrl: 'https://placehold.co/800x450.png', alt: 'ID Timers Batch 25', dataAiHint: 'classroom students' },
  { id: 4, href: '/courses/10', imageUrl: 'https://placehold.co/800x450.png', alt: 'ACS Program', dataAiHint: 'university admission' },
  { id: 5, href: '/courses/13', imageUrl: 'https://placehold.co/800x450.png', alt: 'Arts Program', dataAiHint: 'history book' },
];

export function HeroCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const plugins = [ClassNames()];

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
    <div className="hero-carousel-container">
      <Carousel
        setApi={setApi}
        opts={{ align: 'center', loop: true }}
        plugins={plugins}
        className="w-full hero-carousel"
      >
        <CarouselContent className="-ml-8">
          {heroBanners.map((banner, index) => (
            <CarouselItem
              key={banner.id}
              className="pl-8 basis-full md:basis-[50%] lg:basis-[40%]"
            >
              <Link
                href={banner.href}
                className="block outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
              >
                <div className="carousel-image-wrapper">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.alt}
                    width={800}
                    height={450}
                    priority={index <= 2}
                    className="rounded-xl object-cover"
                    data-ai-hint={banner.dataAiHint}
                  />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <Button
          onClick={() => api?.scrollPrev()}
          variant="ghost"
          size="icon"
          className="hero-carousel-arrow hero-carousel-prev"
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
        <Button
          onClick={() => api?.scrollNext()}
          variant="ghost"
          size="icon"
          className="hero-carousel-arrow hero-carousel-next"
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
      </Carousel>
      <div className="hero-carousel-dots">
        {heroBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => api?.scrollTo(index)}
            className={`hero-carousel-dot ${index === current ? 'active' : ''}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
