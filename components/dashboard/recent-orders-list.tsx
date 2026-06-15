/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is required */

import * as motion from "motion/react-client";
import Link from "next/link";
import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardOrderType } from "@/data/dashboard";
import { OrderRow } from "./order-row";

export async function RecentOrdersList({
  dataPromise,
  organizationId,
  isAdmin,
}: {
  dataPromise: Promise<DashboardOrderType>;
  organizationId: string;
  isAdmin: boolean;
}) {
  const data = await dataPromise;
  if (!data) return null;
  const { recentOrders } = data;

  return (
    <CardContent className="space-y-1">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="space-y-1"
      >
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No orders yet.{" "}
            {!isAdmin && (
              <Link
                href={`/${organizationId}/products`}
                className="text-primary underline"
              >
                Browse products
              </Link>
            )}
          </p>
        ) : (
          recentOrders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              orgId={organizationId}
              isAdmin={isAdmin}
            />
          ))
        )}
      </motion.div>
    </CardContent>
  );
}

export function RecentOrdersListSkeleton() {
  return (
    <CardContent className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-2 border-b border-border last:border-0"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </CardContent>
  );
}
