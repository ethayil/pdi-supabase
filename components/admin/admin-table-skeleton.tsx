/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is required */

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "../ui/separator";

interface AdminTableSkeletonProps {
  title?: string;
  columnsCount?: number;
  rowsCount?: number;
  showActions?: boolean;
}

export function AdminTableSkeleton({
  title,
  columnsCount = 5,
  rowsCount = 8,
  showActions = true,
}: AdminTableSkeletonProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header Skeleton replicating DashboardHeader */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar/95 backdrop-blur-sm px-4">
        {/* SidebarTrigger placeholder */}
        <div className="w-6 flex items-center justify-center">
          <Skeleton className="size-4 rounded" />
        </div>
        <Separator orientation="vertical" />

        <div className="flex flex-1 items-center justify-between overflow-hidden">
          {title ? (
            <h1 className="text-xl font-bold tracking-tight truncate">
              {title}
            </h1>
          ) : (
            <Skeleton className="h-6 w-40" />
          )}

          <div className="flex items-center gap-2 ml-auto">
            {showActions && (
              <>
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </>
            )}
            {/* NotificationCenter placeholder */}
            <Skeleton className="h-8 w-8 rounded-full ml-1" />
          </div>
        </div>
      </header>

      {/* Main Table Content */}
      <div className="relative flex-1 overflow-hidden flex flex-col p-4 space-y-4">
        {/* Toolbar Skeleton */}
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-9 flex-1 max-w-md rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="relative flex-1 min-h-0 w-full overflow-auto rounded-md border pb-12">
          <Table>
            <TableHeader className="sticky top-0 z-20 bg-white/80 backdrop-blur-md dark:bg-zinc-800/90">
              <TableRow index={0}>
                {Array.from({ length: columnsCount }).map((_, colIdx) => (
                  <TableHead key={colIdx}>
                    <Skeleton className="h-4 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rowsCount }).map((_, rowIdx) => (
                <TableRow key={rowIdx} index={rowIdx}>
                  {Array.from({ length: columnsCount }).map((_, colIdx) => (
                    <TableCell key={colIdx}>
                      <Skeleton
                        className={`h-5 ${colIdx === 0 ? "w-32" : colIdx === columnsCount - 1 ? "w-12 rounded-md" : "w-24"}`}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between shrink-0">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-8 w-36" />
        </div>
      </div>
    </div>
  );
}
