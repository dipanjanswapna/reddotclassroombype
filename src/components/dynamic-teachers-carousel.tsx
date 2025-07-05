
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Instructor } from '@/lib/types';

const TeachersCarousel = dynamic(() => import('@/components/teachers-carousel').then(mod => mod.TeachersCarousel), {
    loading: () => <Skeleton className="h-[250px] w-full" />,
    ssr: false,
});

export function DynamicTeachersCarousel({ instructors, scrollSpeed }: { instructors: Instructor[], scrollSpeed?: number }) {
    return <TeachersCarousel instructors={instructors} scrollSpeed={scrollSpeed} />;
}
