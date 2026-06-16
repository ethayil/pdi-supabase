"use client";

import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { Order, OrderItem, Product } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { PopoverContent } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { formattedDate } from "@/utils/formatted-date";
import { weightFormat } from "@/utils/weight-format";

type OrderWItem = Order & {
  orderItems?: (OrderItem & { product: Product | null })[];
};

interface OrderPopoverContentProps {
  order: OrderWItem;
  organizationId: string;
}

export function OrderPopoverContent({
  order,
  organizationId,
}: OrderPopoverContentProps) {
  return (
    <PopoverContent side="bottom" align="start">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-sm flex items-center gap-2">
          {order.reference}
          <StatusBadge status={order.status} />
        </p>
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
  text: string;
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
