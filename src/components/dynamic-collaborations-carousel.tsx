
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Organization } from '@/lib/types';

const CollaborationsCarousel = dynamic(() => import('@/components/collaborations-carousel').then(mod => mod.CollaborationsCarousel), {
    loading: () => <Skeleton className="h-[200px] w-full" />,
    ssr: false,
});

export function DynamicCollaborationsCarousel({ organizations }: { organizations: Organization[] }) {
    return <CollaborationsCarousel organizations={organizations} />;
}
