"use client";
import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "@/app/generated/prisma/client";
import TableEditAction from "@/components/data-table/table-edit-action";
import { StatusBadge } from "@/components/ui/status-badge";
import { formattedDate } from "@/utils/formatted-date";

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return <StatusBadge status={isActive ? "active" : "inactive"} />;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return <div className="text-muted-foreground">{formattedDate(date)}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <TableEditAction type="category" id={row.original.id} />,
  },
];
