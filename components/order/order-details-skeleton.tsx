/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is required */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderDetailsSkeleton() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header Placeholder */}
      <div className="flex h-16 items-center justify-between border-b px-6 bg-background sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 overflow-auto md:p-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 p-2 md:p-4">
          {/* Left Column - Items & Notes */}
          <div className="lg:col-span-2 space-y-2">
            {/* Items Card Skeleton */}
            <Card className="shadow-lg">
              <CardHeader className="p-4 flex flex-row items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-28 rounded-md" />
              </CardHeader>
              <Separator />
              <CardContent className="p-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-16 rounded-md shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3.5 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Notes Card Skeleton */}
            <Card className="shadow-lg">
              <CardHeader className="p-4">
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <Separator />
              <CardContent className="p-4 space-y-4">
                <Skeleton className="h-16 w-full rounded-md" />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Info Sidebar */}
          <div className="space-y-4">
            {/* General Info Skeleton */}
            <Card className="shadow-lg">
              <CardHeader className="p-4">
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <Separator />
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>

            {/* Logistics & Tracking Skeleton */}
            <Card className="shadow-lg">
              <CardHeader className="p-4">
                <Skeleton className="h-5 w-36" />
              </CardHeader>
              <Separator />
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-full rounded-md mt-2" />
              </CardContent>
            </Card>

            {/* Recipient Address Skeleton */}
            <Card className="shadow-lg">
              <CardHeader className="p-4">
                <Skeleton className="h-5 w-28" />
              </CardHeader>
              <Separator />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
