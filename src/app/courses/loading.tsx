
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Filter Bar Skeleton */}
      <div className="rounded-lg border bg-card p-4 flex flex-col md:flex-row gap-4 items-center">
        <Skeleton className="h-6 w-24 shrink-0" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Course Section Skeleton */}
      <div className="space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="flex flex-wrap justify-center sm:justify-start gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[400px] min-w-[280px] flex-1 max-w-[400px] border rounded-lg overflow-hidden flex flex-col">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="p-4 space-y-3 flex-grow">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="p-4 pt-0">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
