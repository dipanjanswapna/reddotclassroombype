'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CategoryItem } from '@/lib/types';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/language-context';

export function CategoriesCarousel({ categories }: { categories: CategoryItem[] }) {
  const { language } = useLanguage();
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
        {categories.map((category, index) => {
          // Robust alt text generation with fallbacks
          const altText = typeof category.title === 'string' 
            ? category.title 
            : (category.title?.[language] || category.title?.['en'] || 'Category Image');

          return (
            <CarouselItem key={category.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                  <Link href={category.linkUrl} className="group block">
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-white/40 dark:bg-card/40 backdrop-blur-lg border border-white/20 dark:border-white/5 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-1">
                      <Image
                      src={category.imageUrl}
                      alt={altText}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.6vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110 grayscale-[10%] group-hover:grayscale-0"
                      data-ai-hint={category.dataAiHint}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/100" />
                      <div className="absolute bottom-0 left-0 p-4 text-white z-10 w-full">
                      <motion.h3 
                          className="font-headline text-sm md:text-base font-black tracking-tight uppercase line-clamp-2 drop-shadow-md"
                      >
                          {altText}
                      </motion.h3>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-1 group-hover:opacity-100 transition-all flex items-center gap-1 group-hover:gap-2">
                          {language === 'bn' ? 'কোর্সগুলো দেখুন' : 'See Courses'} <span className="text-xs">→</span>
                      </p>
                      </div>
                  </div>
                  </Link>
              </motion.div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}
