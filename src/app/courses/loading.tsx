import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview Loading state for the Courses page.
 * Provides a structured shimmer skeleton grid that matches the strict 4-column layout.
 */
export default function Loading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 space-y-16">
      {/* Filter Bar Skeleton */}
      <div className="rounded-2xl border bg-card/50 p-6 flex flex-col md:flex-row gap-4 items-center shadow-md">
        <Skeleton className="h-6 w-32 shrink-0 rounded-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>

      {/* Grouped Course Grids Skeleton */}
      {[...Array(2)].map((_, groupIdx) => (
        <div key={groupIdx} className="space-y-8">
          <div className="space-y-4 text-center md:text-left">
            <Skeleton className="h-10 w-64 mx-auto md:mx-0 rounded-lg" />
            <Skeleton className="h-1.5 w-20 bg-primary/20 rounded-full mx-auto md:mx-0" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col border rounded-2xl overflow-hidden bg-card/30 h-[450px]">
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="p-4 space-y-4 flex-grow">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-7 w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                </div>
                <div className="p-4 pt-0">
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}