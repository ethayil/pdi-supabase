/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is required */

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderListSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-2 md:p-4">
      <div className="w-full flex flex-col gap-2 md:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card
            key={i}
            className="h-full flex flex-col p-4 gap-2 overflow-hidden shadow-lg border bg-card text-card-foreground"
          >
            <CardContent className="p-0 m-0 flex items-center justify-between gap-4">
              <div className="flex w-full items-center gap-12">
                {/* Avatar skeleton */}
                <Skeleton className="size-12 rounded-full shrink-0" />

                {/* Reference/Date skeleton */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>

                {/* Name/Email skeleton */}
                <div className="hidden sm:block space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>

                {/* Address skeleton */}
                <div className="hidden md:block space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>

              {/* Status Badge skeleton */}
              <Skeleton className="h-6 w-20 rounded-full shrink-0" />
            </CardContent>

            <Separator className="my-1" />

            <div className="flex items-center justify-between gap-16 p-0 pl-12 m-0 mt-2">
              {/* Product items preview placeholder */}
              <div className="flex gap-2 w-full max-w-[calc(100%-120px)] overflow-hidden">
                {Array.from({ length: 4 }).map((_, itemIdx) => (
                  <Skeleton
                    key={itemIdx}
                    className="size-16 rounded-md shrink-0"
                  />
                ))}
              </div>

              {/* View/Track button placeholder */}
              <div className="flex flex-col gap-2 shrink-0">
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
