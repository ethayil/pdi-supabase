/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is required */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CheckoutSkeleton() {
  return (
    <main className="flex-1 space-y-2 md:space-y-4 p-2 md:p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4 h-full">
        {/* Left Column (Main Form skeleton) */}
        <div className="lg:col-span-2 space-y-2 md:space-y-4">
          {/* Previous Addresses Skeleton */}
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="flex gap-2 overflow-x-auto pb-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-48 shrink-0 rounded-lg" />
              ))}
            </CardContent>
          </Card>

          {/* Delivery Address skeleton */}
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-9 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Date skeleton */}
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>

          {/* Order Details skeleton */}
          <Card>
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-9 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-24 w-full animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (Cart Items skeleton) */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="size-16 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3.5 w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </main>
  );
}
