
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HomepageConfig } from '@/lib/types';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

type Category = HomepageConfig['categoriesSection']['categories'][0];

export function CategoriesCarousel({ categories }: { categories: Category[] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      opts={{
        align: 'start',
        loop: true,
      }}
    >
      <CarouselContent className="-ml-4">
        {categories.map((category) => (
          <CarouselItem key={category.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
            <Link href={category.linkUrl} className="group block">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg">
                <Image
                  src={category.imageUrl}
                  alt={category.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.6vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={category.dataAiHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 text-white">
                  <h3 className="font-semibold">{category.title}</h3>
                  <p className="text-xs opacity-80">See Works</p>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
