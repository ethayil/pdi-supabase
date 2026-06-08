import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Package,
  PackageX,
  RefreshCcw,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import type { DashboardOrder } from "@/data/dashboard";
import { formattedDate } from "@/utils/formatted-date";

export const STATUS_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  delivered: CheckCircle2,
  exception: AlertTriangle,
  delay: Clock,
  cancelled: PackageX,
  returned: RefreshCcw,
  shipped: Truck,
  on_the_way: Truck,
  pending: Clock,
  processing: RefreshCcw,
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-500",
  processing: "text-blue-500",
  shipped: "text-indigo-500",
  on_the_way: "text-indigo-400",
  delivered: "text-emerald-500",
  exception: "text-red-500",
  delay: "text-orange-500",
  cancelled: "text-slate-400",
  returned: "text-purple-400",
  collected: "text-teal-500",
};

export function OrderRow({
  order,
  orgId,
  isAdmin,
}: {
  order: DashboardOrder;
  orgId: string;
  isAdmin: boolean;
}) {
  const StatusIcon = STATUS_ICONS[order.status] ?? Package;
  const href = isAdmin
    ? `/${orgId}/admin/orders/${order.id}`
    : `/${orgId}/orders/${order.id}`;

  return (
    <Link href={href}>
      <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/60 transition-colors group">
        <div
          className={`shrink-0 ${STATUS_COLORS[order.status] ?? "text-muted-foreground"}`}
        >
          <StatusIcon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{order.reference}</p>
          <p className="text-xs text-muted-foreground truncate">
            {order.fullname}
          </p>
        </div>
        <div className="text-right shrink-0 space-y-0.5">
          <StatusBadge status={order.status} />
          <p className="text-[10px] text-muted-foreground">
            {formattedDate(order.deliveryDate, "short")}
          </p>
        </div>
        <ArrowRight className="size-3 text-muted-foreground -translate-x-3 group-hover:translate-x-0 transition-all duration-300 opacity-0 group-hover:opacity-100 shrink-0" />
      </div>
    </Link>
  );
}
