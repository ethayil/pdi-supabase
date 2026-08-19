"use client";

import { MousePointerClickIcon, SearchIcon, XCircleIcon } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import type { Category } from "@/app/generated/prisma/client";
import { DataTableViewPortalTarget } from "@/components/data-table/data-table-view-options";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useRegisterAction } from "@/hooks/use-command-actions";
import { useProductParams } from "@/lib/nuqs/product-params";

const stockStatusOptions = [
  { label: "All Products", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Out of Stock", value: "out_of_stock" },
  { label: "Low Stock", value: "low_stock" },
];

export default function ProductsTableToolbar({
  loading,
  categories = [],
  startTransition,
}: {
  organizationId: string;
  loading: boolean;
  categories: Category[];
  startTransition: React.TransitionStartFunction;
}) {
  const [{ query, categoryId, stockStatus }, setParams] = useProductParams({
    startTransition,
  });

  const [localSearch, setLocalSearch] = useState(query);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalSearch(query);
  }, [query]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setParams({ query: localSearch || null, currentPage: 1 });
  };

  const clearQuery = () => {
    setLocalSearch("");
    setParams({ query: null, currentPage: 1 });
  };

  const categoriesWithAll = [
    { value: "all", label: "All Categories" },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  // Register shortcuts
  useRegisterAction({
    id: "focus-search",
    label: "Search Products",
    shortcut: "/",
    handler: () => searchInputRef.current?.focus(),
    icon: SearchIcon,
    category: "Products",
  });

  useRegisterAction({
    id: "toggle-categories",
    label: "Open Categories",
    shortcut: "c",
    handler: () => setIsCategoryOpen(true),
    icon: MousePointerClickIcon,
    category: "Products",
  });

  useRegisterAction({
    id: "open-status",
    label: "Open Status Filter",
    shortcut: "a",
    handler: () => setIsStatusOpen(true),
    icon: MousePointerClickIcon,
    category: "Products",
  });

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <form className="w-full sm:flex-1" onSubmit={handleSearch}>
          <ButtonGroup className="w-full">
            <InputGroup>
              <InputGroupInput
                ref={searchInputRef}
                className="w-full"
                placeholder="Search products..."
                disabled={loading}
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.currentTarget.blur();
                  }
                }}
              />
              {localSearch && (
                <InputGroupButton
                  variant="secondary"
                  size="icon-xs"
                  type="button"
                  className="mr-2"
                  disabled={loading}
                  onClick={clearQuery}
                >
                  <XCircleIcon />
                </InputGroupButton>
              )}
            </InputGroup>
            <Button type="submit" variant="outline" disabled={loading}>
              <SearchIcon className="size-4" />
            </Button>
          </ButtonGroup>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {loading ? (
            <Skeleton className="h-8 flex-1 sm:w-40 rounded-md" />
          ) : (
            <Select
              items={categoriesWithAll}
              open={isCategoryOpen}
              onOpenChange={setIsCategoryOpen}
              onValueChange={(value) => {
                setParams({
                  categoryId: value === "all" ? null : value,
                  currentPage: 1,
                });
              }}
              value={categoryId || "all"}
            >
              <SelectTrigger className="h-8 flex-1 sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoriesWithAll.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {loading ? (
            <Skeleton className="h-8 flex-1 sm:w-40 rounded-md" />
          ) : (
            <Select
              items={stockStatusOptions}
              open={isStatusOpen}
              onOpenChange={setIsStatusOpen}
              onValueChange={(value) => {
                setParams({ stockStatus: value, currentPage: 1 });
              }}
              value={stockStatus || "active"}
            >
              <SelectTrigger className="h-8 flex-1 sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {stockStatusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <DataTableViewPortalTarget />
        </div>
      </div>
    </div>
  );
}
