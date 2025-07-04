
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Course } from '@/lib/types';

const LiveCoursesCarousel = dynamic(() => import('@/components/live-courses-carousel').then(mod => mod.LiveCoursesCarousel), {
    loading: () => <Skeleton className="h-[380px] w-full" />,
    ssr: false,
});

export function DynamicLiveCoursesCarousel({ courses }: { courses: Course[] }) {
    return <LiveCoursesCarousel courses={courses} />;
}
