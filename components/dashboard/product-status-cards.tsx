import { PackageXIcon } from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowingIcon } from "@/components/ui/glowing-icon";
import type { DashboardOrderType } from "@/data/dashboard";

export async function LowStockCard({
  dataPromise,
  organizationId,
}: {
  dataPromise: Promise<DashboardOrderType>;
  organizationId: string;
}) {
  const data = await dataPromise;
  if (!data || data.lowStockCount === null || data.lowStockCount === 0)
    return null;
  const { lowStockCount, lowStockThreshold, lowStockProducts } = data;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <Card className="shadow-sm border-orange-200 dark:border-orange-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <GlowingIcon icon="BoxesIcon" size="xs" color="#f97316" />
            Low Stock
            <span className="ml-auto text-orange-500 font-bold">
              {lowStockCount}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <p className="text-xs text-muted-foreground mb-2">
            Products with {lowStockThreshold ?? 50} or fewer units
          </p>
          {lowStockProducts?.map((p) => (
            <Link
              key={p.id}
              href={`/${organizationId}/admin/products?stockStatus=low_stock`}
              className="flex items-center gap-2 text-xs hover:bg-muted/60 rounded p-1 transition-colors"
            >
              <span className="flex-1 truncate font-medium">{p.name}</span>
              <span className="text-muted-foreground shrink-0">{p.sku}</span>
              <span className="text-amber-500 font-semibold tabular-nums shrink-0">
                {p.quantity}
              </span>
            </Link>
          ))}
          <Button size="sm" variant="outline" className="w-full mt-1">
            <Link
              href={`/${organizationId}/admin/products?stockStatus=low_stock`}
            >
              View All Low Stock
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export async function OutOfStockCard({
  dataPromise,
  organizationId,
}: {
  dataPromise: Promise<DashboardOrderType>;
  organizationId: string;
}) {
  const data = await dataPromise;
  if (!data || !data.outOfStockProducts || data.outOfStockProducts.length === 0)
    return null;
  const { outOfStockProducts } = data;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <Card className="shadow-sm border-red-200 dark:border-red-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <GlowingIcon icon="PackageX" size="xs" color="#ef4444" />
            Out of Stock
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {outOfStockProducts.map((p) => (
            <Link
              key={p.id}
              href={`/${organizationId}/admin/products?stockStatus=out_of_stock`}
              className="flex items-center gap-2 text-xs hover:bg-muted/60 rounded p-1 transition-colors group"
            >
              <PackageXIcon className="size-3 text-red-500 shrink-0" />
              <span className="flex-1 truncate font-medium">{p.name}</span>
              <span className="text-muted-foreground shrink-0">{p.sku}</span>
            </Link>
          ))}
          <Button size="sm" variant="outline" className="w-full mt-1">
            <Link
              href={`/${organizationId}/admin/products?stockStatus=out_of_stock`}
            >
              View All
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
