
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-12">
      {/* Search & Header Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-11 w-full max-w-sm" />
      </div>

      {/* Product Grid Skeleton */}
      <div className="flex flex-wrap justify-center sm:justify-start gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-[450px] min-w-[280px] flex-1 max-w-[400px] border rounded-lg overflow-hidden flex flex-col">
            <Skeleton className="aspect-square w-full" />
            <div className="p-4 space-y-3 flex-grow">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-full" />
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
