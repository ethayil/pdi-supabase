"use client";

import { useTransition } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import type { UserWMember } from "@/data/users";
import { columns } from "./columns";
import UserTypeSelect from "./user-type-select";

interface TableWrapperProps {
  initialData: {
    success: boolean;
    data: UserWMember[];
    totalPages: number;
    totalCount: number;
  };
}

export const TableWrapper = ({ initialData }: TableWrapperProps) => {
  const [isPending, startTransition] = useTransition();

  return (
    <DataTable
      columns={columns}
      data={initialData.data ?? []}
      loading={isPending}
      headerComponent={
        <UserTypeSelect
          loading={isPending}
          startTransition={startTransition}
        />
      }
      paginationComponent={
        <DataTablePagination
          totalPages={initialData.totalPages}
          totalCount={initialData.totalCount}
          startTransition={startTransition}
        />
      }
    />
  );
};
