"use client";
import type { ColumnDef } from "@tanstack/react-table";
import type { Category } from "@/app/generated/prisma/client";
import TableEditAction from "@/components/data-table/table-edit-action";
import { formattedDate } from "@/utils/formatted-date";

export const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "isActive",
  },
  {
    accessorKey: "orgId",
  },
  {
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return <div className="">{formattedDate(date)}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <TableEditAction type="category" id={row.original.id} />,
  },
];
