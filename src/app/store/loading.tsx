
import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview Loading state for the RDC Store page.
 * Matches the updated square-image product card layout and strict 4-column grid.
 */
export default function Loading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-12">
      {/* Filter Bar Skeleton */}
      <Skeleton className="h-20 w-full rounded-[2.5rem]" />

      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <div className="relative w-full max-w-sm">
            <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </div>

      {/* Product Grid Skeleton - 4 Columns Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-[420px] w-full border rounded-2xl overflow-hidden flex flex-col bg-card/30">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="p-4 space-y-4 flex-grow">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-full" />
              <div className="flex justify-between items-end mt-auto pt-4">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-10" />
                    <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-9 w-20 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
