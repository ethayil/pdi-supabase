/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is required */

import { PackageIcon } from "lucide-react";
import * as motion from "motion/react-client";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardOrderType } from "@/data/dashboard";
import { STATUS_COLORS, STATUS_ICONS } from "./order-row";

export function OrderStatusListSkeleton() {
  return (
    <CardContent className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
      ))}
    </CardContent>
  );
}

export async function OrderStatusList({
  dataPromise,
}: {
  dataPromise: Promise<DashboardOrderType>;
}) {
  const data = await dataPromise;
  if (!data) return null;
  const { statusBreakdown } = data;

  const activeStatuses = statusBreakdown
    ? Object.entries(statusBreakdown).filter(([, count]) => count > 0)
    : [];

  return (
    <CardContent className="space-y-2">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="space-y-2"
      >
        {activeStatuses.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No active orders.
          </p>
        ) : (
          activeStatuses
            .sort(([, a], [, b]) => b - a)
            .map(([status, count]) => {
              const Icon = STATUS_ICONS[status] ?? PackageIcon;
              return (
                <div
                  key={status}
                  className="flex items-center justify-between text-xs"
                >
                  <span
                    className={`flex items-center gap-1 ${STATUS_COLORS[status] ?? ""}`}
                  >
                    <Icon className="size-3" />
                    <span className="capitalize">
                      {status.replace(/_/g, " ")}
                    </span>
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {count}
                  </Badge>
                </div>
              );
            })
        )}
      </motion.div>
    </CardContent>
  );
}
