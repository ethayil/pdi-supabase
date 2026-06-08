"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, Eye } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { Invoice } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { formattedDate } from "@/utils/formatted-date";

type InvoiceWithOrderCount = Invoice & { orderCount: number };

export const columns: ColumnDef<InvoiceWithOrderCount>[] = [
  {
    accessorKey: "reference",
    header: "Invoice #",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-mono font-semibold">
          {row.original.reference}
        </span>
        {row.original.poNumber && (
          <span className="text-xs text-muted-foreground">
            PO: {row.original.poNumber}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "invoiceDate",
    header: "Invoice Date",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <Calendar className="size-3 text-primary" />
          <span className="text-sm">
            {formattedDate(row.original.invoiceDate, "short")}
          </span>
        </div>
        {row.original.dueDate && (
          <span className="text-xs text-muted-foreground">
            Due: {formattedDate(row.original.dueDate, "short")}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <InvoiceStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "totalCost",
    header: "Total",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold">
          {formatCurrency(row.original.totalCost)}
        </span>
        <span className="text-xs text-muted-foreground">
          VAT: {formatCurrency(row.original.vatCost)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "orderCount",
    header: "Orders",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.orderCount} Orders</Badge>
    ),
  },
  {
    accessorKey: "totalWeight",
    header: "Weight",
    cell: ({ row }) => <span>{row.original.totalWeight} gm</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell invoice={row.original} />,
  },
];

const InvoiceStatusBadge = ({ status }: { status: Invoice["status"] }) => {
  const variants: Record<
    typeof status,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    draft: "outline",
    sent: "secondary",
    paid: "default",
    overdue: "destructive",
    cancelled: "outline",
  };

  return (
    <Badge variant={variants[status]} className="capitalize">
      {status}
    </Badge>
  );
};

const ActionCell = ({ invoice }: { invoice: InvoiceWithOrderCount }) => {
  const { orgId } = useParams();

  return (
    <Button variant="ghost" size="icon">
      <Link href={`/${orgId}/admin/invoices/${invoice.id}`}>
        <Eye className="size-4" />
      </Link>
    </Button>
  );
};
