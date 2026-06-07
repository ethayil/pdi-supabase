"use client";

import { FilterIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Category } from "@/app/generated/prisma/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegisterAction } from "@/hooks/use-command-actions";
import { useProductParams } from "@/lib/nuqs/product-params";

interface ProductFiltersProps {
  categories: Category[] | null;
  selectedCategoryId?: string;
  startTransition?: React.TransitionStartFunction;
}

export function ProductFilters({
  categories,
  selectedCategoryId = "all",
  startTransition,
}: ProductFiltersProps) {
  const [_, setParams] = useProductParams({ startTransition });

  const [open, setOpen] = useState(false);

  useRegisterAction({
    id: "filter-category",
    label: "Filter Category",
    shortcut: "c",
    handler: () => setOpen(true),
    icon: FilterIcon,
    category: "Products",
  });

  function handleCategoryChange(category: string | null) {
    setParams({ categoryId: category === "all" ? null : category });
  }

  const checkCategoryId = useCallback(() => {
    if (selectedCategoryId === "all") return true;

    const categoryExists = categories?.some(
      (category) => category.id === selectedCategoryId,
    );
    if (!categoryExists) {
      return setParams({ categoryId: null });
    } else return true;
  }, [selectedCategoryId, categories, setParams]);

  useEffect(() => {
    checkCategoryId();
  }, [checkCategoryId]);

  if (!categories || categories.length < 1) return null;

  const items = [
    { value: "all", label: "All" },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  return (
    <Select
      items={items}
      defaultValue={selectedCategoryId}
      onValueChange={handleCategoryChange}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger className="w-36 md:w-[180px]">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent className="w-36 md:w-[180px]">
        <SelectGroup>
          <SelectLabel>Categories</SelectLabel>

          {items.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              className="flex items-center space-x-2"
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
