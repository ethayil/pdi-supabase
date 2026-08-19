"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import type { Order } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, isUkCountry } from "@/lib/utils";
import { formattedDate } from "@/utils/formatted-date";
import { weightFormat } from "@/utils/weight-format";
import { ChargeBadge } from "./charge-badge";

export type UninvoicedOrder = Order & {
  organization?: {
    id: string;
    name: string;
  } | null;
  charges?: {
    id: string;
    chargeType: string;
    description?: string | null;
    cost?: number | null;
    vat?: number | null;
    chargeDate?: Date | string | null;
  }[];
};

interface ColumnOptions {
  onCreateInvoiceForOrder?: (order: UninvoicedOrder) => void;
}

export const getUninvoicedOrdersColumns = ({
  onCreateInvoiceForOrder,
}: ColumnOptions = {}): ColumnDef<UninvoicedOrder>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => {
      const orderCharges = row.original.charges || [];
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono font-semibold text-sm">
              {row.original.reference}
            </span>
            {orderCharges.map((charge) => (
              <ChargeBadge
                key={charge.id || charge.chargeType}
                charge={charge}
              />
            ))}
          </div>
          {row.original.poRef && (
            <span className="text-xs text-muted-foreground">
              PO: {row.original.poRef}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "organization",
    header: "Organization",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">
          {row.original.organization?.name || "Unknown Org"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "fullname",
    header: "Customer",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">{row.original.fullname}</span>
        {row.original.company && (
          <span className="text-xs text-muted-foreground">
            {row.original.company}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "country",
    header: "Country",
    cell: ({ row }) => {
      const isUk = isUkCountry(row.original.country);
      return (
        <Badge variant={isUk ? "default" : "secondary"} className="text-[11px]">
          {row.original.country || "N/A"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "weight",
    header: "Weight",
    cell: ({ row }) => (
      <span className="text-sm font-mono">
        {weightFormat(row.original.weight)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "deliveryDate",
    header: "Delivery Date",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formattedDate(row.original.deliveryDate, "short")}
      </span>
    ),
  },
  {
    id: "price",
    header: "Estimated Price",
    cell: ({ row }) => {
      const isUk = isUkCountry(row.original.country);
      const cost = row.original.courierCost || 0;
      const vat = isUk ? row.original.courierVAT || 0 : 0;
      const total = cost + vat;

      return (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{formatCurrency(total)}</span>
          {isUk && vat > 0 && (
            <span className="text-[10px] text-muted-foreground">
              VAT: {formatCurrency(vat)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-xs gap-1"
        onClick={() => onCreateInvoiceForOrder?.(row.original)}
      >
        <Plus className="size-3" />
        Invoice
      </Button>
    ),
  },
];
