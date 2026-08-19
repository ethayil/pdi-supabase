"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  type OnChangeFn,
  type RowSelectionState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableProps<TData = any, TValue = any> {
  columns: ColumnDef<any, any>[];
  data: TData[];
  headerComponent?: React.ReactNode;
  paginationComponent?: React.ReactNode;
  visibleColumns?: VisibilityState;
  hideHeader?: boolean;
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  loading?: boolean;
  viewOptionsPortalContainer?: HTMLElement | null;
  viewOptionsPortalId?: string;
  hideViewOptions?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  headerComponent,
  paginationComponent,
  visibleColumns,
  hideHeader,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  loading = false,
  viewOptionsPortalContainer,
  viewOptionsPortalId,
  hideViewOptions = false,
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    visibleColumns ?? {},
  );

  const [internalRowSelection, setInternalRowSelection] =
    useState<RowSelectionState>({});
  const activeRowSelection = rowSelection ?? internalRowSelection;
  const handleRowSelectionChange =
    onRowSelectionChange ?? setInternalRowSelection;

  const table = useReactTable({
    data,
    columns: (enableRowSelection
      ? columns
      : columns.filter((column) => column.id !== "select")) as ColumnDef<
      TData,
      any
    >[],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: handleRowSelectionChange,

    manualPagination: true,
    state: {
      columnVisibility,
      rowSelection: activeRowSelection,
    },
  });

  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col p-2 space-y-2">
      {!hideHeader && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full flex items-start sm:items-center justify-between gap-2 min-w-0"
        >
          <div className="w-full min-w-0">{headerComponent}</div>
          {!hideViewOptions && (
            <DataTableViewOptions
              portalContainer={viewOptionsPortalContainer}
              portalId={viewOptionsPortalId}
              columns={table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide(),
                )}
            />
          )}
        </motion.div>
      )}

      <div className="relative flex-1 min-h-0 w-full overflow-auto rounded-md border pb-12">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 left-0 right-0 h-1 z-30 pointer-events-none bg-primary/10 overflow-hidden"
            >
              <motion.div
                className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <Table>
          <TableHeader className="sticky top-0 z-20 bg-white/80 backdrop-blur-md dark:bg-zinc-800/90">
            {table?.getHeaderGroups().map((headerGroup, index) => (
              <TableRow key={headerGroup.id} index={index}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column?.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table?.getRowModel().rows?.length ? (
              table?.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  index={index}
                  data-state={row.getIsSelected() && "selected"}
                  // onClick={() => handleRowClick(row.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow index={0}>
                <TableCell
                  colSpan={columns?.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Component */}
      {paginationComponent}
    </div>
  );
}
