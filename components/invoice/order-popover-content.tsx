"use client";

import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import type { Order, OrderItem, Product } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PopoverContent } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn, formatCurrency } from "@/lib/utils";
import { formattedDate } from "@/utils/formatted-date";
import {
  calculateShippingCost,
  getCountryZone,
  getZoneName,
} from "@/utils/tariff-utils";
import { weightFormat } from "@/utils/weight-format";
import { ChargeBadge } from "./charge-badge";

type OrderWItem = Order & {
  orderItems?: (OrderItem & { product: Product | null })[];
  charges?: {
    id: string;
    chargeType: string;
    description?: string | null;
    cost?: number | null;
    vat?: number | null;
    chargeDate?: Date | string | null;
  }[];
};

interface OrderPopoverContentProps {
  order: OrderWItem;
  organizationId: string;
}

export function OrderPopoverContent({
  order,
  organizationId,
}: OrderPopoverContentProps) {
  const orderCharges = order.charges || [];
  const zone = getCountryZone(order.country);
  const zoneName = getZoneName(order.country);
  const calculatedCost =
    zone > 0 && (order.weight ?? 0) > 0
      ? calculateShippingCost(order.weight || 0, zone)
      : 0;

  return (
    <PopoverContent side="bottom" align="start">
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-sm flex items-center gap-1.5 flex-wrap">
          <span>{order.reference}</span>
          <StatusBadge status={order.status} />
          {orderCharges.map((charge) => (
            <ChargeBadge key={charge.id || charge.chargeType} charge={charge} />
          ))}
        </div>
        <a
          href={`/${organizationId}/admin/orders/${order.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="icon-sm" variant="outline">
            <ExternalLink className="size-3" />
          </Button>
        </a>
      </div>
      <Separator />
      <div className="space-y-1 text-xs">
        <PopoverOrderText title="Customer" text={order.fullname} />
        {order.company && (
          <PopoverOrderText title="Company" text={order.company} />
        )}
        <PopoverOrderText title="Country" text={order.country} />
        {zoneName && (
          <PopoverOrderText title="Zone">
            <Badge
              variant="secondary"
              className="font-mono text-[10px] px-1 py-0 h-4"
            >
              {zoneName}
            </Badge>
          </PopoverOrderText>
        )}
        {calculatedCost > 0 && (
          <PopoverOrderText title="Auto-Calc Price">
            <span className="font-mono font-bold text-primary">
              {formatCurrency(calculatedCost)}
            </span>
          </PopoverOrderText>
        )}
        <PopoverOrderText
          title="Delivery"
          text={formattedDate(order.deliveryDate, "short")}
        />
        <PopoverOrderText title="Weight" text={weightFormat(order.weight)} />
        {order.courier && (
          <PopoverOrderText title="Courier" text={order.courier} />
        )}
        {order.trackingNumber && (
          <PopoverOrderText
            title="Tracking Number"
            text={order.trackingNumber}
          />
        )}
      </div>
      {order.orderItems && order.orderItems.length > 0 && (
        <>
          <Separator />
          <p className="text-[10px] uppercase font-bold text-muted-foreground">
            Items
          </p>
          <div className="space-y-1">
            {order.orderItems.map((item) => (
              <PopoverOrderText
                key={item.id}
                title={item.product?.name ?? "Unknown"}
                text={`×${item.quantity}`}
                xsTitle
              />
            ))}
          </div>
        </>
      )}
    </PopoverContent>
  );
}

const PopoverOrderText = ({
  title,
  text,
  xsTitle = false,
  children,
}: {
  title: string;
  text?: string;
  xsTitle?: boolean;
  children?: ReactNode;
}) => {
  return (
    <div className="flex justify-between">
      <span className={cn("text-muted-foreground", xsTitle && "text-xs")}>
        {title}
      </span>
      {children ? children : <span className="font-medium">{text}</span>}
    </div>
  );
};
