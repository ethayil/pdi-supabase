"use client";

import { useTransition } from "react";
import type { DateRange } from "react-day-picker";
import type { Order, User } from "@/app/generated/prisma/client";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { useOrderParams } from "@/lib/nuqs/order-params";
import { columns } from "./order-columns";
import OrdersTableToolbar from "./orders-table-toolbar";

interface OrdersTableWrapperProps {
  organizationId: string;
  initialData: {
    success: boolean;
    data: (Order & { user: User | null })[];
    totalPages: number;
    totalCount: number;
  };
}

export const OrdersTableWrapper = ({
  organizationId,
  initialData,
}: OrdersTableWrapperProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ start, end }, setParams] = useOrderParams({ startTransition });

  const orders = initialData?.data ?? [];
  const totalPages = initialData?.totalPages ?? 1;
  const totalCount = initialData?.totalCount ?? 0;

  return (
    <DataTable
      columns={columns}
      data={orders}
      loading={isPending}
      headerComponent={
        <OrdersTableToolbar 
          loading={isPending} 
          startTransition={startTransition}
        />
      }
      paginationComponent={
        <DataTablePagination
          totalPages={totalPages}
          totalCount={totalCount}
          startTransition={startTransition}
        >
          <DatePickerWithRange
            date={{
              from: start ? new Date(parseInt(start, 10)) : undefined,
              to: end ? new Date(parseInt(end, 10)) : undefined,
            }}
            setDate={(range: DateRange | undefined) => {
              setParams({
                start: range?.from ? range.from.getTime().toString() : null,
                end: range?.to ? range.to.getTime().toString() : null,
              });
            }}
          />
        </DataTablePagination>
      }
    />
  );
};
