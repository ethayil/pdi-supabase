"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Calendar1Icon,
  Clock2Icon,
  Eye,
  type LucideIcon,
  ShipIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Order, User } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formattedDate } from "@/utils/formatted-date";

export const columns: ColumnDef<Order & { user: User | null }>[] = [
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => {
      const sendDate = row.original.sendDate;
      const deliveryDate = row.original.deliveryDate;
      const created = row.original.createdAt;
      return (
        <p className="flex flex-col">
          {row.original.reference}
          <DateWithIcon date={sendDate} icon={ShipIcon} label="Send by Date" />
          <DateWithIcon
            date={deliveryDate}
            icon={Clock2Icon}
            label="Deliver by Date"
          />
          <DateWithIcon
            date={created}
            icon={Calendar1Icon}
            label="Created Date"
          />
        </p>
      );
    },
  },
  {
    accessorKey: "fullname",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <p className="text-sm">{row.original.fullname}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
        <p className="text-xs text-muted-foreground">{row.original.phone}</p>
      </div>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <div>
        <p className="text-sm">{row.original.address1}</p>
        <p className="text-xs text-muted-foreground">{row.original.address2}</p>
        <div className="text-xs text-muted-foreground">
          <span>{row.original.town}</span>
          <span>{row.original.city && `, ${row.original.city}`}</span>
        </div>
        <p className="text-xs text-primary">{row.original.country}</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Order Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "courier",
    header: "Courier",
    cell: ({ row }) => {
      const { courier, trackingNumber, deliveredAt, signedBy } = row.original;
      return (
        <div className="space-y-1">
          <p className="capitalize font-medium">{courier}</p>
          <p className="text-primary text-[10px] font-mono">{trackingNumber}</p>
          {deliveredAt && (
            <div className="text-[10px] text-muted-foreground leading-tight">
              <p>Delivered: {formattedDate(deliveredAt, "short")}</p>
              {signedBy && <p>Signed: {signedBy}</p>}
            </div>
          )}
        </div>
      );
    },
  },

  {
    accessorKey: "weight",
    header: "Weight",
    cell: ({ row }) => <span>{row.original.weight} gm</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell orderId={row.original.id} />,
  },
];

const ActionCell = ({ orderId }: { orderId: string }) => {
  const { orgId } = useParams();
  return (
    <Button variant="ghost" size="icon">
      <Link href={`/${orgId}/admin/orders/${orderId}`}>
        <Eye className="size-4" />
      </Link>
    </Button>
  );
};

const DateWithIcon = ({
  date,
  icon: Icon,
  label,
}: {
  date: Date | number | null | undefined;
  icon: LucideIcon;
  label: string;
}) => {
  if (!date) return null;
  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="flex items-center gap-1">
          <Icon className="size-3 text-primary" />
          <p className="font-mono text-xs text-muted-foreground">
            {formattedDate(date, "short")}
          </p>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
};
