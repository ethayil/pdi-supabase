"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useRef } from "react";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRegisterAction } from "@/hooks/use-command-actions";
import { useProductParams } from "@/lib/nuqs/product-params";

export function ProductSearch({
  startTransition,
}: {
  startTransition?: React.TransitionStartFunction;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [{ query }, setParams] = useProductParams({ startTransition });

  useRegisterAction({
    id: "focus-search",
    label: "Search Products",
    shortcut: "/",
    handler: () => inputRef.current?.focus(),
    icon: SearchIcon,
    category: "Products",
  });

  return (
    <ButtonGroup>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <Tooltip>
            <TooltipTrigger
              render={
                <InputGroupButton
                  variant="ghost"
                  aria-label="Info"
                  size="icon-xs"
                />
              }
            >
              <SearchIcon />
            </TooltipTrigger>
            <TooltipContent>
              <p>Search products</p>
            </TooltipContent>
          </Tooltip>
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          placeholder="Search products"
          value={query}
          onChange={(e) =>
            setParams({ query: e.target.value }, { throttleMs: 1000 })
          }
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.currentTarget.blur();
            }
          }}
        />
        {query && (
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger>
                <InputGroupButton
                  variant="ghost"
                  aria-label="Info"
                  size="icon-xs"
                  onClick={() => setParams({ query: "" })}
                >
                  <XIcon />
                </InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear search</p>
              </TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        )}
      </InputGroup>
    </ButtonGroup>
  );
}
