'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { HomepageConfig } from '@/lib/types';

type Category = HomepageConfig['categoriesSection']['categories'][0];

export function CategoriesCarousel({ categories }: { categories: Category[] }) {
  return (
    <div className="relative group/carousel">
      <Carousel
        className="w-full"
        opts={{
          align: 'start',
          loop: false,
        }}
      >
        <CarouselContent className="-ml-2">
          {categories.map((category) => (
            <CarouselItem 
              key={category.id} 
              className="pl-2 basis-[45%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-[15.38%]"
            >
              <Link href={category.linkUrl} className="block h-full">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border bg-muted shadow-sm">
                  <Image
                    src={category.imageUrl}
                    alt={category.title}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 15vw"
                    className="object-cover"
                    data-ai-hint={category.dataAiHint}
                  />
                  
                  {/* Modern Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  
                  {/* Content Container */}
                  <div className="absolute inset-0 p-3 flex flex-col justify-end">
                    <h3 className="font-headline text-sm font-bold text-white leading-tight tracking-tight">
                      {category.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-[-1.5rem] bg-background shadow-md hover:bg-accent border-primary/20" />
        <CarouselNext className="right-[-1.5rem] bg-background shadow-md hover:bg-accent border-primary/20" />
      </Carousel>
    </div>
  );
}
