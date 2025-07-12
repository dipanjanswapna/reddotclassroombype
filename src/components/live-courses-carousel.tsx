

'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { CourseCard } from '@/components/course-card';
import type { Course, Organization } from '@/lib/types';

export function LiveCoursesCarousel({ courses, providers }: { courses: Course[], providers?: Organization[] }) {
  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <Carousel opts={{ align: 'start', loop: courses.length > 3 }}>
      <CarouselContent>
        {courses.map((course) => {
          const provider = providers?.find(p => p.id === course.organizationId);
          return (
            <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/4">
              <div className="p-1">
                <CourseCard {...course} provider={provider} partnerSubdomain={provider?.subdomain}/>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="bg-gray-800/50 hover:bg-gray-700/80 text-white"/>
      <CarouselNext className="bg-gray-800/50 hover:bg-gray-700/80 text-white"/>
    </Carousel>
  );
}
