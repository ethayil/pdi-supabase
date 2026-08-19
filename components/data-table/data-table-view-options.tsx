import type { Column } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRegisterAction } from "@/hooks/use-command-actions";
import { cn } from "@/lib/utils";

export const DEFAULT_VIEW_PORTAL_ID = "datatable-view-portal";

export function DataTableViewPortalTarget({
  id = DEFAULT_VIEW_PORTAL_ID,
  className,
}: {
  id?: string;
  className?: string;
}) {
  return <div id={id} className={cn("shrink-0", className)} />;
}

interface DataTableViewOptionsProps<TData, TValue> {
  columns: Column<TData, TValue>[];
  portalContainer?: HTMLElement | null;
  portalId?: string;
  className?: string;
}

export function DataTableViewOptions<TData, TValue>({
  columns,
  portalContainer,
  portalId = DEFAULT_VIEW_PORTAL_ID,
  className,
}: DataTableViewOptionsProps<TData, TValue>) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const resolveTarget = () => {
      if (portalContainer) return portalContainer;
      if (portalId) return document.getElementById(portalId);
      return null;
    };

    setTargetElement(resolveTarget());

    if (portalId) {
      const timer = setTimeout(() => {
        setTargetElement(resolveTarget());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [portalContainer, portalId]);

  useRegisterAction({
    id: "toggle-view-options",
    label: "View Options",
    shortcut: "v",
    handler: () => setOpen(true),
    category: "Table",
    icon: EyeIcon,
  });

  const content = (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 w-8 sm:w-auto px-0 sm:px-2.5 shrink-0 flex items-center justify-center gap-1.5 text-sm font-medium",
              className,
            )}
          >
            <EyeIcon className="size-4 shrink-0" />
            <span className="hidden sm:inline">View</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-37.5 z-50">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {columns.map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize text-xs"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (mounted && targetElement) {
    return createPortal(content, targetElement);
  }

  return content;
}
