"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { BadgeCheckIcon } from "lucide-react";
import TableEditAction from "@/components/data-table/table-edit-action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ImageZoom } from "@/components/ui/image-zoom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { UserWMember } from "@/data/users";
import { formattedDate } from "@/utils/formatted-date";

export const columns: ColumnDef<UserWMember>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => <UserCell user={row.original} />,
  },
  {
    accessorKey: "Organization",
    header: "Organization",
    cell: ({ row }) => {
      const organizationName = row.original.organizationName;
      return <div>{organizationName ?? "No Org"}</div>;
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <Badge
          variant={
            role === "orgAdmin" || role === "admin" ? "default" : "outline"
          }
        >
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = !row.original.banned;
      return (
        <Badge variant={isActive ? "outline" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return <div className="">{formattedDate(date)}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <TableEditAction type="user" id={row.original.id} />,
  },
];

const UserCell = ({ user }: { user: UserWMember }) => {
  return (
    <div className="flex gap-2 items-center">
      <Avatar className="size-12 rounded-lg relative">
        {user.emailVerified && (
          <Tooltip>
            <TooltipTrigger
              className="absolute z-10 -top-1 -right-1"
              render={<BadgeCheckIcon className="size-4 text-primary" />}
            />
            <TooltipContent side="right">
              <p>Email Verified</p>
            </TooltipContent>
          </Tooltip>
        )}
        <ImageZoom>
          <AvatarImage
            src={user?.image ?? ""}
            alt={user?.name ?? ""}
            className="aspect-auto"
          />
        </ImageZoom>
        <AvatarFallback className="rounded-lg">
          {user?.name?.substring(0, 2) || user?.email?.substring(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{user.name || "N/A"}</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>
    </div>
  );
};
