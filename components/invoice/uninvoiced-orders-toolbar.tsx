"use client";

import { FilterXIcon, SearchIcon, XCircleIcon } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderStatuses } from "@/types/globals";

interface UninvoicedOrdersToolbarProps {
  loading: boolean;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onClearFilters: () => void;
}

export function UninvoicedOrdersToolbar({
  loading,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  onClearFilters,
}: UninvoicedOrdersToolbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const statusOptions = [
    { label: "All Statuses", value: "all" },
    ...orderStatuses.map((s) => ({
      label:
        s.replace(/_/g, " ").charAt(0).toUpperCase() +
        s.replace(/_/g, " ").slice(1),
      value: s,
    })),
  ];

  const hasFilters = (statusFilter && statusFilter !== "all") || !!searchQuery;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-50">
          <ButtonGroup className="w-full">
            <InputGroup>
              <InputGroupInput
                ref={searchInputRef}
                className="w-full"
                placeholder="Search reference, name..."
                value={searchQuery}
                disabled={loading}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.currentTarget.blur();
                  }
                }}
              />
              {searchQuery && (
                <InputGroupButton
                  variant="secondary"
                  size="icon-xs"
                  type="button"
                  className="mr-2"
                  disabled={loading}
                  onClick={() => onSearchQueryChange("")}
                >
                  <XCircleIcon className="size-3" />
                </InputGroupButton>
              )}
            </InputGroup>
            <Button type="submit" variant="outline" disabled={loading}>
              <SearchIcon className="size-4" />
            </Button>
          </ButtonGroup>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            items={statusOptions}
            onValueChange={(value) => {
              if (value) onStatusFilterChange(value);
            }}
            value={statusFilter || "all"}
          >
            <SelectTrigger className="h-8 flex-1 sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((stat) => (
                <SelectItem key={stat.value} value={stat.value}>
                  {stat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={onClearFilters}
            >
              <FilterXIcon className="size-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
