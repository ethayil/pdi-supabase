"use client";

import { useTransition } from "react";
import type { Category } from "@/app/generated/prisma/client";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { columns } from "./columns";

interface CategoriesTableWrapperProps {
  initialData: {
    success: boolean;
    data: Category[];
    totalPages: number;
    totalCount: number;
  };
}

export const CategoriesTableWrapper = ({
  initialData,
}: CategoriesTableWrapperProps) => {
  const [isPending, startTransition] = useTransition();

  return (
    <DataTable
      columns={columns}
      data={initialData.data ?? []}
      loading={isPending}
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
