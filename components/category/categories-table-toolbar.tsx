"use client";

import { FilterIcon, SearchIcon, XCircleIcon } from "lucide-react";
import { type FormEvent, useRef } from "react";
import { DataTableViewPortalTarget } from "@/components/data-table/data-table-view-options";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SwitchField } from "@/components/ui/switch-field";
import { useRegisterAction } from "@/hooks/use-command-actions";
import { useCategoryParams } from "@/lib/nuqs/category-params";

export default function CategoriesTableToolbar({
  startTransition,
}: {
  startTransition?: React.TransitionStartFunction;
}) {
  const [{ query, isActive }, setParams] = useCategoryParams({
    startTransition,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  useRegisterAction({
    id: "categories-search",
    label: "Search Categories",
    shortcut: "/",
    handler: () => searchInputRef.current?.focus(),
    icon: SearchIcon,
    category: "Categories",
  });

  useRegisterAction({
    id: "categories-toggle-active",
    label: isActive
      ? "Show Inactive Categories"
      : "Show Only Active Categories",
    shortcut: "i",
    handler: () => setParams({ isActive: !isActive, currentPage: 1 }),
    icon: FilterIcon,
    category: "Categories",
  });

  const handleSearchChange = (val: string) => {
    setParams({ query: val || null, currentPage: 1 });
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setParams({ query: query || null, currentPage: 1 });
  };

  const clearQuery = () => {
    setParams({ query: null, currentPage: 1 });
  };

  return (
    <form className="flex w-full items-center gap-2" onSubmit={handleSearch}>
      <ButtonGroup className="w-full">
        <InputGroup>
          <InputGroupInput
            ref={searchInputRef}
            className="w-full"
            placeholder="Search categories..."
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {query && (
            <InputGroupButton
              variant="secondary"
              size="icon-xs"
              type="button"
              className="mr-2"
              onClick={clearQuery}
            >
              <XCircleIcon />
            </InputGroupButton>
          )}
        </InputGroup>
        <Button type="submit" variant="outline">
          <SearchIcon className="size-4" />
        </Button>
      </ButtonGroup>

      <ButtonGroup>
        <SwitchField
          id="category-active-filter"
          label="Active only"
          mobileLabel="Active"
          checked={isActive}
          onCheckedChange={(checked) =>
            setParams({ isActive: checked, currentPage: 1 })
          }
        />
      </ButtonGroup>

      <DataTableViewPortalTarget />
    </form>
  );
}
