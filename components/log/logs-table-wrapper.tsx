"use client";

import { useTransition } from "react";
import type { DateRange } from "react-day-picker";
import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { useLogParams } from "@/lib/nuqs/log-params";
import { columns, type LogEntry } from "./columns";
import LogsTableToolbar from "./logs-table-toolbar";

interface LogsTableWrapperProps {
  initialData: {
    success: boolean;
    data: LogEntry[];
    totalPages: number;
    totalCount: number;
  };
}

export const LogsTableWrapper = ({ initialData }: LogsTableWrapperProps) => {
  const [isPending, startTransition] = useTransition();
  const [{ start, end }, setParams] = useLogParams();

  return (
    <DataTable
      columns={columns}
      data={initialData.data ?? []}
      loading={isPending}
      headerComponent={<LogsTableToolbar loading={isPending} />}
      paginationComponent={
        <DataTablePagination
          totalPages={initialData.totalPages}
          totalCount={initialData.totalCount}
          startTransition={startTransition}
        >
          <DatePickerWithRange
            date={{
              from: start ? new Date(parseInt(start)) : undefined,
              to: end ? new Date(parseInt(end)) : undefined,
            }}
            setDate={(range: DateRange | undefined) => {
              startTransition(() => {
                setParams({
                  start: range?.from ? range.from.getTime().toString() : null,
                  end: range?.to ? range.to.getTime().toString() : null,
                });
              });
            }}
          />
        </DataTablePagination>
      }
    />
  );
};
