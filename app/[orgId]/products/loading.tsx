/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is required */

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex h-16 items-center justify-between border-b px-6 bg-background sticky top-0 z-50">
        <span className="font-semibold text-sm">Products</span>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-40 rounded-md animate-pulse" />
          <Skeleton className="h-9 w-24 rounded-md animate-pulse" />
        </div>
      </div>

      <div className="flex-1 space-y-4 p-2 md:p-4">
        {/* Product Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-xs h-[340px]">
              {/* Product Image placeholder */}
              <Skeleton className="h-44 w-full rounded-none" />
              <CardContent className="p-3 space-y-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-4/5" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
