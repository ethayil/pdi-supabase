"use client";
import { ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { usePaginationParams } from "@/lib/nuqs/global-params";

export const PaginationMain = ({
  hasNextPage,
  startTransition,
}: {
  hasNextPage: boolean;
  startTransition?: React.TransitionStartFunction;
}) => {
  const [{ currentPage }, setParams] = usePaginationParams({ startTransition });

  return (
    <div className="sticky bottom-0 z-50 flex justify-center border-t bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60 py-2 px-4">
      <Pagination>
        <PaginationContent className="space-x-2">
          <PaginationItem>
            <Button
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setParams({ currentPage: currentPage - 1 })}
            >
              <ChevronRightIcon className="rotate-180" /> Previous
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button size="icon-sm">{currentPage}</Button>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="outline"
              disabled={!hasNextPage}
              onClick={() => setParams({ currentPage: currentPage + 1 })}
            >
              Next <ChevronRightIcon />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
