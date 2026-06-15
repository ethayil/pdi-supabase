"use client";

import {
  AlertTriangleIcon,
  CalendarClockIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  ClockIcon,
  CloudUploadIcon,
  FilterIcon,
  PackageIcon,
  ShipIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
  DespatchOrder,
  DespatchOrdersResponse,
} from "@/data/despatch-data";
import { useDespatchParams } from "@/lib/nuqs/despatch-params";
import { cn } from "@/lib/utils";
import { useOrganizationStore } from "@/store/use-organization-store";
import { formattedDate } from "@/utils/formatted-date";

type UrgencyGroup = "overdue" | "due_today" | "due_soon" | "upcoming";

interface UrgencyConfig {
  key: UrgencyGroup;
  label: string;
  icon: typeof AlertTriangleIcon;
  color: string;
  badgeClass: string;
  countClass: string;
  borderClass: string;
}

const urgencyConfigs: UrgencyConfig[] = [
  {
    key: "overdue",
    label: "Overdue",
    icon: AlertTriangleIcon,
    color: "text-red-500",
    badgeClass:
      "from-rose-300/10 dark:from-black to-red-400/40 dark:to-red-300/20 text-red-600 dark:text-red-400",
    countClass:
      "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    borderClass: "border-l-red-500",
  },
  {
    key: "due_today",
    label: "Due Today",
    icon: ClockIcon,
    color: "text-amber-500",
    badgeClass:
      "from-amber-300/10 dark:from-black to-amber-500/40 dark:to-amber-300/20 text-amber-600 dark:text-amber-400",
    countClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    borderClass: "border-l-amber-500",
  },
  {
    key: "due_soon",
    label: "Due Soon",
    icon: CalendarClockIcon,
    color: "text-blue-500",
    badgeClass:
      "from-blue-300/10 dark:from-black to-blue-500/30 dark:to-blue-300/30 text-blue-600 dark:text-blue-400",
    countClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    borderClass: "border-l-blue-500",
  },
  {
    key: "upcoming",
    label: "Upcoming / No Date",
    icon: CalendarIcon,
    color: "text-muted-foreground",
    badgeClass: "from-muted to-secondary-foreground/10 text-muted-foreground",
    countClass: "bg-muted text-muted-foreground border-border",
    borderClass: "border-l-muted-foreground/30",
  },
];

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function classifyOrder(order: DespatchOrder): UrgencyGroup {
  if (!order.sendDate) return "upcoming";

  const now = getStartOfDay(new Date());
  const sendDay = getStartOfDay(new Date(order.sendDate));
  const diffMs = sendDay.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "due_today";
  if (diffDays <= 5) return "due_soon";
  return "upcoming";
}

interface DespatchConsoleProps {
  initialData: DespatchOrdersResponse;
}

export function DespatchConsole({ initialData }: DespatchConsoleProps) {
  const { orgId } = useParams<{ orgId: string }>();
  const [isPending, startTransition] = useTransition();
  const [{ urgency: activeFilter }, setParams] = useDespatchParams({
    startTransition,
  });

  const { organizations } = useOrganizationStore();

  const orders = initialData.data;

  const grouped = useMemo(() => {
    const groups: Record<UrgencyGroup, DespatchOrder[]> = {
      overdue: [],
      due_today: [],
      due_soon: [],
      upcoming: [],
    };
    for (const order of orders) {
      const urgency = classifyOrder(order);
      groups[urgency].push(order);
    }
    return groups;
  }, [orders]);

  const visibleGroups = useMemo(() => {
    if (activeFilter === "all") return urgencyConfigs;
    return urgencyConfigs.filter((c) => c.key === activeFilter);
  }, [activeFilter]);

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Scrollable Content */}
      <div
        className={cn(
          "flex-1 overflow-y-auto p-4 pb-16 flex flex-col gap-4 transition-opacity duration-200",
          isPending && "opacity-60 pointer-events-none",
        )}
      >
        {/* Summary Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b pb-3 shrink-0">
          <button
            type="button"
            onClick={() =>
              setParams({
                urgency: "all",
                currentPage: 1,
              })
            }
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 border",
              activeFilter === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background hover:bg-accent text-muted-foreground hover:text-foreground border-input",
            )}
          >
            <FilterIcon className="size-3.5" />
            <span>All</span>
            <span
              className={cn(
                "ml-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold leading-none border",
                activeFilter === "all"
                  ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/10"
                  : "bg-muted text-muted-foreground border-border",
              )}
            >
              {initialData.counts.all}
            </span>
          </button>

          {urgencyConfigs.map((config) => {
            const count = initialData.counts[config.key];
            const Icon = config.icon;
            const isActive = activeFilter === config.key;
            return (
              <button
                key={config.key}
                type="button"
                onClick={() =>
                  setParams({
                    urgency: activeFilter === config.key ? "all" : config.key,
                    currentPage: 1,
                  })
                }
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background hover:bg-accent text-muted-foreground hover:text-foreground border-input",
                )}
              >
                <Icon
                  className={cn(
                    "size-3.5",
                    isActive ? "text-primary-foreground" : config.color,
                  )}
                />
                <span>{config.label}</span>
                <span
                  className={cn(
                    "ml-1 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold leading-none border",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/10"
                      : "bg-muted text-muted-foreground border-border",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Order Groups */}
        <div className="flex flex-col gap-6">
          {visibleGroups.map((config) => {
            const groupOrders = grouped[config.key];
            if (groupOrders.length === 0 && activeFilter === "all") return null;

            const Icon = config.icon;
            return (
              <div key={config.key} className="flex flex-col gap-2">
                {/* Group Header */}
                <div className="flex items-center gap-2 px-1">
                  <Icon className={cn("size-4", config.color)} />
                  <h3 className="text-sm font-semibold">{config.label}</h3>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] font-mono h-5 border",
                      config.countClass,
                    )}
                  >
                    {groupOrders.length}
                  </Badge>
                </div>

                {groupOrders.length === 0 ? (
                  <Card className="shadow-none border-dashed">
                    <CardContent className="py-8 text-center">
                      <PackageIcon className="size-8 mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        No orders in this category
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {groupOrders.map((order) => (
                      <DespatchOrderRow
                        key={order.id}
                        order={order}
                        config={config}
                        orgId={orgId}
                        orgName={
                          organizations.find((o) => o.id === order.orgId)?.name
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {initialData.totalCount === 0 && (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <PackageIcon className="size-12 mx-auto mb-3 text-muted-foreground/20" />
              <p className="text-muted-foreground font-medium">
                No processing orders
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Orders will appear here when they move to processing status
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <DataTablePagination
        totalPages={initialData.totalPages}
        totalCount={initialData.totalCount}
        startTransition={startTransition}
      />
    </div>
  );
}

function DespatchOrderRow({
  order,
  config,
  orgId,
  orgName,
}: {
  order: DespatchOrder;
  config: UrgencyConfig;
  orgId: string;
  orgName?: string;
}) {
  const sendDate = order.sendDate ? new Date(order.sendDate) : null;
  const now = getStartOfDay(new Date());
  const daysUntil = sendDate
    ? Math.floor(
        (getStartOfDay(sendDate).getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const daysLabel =
    daysUntil === null
      ? "No date"
      : daysUntil < 0
        ? `${Math.abs(daysUntil)}d overdue`
        : daysUntil === 0
          ? "Today"
          : `${daysUntil}d`;

  return (
    <Link
      href={`/${orgId}/admin/orders/${order.id}`}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-l-[3px] px-4 py-3",
        "bg-card hover:bg-accent/50 transition-all duration-150",
        config.borderClass,
      )}
    >
      {/* Reference & Customer */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold font-mono truncate">
            {order.reference}
          </span>
          {order.lwSyncedAt && (
            <Tooltip>
              <TooltipTrigger>
                <CloudUploadIcon className="size-3 text-emerald-500 shrink-0" />
              </TooltipTrigger>
              <TooltipContent>
                Synced to LW: {formattedDate(new Date(order.lwSyncedAt))}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {order.fullname}
          {order.company && (
            <span className="text-muted-foreground/60"> • {order.company}</span>
          )}
          {orgName && (
            <span className="text-muted-foreground/40"> · {orgName}</span>
          )}
        </p>
      </div>

      {/* Send Date */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        <ShipIcon className="size-3 text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">
          {sendDate ? formattedDate(sendDate, "short") : "—"}
        </span>
      </div>

      {/* Days Until */}
      <div className="shrink-0 w-20 text-right">
        <span
          className={cn(
            "text-xs font-semibold font-mono",
            daysUntil !== null && daysUntil < 0
              ? "text-red-500"
              : daysUntil === 0
                ? "text-amber-500"
                : "text-muted-foreground",
          )}
        >
          {daysLabel}
        </span>
      </div>

      {/* Weight */}
      <div className="hidden md:block shrink-0 w-16 text-right">
        <span className="text-xs text-muted-foreground font-mono">
          {order.weight}g
        </span>
      </div>

      {/* Sync indicator */}
      <div className="shrink-0 w-6">
        {order.lwSyncedAt ? (
          <CheckCircle2Icon className="size-3.5 text-emerald-500" />
        ) : (
          <div className="size-3.5 rounded-full border-2 border-muted-foreground/20" />
        )}
      </div>

      {/* Arrow */}
      <ChevronRightIcon className="size-4 text-muted-foreground/40 group-hover:text-foreground transition-colors shrink-0" />
    </Link>
  );
}
