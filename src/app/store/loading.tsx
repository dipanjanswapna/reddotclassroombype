import { Skeleton } from '@/components/ui/skeleton';

/**
 * @fileOverview Loading state for the RDC Store page.
 * Implements a high-end shimmer skeleton grid that mimics the product card layout
 * and matches the responsive 4-column layout.
 */
export default function Loading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-12">
      {/* Search & Header Skeleton */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <div className="relative w-full max-w-sm">
            <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </div>

      {/* Product Grid Skeleton - 4 Columns Desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-[480px] w-full border rounded-xl overflow-hidden flex flex-col bg-card/30">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="p-4 space-y-4 flex-grow">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-full" />
              <div className="flex justify-between items-end mt-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-7 w-20" />
                </div>
                <Skeleton className="h-10 w-28 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
