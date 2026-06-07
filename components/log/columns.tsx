"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import type { ActivityLog } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { LogDetailsDialog } from "./log-details-dialog";

export type LogEntry = ActivityLog & {
  userName: string;
  userEmail: string;
  orgName: string;
};

export const columns: ColumnDef<LogEntry>[] = [
  {
    accessorKey: "timestamp",
    header: "Date",
    cell: ({ row }) => {
      return (
        <div className="whitespace-nowrap">
          {format(row.getValue("timestamp"), "MMM d, yyyy HH:mm:ss")}
        </div>
      );
    },
  },
  {
    accessorKey: "userName",
    header: "User",
    cell: ({ row }) => {
      const isSystem = !row.original.userId && row.original.systemSource;
      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {isSystem ? "System" : row.getValue("userName")}
          </span>
          <span className="text-xs text-muted-foreground italic">
            {isSystem
              ? `Source: ${row.original.systemSource}`
              : row.original.userEmail}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "orgName",
    header: "Organization",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.getValue("action") as string;
      return (
        <Badge
          variant={
            action === "create"
              ? "default"
              : action === "update"
                ? "secondary"
                : "destructive"
          }
          className="capitalize"
        >
          {action}
        </Badge>
      );
    },
  },
  {
    accessorKey: "entityType",
    header: "Entity",
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("entityType")}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-75 truncate" title={row.getValue("description")}>
        {row.getValue("description")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Details",
    cell: ({ row }) => (
      <LogDetailsDialog
        changes={row.original.changes}
        description={row.original.description}
      />
    ),
  },
];
