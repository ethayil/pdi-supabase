import type { Column } from "@tanstack/react-table";
import { MoreHorizontalIcon, Settings2Icon } from "lucide-react";
import { useState } from "react";
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

interface DataTableViewOptionsProps<TData, TValue> {
  columns: Column<TData, TValue>[];
}

export function DataTableViewOptions<TData, TValue>({
  columns,
}: DataTableViewOptionsProps<TData, TValue>) {
  const [open, setOpen] = useState(false);

  useRegisterAction({
    id: "toggle-view-options",
    label: "View Options",
    shortcut: "v",
    handler: () => setOpen(true),
    category: "Table",
    icon: Settings2Icon,
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            // size="icon"
            className="w-8 sm:w-auto"
          >
            <MoreHorizontalIcon className="size-4" />
            <span className="hidden sm:inline">View</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-37.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {columns.map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
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
}
