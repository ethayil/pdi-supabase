"use client";
import type { ColumnDef } from "@tanstack/react-table";
import type { Organization } from "@/app/generated/prisma/client";
import TableEditAction from "@/components/data-table/table-edit-action";
import { ImageZoom } from "@/components/ui/image-zoom";
import { cn } from "@/lib/utils";
import { formattedDate } from "@/utils/formatted-date";

export const columns: ColumnDef<Organization>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <OrganizationCell organization={row.original} />,
  },
  {
    accessorKey: "isActive",
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
    cell: ({ row }) => <TableEditAction type="org" id={row.original.id} />,
  },
];

const OrganizationCell = ({ organization }: { organization: Organization }) => {
  return (
    <div className="flex gap-2 items-center">
      <ImageZoom isDisabled={!organization?.logo}>
        {/** biome-ignore lint/performance/noImgElement: Required for Imagezoom */}
        <img
          src={organization?.logo || "/placeholder.svg"}
          alt={organization?.name ?? ""}
          className={cn(
            "rounded aspect-square size-12",
            !organization?.logo && "border cursor-auto!",
          )}
        />
      </ImageZoom>
      <div>
        <p>{organization.name}</p>
        <p className="text-xs text-muted-foreground">{organization.prefix}</p>
      </div>
    </div>
  );
};
