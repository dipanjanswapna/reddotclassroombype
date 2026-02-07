
'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { HomepageConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

type Category = HomepageConfig['categoriesSection']['categories'][0];

export function CategoriesCarousel({ categories }: { categories: Category[] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })
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
      <CarouselContent className="-ml-4 sm:-ml-6">
        {categories.map((category) => (
          <CarouselItem 
            key={category.id} 
            className="pl-4 sm:pl-6 basis-[70%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
          >
            <Link href={category.linkUrl} className="group block h-full">
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border-2 border-transparent group-hover:border-primary/50 transition-all duration-500 shadow-lg group-hover:shadow-2xl bg-muted"
              >
                <Image
                  src={category.imageUrl}
                  alt={category.title}
                  fill
                  sizes="(max-width: 640px) 70vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  data-ai-hint={category.dataAiHint}
                />
                
                {/* Modern Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content Container */}
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <motion.div
                    className="transform transition-transform duration-500 group-hover:-translate-y-2"
                  >
                    <h3 className="font-headline text-lg font-bold text-white leading-tight tracking-tight">
                      {category.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-2 overflow-hidden">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                            Explore Courses
                        </span>
                        <ArrowRight className="w-3 h-3 text-primary -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    </div>
                  </motion.div>
                </div>

                {/* Subtle Shine Effect */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-1000" />
              </motion.div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
