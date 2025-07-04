
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Course } from '@/lib/types';

const MasterclassCarousel = dynamic(() => import('@/components/masterclass-carousel').then(mod => mod.MasterclassCarousel), {
    loading: () => <Skeleton className="h-[380px] w-full" />,
    ssr: false,
});

export function DynamicMasterclassCarousel({ courses }: { courses: Course[] }) {
    return <MasterclassCarousel courses={courses} />;
}
