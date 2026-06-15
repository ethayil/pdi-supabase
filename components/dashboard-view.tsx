/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is required */

import * as motion from "motion/react-client";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/data/dashboard";
import { getSession } from "@/lib/auth/get-session";
import { InvoiceSummaryCard } from "./dashboard/invoice-summary-card";
import {
  OrderStatusList,
  OrderStatusListSkeleton,
} from "./dashboard/order-status-list";
import { LowStockCard, OutOfStockCard } from "./dashboard/product-status-cards";
import {
  RecentOrdersList,
  RecentOrdersListSkeleton,
} from "./dashboard/recent-orders-list";
import { StatCard } from "./dashboard/stat-card";
import { GlowingIcon } from "./ui/glowing-icon";

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(
    v,
  );

export async function DashboardView({
  organizationId,
}: {
  organizationId: string;
}) {
  const { user } = await getSession();
  if (!user) return null;

  const role =
    user.role === "superAdmin"
      ? "superadmin"
      : user.role === "orgAdmin"
        ? "admin"
        : "user";
  const isAdmin = role === "admin" || role === "superadmin";
  const isSuperadmin = role === "superadmin";

  // Create the promise for dashboard data
  const dataPromise = getDashboardData({ orgId: organizationId });

  if (!isAdmin) {
    return (
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="My Orders"
            value={dataPromise.then((d) => d?.ordersCount ?? 0)}
            icon="Package"
            color="#3b82f6"
            delay={0}
          />
          <StatCard
            title="In Transit"
            value={dataPromise.then(
              (d) =>
                d?.recentOrders.filter(
                  (o) => o.status === "shipped" || o.status === "on_the_way",
                ).length ?? 0,
            )}
            icon="Truck"
            color="#6366f1"
            delay={0.05}
          />
          <StatCard
            title="Delivered"
            value={dataPromise.then(
              (d) =>
                d?.recentOrders.filter((o) => o.status === "delivered")
                  .length ?? 0,
            )}
            icon="CheckCircle2"
            color="#10b981"
            delay={0.1}
          />
          <StatCard
            title="New Order"
            value={
              <Link
                href={`/${organizationId}/orders/new`}
                className="text-primary hover:underline text-2xl"
              >
                Place Order →
              </Link>
            }
            icon="ShoppingCart"
            color="#8b5cf6"
            delay={0.15}
          />
        </div>

        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold">
                Recent Orders
              </CardTitle>
              <Button size="sm" variant="ghost">
                <Link href={`/${organizationId}/orders`}>View all</Link>
              </Button>
            </CardHeader>
            <Suspense fallback={<RecentOrdersListSkeleton />}>
              <RecentOrdersList
                dataPromise={dataPromise}
                organizationId={organizationId}
                isAdmin={false}
              />
            </Suspense>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Admin / Superadmin View
  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Orders"
          value={dataPromise.then((d) => d?.orgOrdersTotal ?? 0)}
          icon="Package"
          color="#3b82f6"
          delay={0}
          sub={isSuperadmin ? "All orgs — your org" : undefined}
        />
        <StatCard
          title="Pending Dispatch"
          value={dataPromise.then(
            (d) =>
              (d?.statusBreakdown?.pending ?? 0) +
              (d?.statusBreakdown?.processing ?? 0),
          )}
          icon="Clock"
          color="#f59e0b"
          delay={0.05}
        />
        <StatCard
          title="Exceptions / Delays"
          value={dataPromise.then(
            (d) =>
              (d?.statusBreakdown?.exception ?? 0) +
              (d?.statusBreakdown?.delay ?? 0),
          )}
          icon="AlertTriangle"
          color="#ef4444"
          delay={0.1}
        />
        <StatCard
          title="Outstanding Invoices"
          value={dataPromise.then((d) =>
            d?.invoiceSummary
              ? formatCurrency(d.invoiceSummary.outstandingTotal)
              : "—",
          )}
          icon="ReceiptText"
          color="#8b5cf6"
          delay={0.15}
          sub={dataPromise.then((d) =>
            d?.invoiceSummary
              ? `${d.invoiceSummary.sent} sent · ${d.invoiceSummary.overdue} overdue`
              : undefined,
          )}
        />
      </div>

      {/* Middle row: orders + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent orders */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <GlowingIcon icon="ListOrdered" size="xs" color="#3b82f6" />
                Recent Orders
              </CardTitle>
              <Button size="sm" variant="ghost">
                <Link href={`/${organizationId}/admin/orders`}>View all</Link>
              </Button>
            </CardHeader>
            <Suspense fallback={<RecentOrdersListSkeleton />}>
              <RecentOrdersList
                dataPromise={dataPromise}
                organizationId={organizationId}
                isAdmin={true}
              />
            </Suspense>
          </Card>
        </motion.div>

        {/* Sidebar stats */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          {/* Order Status */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <GlowingIcon icon="TrendingUp" size="xs" color="#0ce3ff" />
                Order Status
              </CardTitle>
            </CardHeader>
            <Suspense fallback={<OrderStatusListSkeleton />}>
              <OrderStatusList dataPromise={dataPromise} />
            </Suspense>
          </Card>

          {/* Invoice Summary */}
          <Suspense fallback={null}>
            <InvoiceSummaryCard
              dataPromise={dataPromise}
              organizationId={organizationId}
            />
          </Suspense>

          {/* Low Stock Alert */}
          <Suspense fallback={null}>
            <LowStockCard
              dataPromise={dataPromise}
              organizationId={organizationId}
            />
          </Suspense>

          {/* Out of Stock Alert */}
          <Suspense fallback={null}>
            <OutOfStockCard
              dataPromise={dataPromise}
              organizationId={organizationId}
            />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
