"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePaginationParams } from "@/lib/nuqs/global-params";

interface DataTablePaginationProps {
  totalPages: number;
  totalCount: number;
  children?: React.ReactNode;
  optionsPerPage?: number[];
  startTransition?: React.TransitionStartFunction;
}

export function DataTablePagination({
  totalPages,
  totalCount,
  optionsPerPage = [10, 20, 30, 40, 50, 100],
  children,
  startTransition,
}: DataTablePaginationProps) {
  const [{ currentPage, entriesPerPage }, setParams] = usePaginationParams({
    startTransition,
  });

  function handlePageChange(page: number) {
    return setParams({ currentPage: page });
  }

  function handleEntriesPerPageChange(entriesPerPage: number) {
    return setParams({ entriesPerPage, currentPage: 1 });
  }

  return (
    <div className="absolute left-0 right-0 bottom-0 z-50 flex justify-center border-t bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 py-2 px-4">
      <div className="flex items-center gap-2">
        <p className="hidden md:block">Rows</p>
        <Select
          value={entriesPerPage.toString()}
          onValueChange={(value) => handleEntriesPerPageChange(Number(value))}
        >
          <SelectTrigger className="w-17.5">
            <SelectValue placeholder={entriesPerPage.toString()} />
          </SelectTrigger>
          <SelectContent side="top">
            {optionsPerPage.map((pageSize) => (
              <SelectItem key={pageSize.toString()} value={`${pageSize}`}>
                {pageSize.toString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 text-center font-medium flex items-center justify-center gap-1 sm:gap-4 truncate overflow-hidden px-1">
        <p className="xs:hidden text-nowrap truncate text-muted-foreground">
          <span className="hidden sm:inline-block mr-1">Total Items: </span>
          {totalCount}
        </p>
        <div className="min-w-0 shrink-0">{children}</div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
        <Button
          variant="outline"
          className="hidden size-8 p-0 lg:flex"
          onClick={() => handlePageChange(1)}
          disabled={currentPage <= 1}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="size-8 p-0"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center justify-center min-w-8 font-medium">
          {currentPage}
        </div>
        <Button
          variant="outline"
          className="size-8 p-0"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden size-8 p-0 lg:flex"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage >= totalPages}
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          of {totalPages}
        </p>
      </div>
    </div>
  );
}
