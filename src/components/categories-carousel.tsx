
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

/**
 * @fileOverview CategoriesCarousel Component
 * Dynamic categories with px-1 wall-to-wall layout and 20px corners.
 */
export function CategoriesCarousel({ categories }: { categories: CategoryItem[] }) {
  const { language } = useLanguage();
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  if (!categories || categories.length === 0) return null;

  return (
    <div className="px-1">
        <Carousel
        plugins={[plugin.current]}
        className="w-full"
        opts={{
            align: 'start',
            loop: true,
        }}
        >
        <CarouselContent className="-ml-3 md:-ml-4">
            {categories.map((category, index) => {
            const altText = typeof category.title === 'string' 
                ? category.title 
                : (category.title?.[language] || category.title?.['en'] || 'Category Image');

            return (
                <CarouselItem key={category.id} className="pl-3 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                    <Link href={category.linkUrl} className="group block">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-white/40 dark:bg-card/40 backdrop-blur-lg border border-primary/5 shadow-xl transition-all duration-300 hover:shadow-2xl">
                        <Image
                        src={category.imageUrl}
                        alt={altText}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.6vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        data-ai-hint={category.dataAiHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-4 text-white z-10 w-full">
                        <h3 className="font-headline text-sm md:text-base font-black tracking-tight uppercase line-clamp-2 leading-tight">
                            {altText}
                        </h3>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mt-1.5 flex items-center gap-1 group-hover:gap-2 transition-all">
                            {language === 'bn' ? 'দেখুন' : 'Explore'} <span className="text-xs">→</span>
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
    </div>
  );
}
