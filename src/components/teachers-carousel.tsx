'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { Instructor } from '@/lib/types';

export function TeachersCarousel({ instructors }: { instructors: Instructor[] }) {
  if (!instructors || instructors.length === 0) {
    return null;
  }

  return (
    <Carousel opts={{ align: 'start' }} className="w-full">
      <CarouselContent className="-ml-4">
        {instructors.map((instructor) => (
          <CarouselItem key={instructor.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <Link href={`/teachers/${instructor.slug}`} className="block group text-center">
              <div className="relative overflow-hidden rounded-lg">
                <Image
                  src={instructor.avatarUrl}
                  alt={instructor.name}
                  width={250}
                  height={300}
                  className="w-full object-cover aspect-[4/5] transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={instructor.dataAiHint}
                />
                <div className="absolute bottom-2 left-2 right-2 p-2 rounded-md bg-black/30 backdrop-blur-sm text-white">
                  <h3 className="font-semibold text-sm truncate">{instructor.name}</h3>
                  <p className="text-xs opacity-80 truncate">{instructor.title}</p>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="text-foreground -left-4 hidden sm:flex" />
      <CarouselNext className="text-foreground -right-4 hidden sm:flex" />
    </Carousel>
  );
}
