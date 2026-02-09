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
        {categories.map((category, index) => (
          <CarouselItem key={category.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
            >
                <Link href={category.linkUrl} className="group block">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl glassmorphism-card border-white/10 dark:border-white/5 shadow-lg">
                    <Image
                    src={category.imageUrl}
                    alt={category.title[language] || category.title['en']}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.6vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                    data-ai-hint={category.dataAiHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/90" />
                    <div className="absolute bottom-0 left-0 p-4 text-white z-10 w-full">
                    <motion.h3 
                        className="font-headline text-sm md:text-base font-black tracking-tight uppercase line-clamp-2"
                    >
                        {category.title[language] || category.title['en']}
                    </motion.h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-1 group-hover:opacity-100 transition-opacity">
                        {language === 'bn' ? 'কোর্সগুলো দেখুন' : 'See Courses'} &rarr;
                    </p>
                    </div>
                </div>
                </Link>
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
