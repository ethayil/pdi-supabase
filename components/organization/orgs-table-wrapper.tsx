"use client";

import { useTransition } from "react";
import type { Organization } from "@/app/generated/prisma/client";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { columns } from "@/components/organization/columns";
import OrgsHeader from "@/components/organization/orgs-header";

interface OrgsTableWrapperProps {
  initialData: {
    success: boolean;
    data: Organization[];
    totalPages: number;
    totalCount: number;
  };
}

export function OrgsTableWrapper({ initialData }: OrgsTableWrapperProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <DataTable
      columns={columns}
      data={initialData.data ?? []}
      loading={isPending}
      headerComponent={<OrgsHeader startTransition={startTransition} />}
      paginationComponent={
        <DataTablePagination
          totalPages={initialData.totalPages}
          totalCount={initialData.totalCount}
          startTransition={startTransition}
        />
      }
    />
  );
}
