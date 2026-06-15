/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is required */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationsSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header Placeholder */}
      <div className="flex h-16 items-center justify-between border-b px-6 bg-background sticky top-0 z-50 shrink-0">
        <Skeleton className="h-6 w-56" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 space-y-8 overflow-auto">
        {/* Metric Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <Skeleton className="h-10 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3.5 w-full mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Announcement List Skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Card className="shadow-lg">
            <CardContent className="p-4 space-y-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-3 py-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4.5 w-3/4" />
                  {idx < 3 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
