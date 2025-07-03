
'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { CourseCard } from '@/components/course-card';
import type { Course } from '@/lib/types';

export function LiveCoursesCarousel({ courses }: { courses: Course[] }) {
  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <Carousel opts={{ align: 'start', loop: true }}>
      <CarouselContent>
        {courses.map((course) => (
          <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/4">
            <div className="p-1">
              <CourseCard {...course} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="bg-background/50 hover:bg-background/80 text-foreground"/>
      <CarouselNext className="bg-background/50 hover:bg-background/80 text-foreground"/>
    </Carousel>
  );
}
