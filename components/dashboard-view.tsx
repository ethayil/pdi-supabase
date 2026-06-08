import { Package, PackageX } from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDashboardData } from "@/data/dashboard";
import { OrderRow, STATUS_COLORS, STATUS_ICONS } from "./dashboard/order-row";
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
  const data = await getDashboardData({ orgId: organizationId });

  if (!data) return null;

  const isAdmin = data.role === "admin" || data.role === "superadmin";
  const isSuperadmin = data.role === "superadmin";

  const {
    statusBreakdown,
    invoiceSummary,
    recentOrders,
    lowStockCount,
    lowStockThreshold,
    lowStockProducts,
    outOfStockProducts,
  } = data;

  // ─── USER VIEW ────────────────────────────────────────────────────────────
  if (!isAdmin) {
    const inTransit = recentOrders.filter(
      (o) => o.status === "shipped" || o.status === "on_the_way",
    ).length;
    const delivered = recentOrders.filter(
      (o) => o.status === "delivered",
    ).length;

    return (
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="My Orders"
            value={data.ordersCount}
            icon="Package"
            color="#3b82f6"
            delay={0}
          />
          <StatCard
            title="In Transit"
            value={inTransit}
            icon="Truck"
            color="#6366f1"
            delay={0.05}
          />
          <StatCard
            title="Delivered"
            value={delivered}
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
            <CardContent className="space-y-1">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No orders yet.{" "}
                  <Link
                    href={`/${organizationId}/products`}
                    className="text-primary underline"
                  >
                    Browse products
                  </Link>
                </p>
              ) : (
                recentOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    orgId={organizationId}
                    isAdmin={false}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ─── ADMIN / SUPERADMIN VIEW ───────────────────────────────────────────────
  const exceptionCount =
    (statusBreakdown?.exception ?? 0) + (statusBreakdown?.delay ?? 0);
  const pendingDispatch =
    (statusBreakdown?.pending ?? 0) + (statusBreakdown?.processing ?? 0);

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Total Orders"
          value={data.orgOrdersTotal ?? 0}
          icon="Package"
          color="#3b82f6"
          delay={0}
          sub={isSuperadmin ? "All orgs — your org" : undefined}
        />
        <StatCard
          title="Pending Dispatch"
          value={pendingDispatch}
          icon="Clock"
          color="#f59e0b"
          delay={0.05}
        />
        <StatCard
          title="Exceptions / Delays"
          value={exceptionCount}
          icon="AlertTriangle"
          color={exceptionCount > 0 ? "#ef4444" : "#6b7280"}
          delay={0.1}
        />
        <StatCard
          title="Outstanding Invoices"
          value={
            invoiceSummary
              ? formatCurrency(invoiceSummary.outstandingTotal)
              : "—"
          }
          icon="ReceiptText"
          color="#8b5cf6"
          delay={0.15}
          sub={
            invoiceSummary
              ? `${invoiceSummary.sent} sent · ${invoiceSummary.overdue} overdue`
              : undefined
          }
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
            <CardContent className="space-y-1">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No orders yet.
                </p>
              ) : (
                recentOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    orgId={organizationId}
                    isAdmin={true}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar stats */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          {/* Status breakdown */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <GlowingIcon icon="TrendingUp" size="xs" color="#0ce3ff" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {statusBreakdown &&
                Object.entries(statusBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => {
                    const Icon = STATUS_ICONS[status] ?? Package;
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
                  })}
            </CardContent>
          </Card>

          {/* Invoice quick summary */}
          {invoiceSummary && (
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <GlowingIcon icon="ReceiptText" size="xs" color="#8b5cf6" />
                  Invoices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {[
                  {
                    label: "Draft",
                    value: invoiceSummary.draft,
                    color: "text-muted-foreground",
                  },
                  {
                    label: "Sent",
                    value: invoiceSummary.sent,
                    color: "text-blue-500",
                  },
                  {
                    label: "Overdue",
                    value: invoiceSummary.overdue,
                    color: "text-red-500",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <span className={`${color}`}>{label}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {value}
                    </Badge>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Outstanding</span>
                  <span className="text-violet-500">
                    {formatCurrency(invoiceSummary.outstandingTotal)}
                  </span>
                </div>
                <Button size="sm" variant="outline" className="w-full mt-1">
                  <Link href={`/${organizationId}/admin/invoices`}>
                    View Invoices
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Low stock alert */}
          {lowStockCount !== null && lowStockCount > 0 && (
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
                {lowStockProducts
                  ? lowStockProducts.map((p) => (
                      <Link
                        key={p._id}
                        href={`/${organizationId}/admin/products?stockStatus=low_stock`}
                        className="flex items-center gap-2 text-xs hover:bg-muted/60 rounded p-1 transition-colors"
                      >
                        <span className="flex-1 truncate font-medium">
                          {p.name}
                        </span>
                        <span className="text-muted-foreground shrink-0">
                          {p.sku}
                        </span>
                        <span className="text-amber-500 font-semibold tabular-nums shrink-0">
                          {p.quantity}
                        </span>
                      </Link>
                    ))
                  : null}
                <Button size="sm" variant="outline" className="w-full mt-1">
                  <Link
                    href={`/${organizationId}/admin/products?stockStatus=low_stock`}
                  >
                    View All Low Stock
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Out of stock alert */}
          {outOfStockProducts !== null &&
            outOfStockProducts &&
            outOfStockProducts.length > 0 && (
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
                      key={p._id}
                      href={`/${organizationId}/admin/products?stockStatus=out_of_stock`}
                      className="flex items-center gap-2 text-xs hover:bg-muted/60 rounded p-1 transition-colors group"
                    >
                      <PackageX className="size-3 text-red-500 shrink-0" />
                      <span className="flex-1 truncate font-medium">
                        {p.name}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {p.sku}
                      </span>
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
            )}
        </motion.div>
      </div>
    </div>
  );
}
