
import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview Loading state for the Courses page.
 * Provides a structured shimmer skeleton grid that matches the flex-wrap layout
 * of the actual course list, ensuring a stable visual transition.
 */
export default function Loading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-12">
      {/* Filter Bar Skeleton */}
      <div className="rounded-xl border bg-card/50 p-6 flex flex-col md:flex-row gap-4 items-center">
        <Skeleton className="h-6 w-24 shrink-0" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </div>

      {/* Course Grid Skeleton */}
      <div className="space-y-12">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48 mx-auto md:mx-0" />
          <div className="flex flex-wrap justify-center sm:justify-start gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[450px] min-w-[280px] flex-1 max-w-[400px] border rounded-xl overflow-hidden flex flex-col bg-card/30">
                <Skeleton className="aspect-[16/10] w-full rounded-none" />
                <div className="p-4 space-y-4 flex-grow">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="p-4 pt-0">
                  <Skeleton className="h-11 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
