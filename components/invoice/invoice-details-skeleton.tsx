/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is required */

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function InvoiceDetailsSkeleton() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header Placeholder */}
      <div className="flex h-16 items-center justify-between border-b px-6 bg-background sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="flex-1 overflow-auto md:p-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 p-2 md:p-4">
          {/* Left Column - Orders and Charges */}
          <div className="lg:col-span-2 space-y-2">
            {/* Orders Card Skeleton */}
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
                <Separator className="my-2" />
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="border p-2 rounded-md flex justify-between items-center gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <div className="space-y-1.5 text-right flex-1 flex flex-col items-end">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-2.5 w-20" />
                        <Skeleton className="h-2.5 w-16" />
                      </div>
                      <div className="flex gap-1">
                        <Skeleton className="h-7 w-7 rounded-md" />
                        <Skeleton className="h-7 w-7 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Charges Card Skeleton */}
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
                <Separator className="my-2" />
                <div className="space-y-2">
                  {Array.from({ length: 1 }).map((_, i) => (
                    <div
                      key={i}
                      className="border p-2 rounded-md flex justify-between items-center gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4.5 w-20 rounded-full" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="space-y-1.5 text-right flex items-center gap-2">
                        <div className="flex flex-col items-end space-y-1">
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-2.5 w-16" />
                          <Skeleton className="h-2.5 w-14" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-7 w-7 rounded-md" />
                          <Skeleton className="h-7 w-7 rounded-md" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Invoice Details */}
          <div className="space-y-2">
            {/* General Info Skeleton */}
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-36" />
                <Separator className="my-2" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Totals Skeleton */}
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-16" />
                <Separator className="my-2" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes Skeleton */}
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-16" />
                <Separator className="my-2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
