/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is required */

import { Skeleton } from "@/components/ui/skeleton";

export default function DespatchLoading() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header Skeleton */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar/95 backdrop-blur-sm px-4">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-4 w-px mx-2" />
        <Skeleton className="h-6 w-40 rounded-md" />
      </header>

      <div className="flex flex-col gap-4 p-4">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={`summary-${i}`} className="h-[72px] rounded-xl" />
          ))}
        </div>

        {/* Toolbar Skeleton */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-48 rounded-md" />
        </div>

        {/* Order Rows Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={`row-${i}`} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
