"use client";

import { FilterIcon, SearchIcon, XCircleIcon } from "lucide-react";
import { type FormEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useRegisterAction } from "@/hooks/use-command-actions";
import { useOrgParams } from "@/lib/nuqs/org-params";
import { SwitchField } from "../ui/switch-field";

export default function OrgsHeader({
  startTransition,
}: {
  startTransition?: React.TransitionStartFunction;
}) {
  const [{ query, isActive }, setParams] = useOrgParams({ startTransition });

  const searchInputRef = useRef<HTMLInputElement>(null);

  useRegisterAction({
    id: "orgs-search",
    label: "Search Organizations",
    shortcut: "/",
    handler: () => searchInputRef.current?.focus(),
    icon: SearchIcon,
    category: "Organizations",
  });

  useRegisterAction({
    id: "orgs-toggle-active",
    label: isActive
      ? "Show Inactive Organizations"
      : "Show Only Active Organizations",
    shortcut: "i",
    handler: () => setParams({ isActive: !isActive, currentPage: 1 }),
    icon: FilterIcon,
    category: "Organizations",
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
            placeholder="Search organizations..."
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
          id="unread-filter"
          label="Unread only"
          mobileLabel="Unread"
          checked={isActive}
          onCheckedChange={(checked) =>
            setParams({ isActive: checked, currentPage: 1 })
          }
        />
      </ButtonGroup>
    </form>
  );
}
