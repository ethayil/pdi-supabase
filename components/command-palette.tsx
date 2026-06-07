"use client";

import { type RegisterableHotkey, useHotkey } from "@tanstack/react-hotkeys";
import { Command as CommandPrimitive } from "cmdk";
import {
  Building2Icon,
  HistoryIcon,
  LayoutGridIcon,
  MegaphoneIcon,
  PackageIcon,
  PanelLeftIcon,
  ReceiptIcon,
  SearchIcon,
  ShoppingBagIcon,
  SunMoonIcon,
  UsersIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CommandDialog } from "@/components/ui/command";
import { useSidebar } from "@/components/ui/sidebar";
import {
  useCommandActions,
  useRegisterAction,
} from "@/hooks/use-command-actions";
import { useThemeToggle } from "@/hooks/use-theme-toggle";

export function CommandPalette({ role }: { role?: string | null }) {
  const [open, setOpen] = useState(false);
  const { actions } = useCommandActions();
  const router = useRouter();
  const params = useParams();
  const organizationId = (params.orgId ?? params.organizationId) as string;
  const { toggleSidebar } = useSidebar();

  // Toggle palette with '?' or 'h'
  useHotkey("?" as RegisterableHotkey, () => setOpen((prev) => !prev));
  useHotkey("h" as RegisterableHotkey, () => setOpen((prev) => !prev));

  const { toggleTheme } = useThemeToggle();

  // Register Global Actions
  useRegisterAction({
    id: "toggle-sidebar",
    label: "Toggle Sidebar",
    shortcut: "Mod+B",
    handler: toggleSidebar,
    icon: PanelLeftIcon,
    category: "General",
  });

  useRegisterAction({
    id: "toggle-theme",
    label: "Toggle Appearance",
    shortcut: "t",
    handler: toggleTheme,
    icon: SunMoonIcon,
    category: "General",
  });

  // Navigation Actions (Restricted to Superadmin)
  useRegisterAction(
    role?.toLowerCase() === "superadmin"
      ? {
          id: "nav-orders",
          label: "Go to Orders",
          shortcut: "Mod+1",
          handler: () => router.push(`/${organizationId}/admin/orders`),
          icon: ShoppingBagIcon,
          category: "Admin",
        }
      : null,
  );

  useRegisterAction(
    role?.toLowerCase() === "superadmin"
      ? {
          id: "nav-categories",
          label: "Go to Categories",
          shortcut: "Mod+2",
          handler: () => router.push(`/${organizationId}/admin/categories`),
          icon: LayoutGridIcon,
          category: "Admin",
        }
      : null,
  );

  useRegisterAction(
    role?.toLowerCase() === "superadmin"
      ? {
          id: "nav-products",
          label: "Go to Products",
          shortcut: "Mod+3",
          handler: () => router.push(`/${organizationId}/admin/products`),
          icon: PackageIcon,
          category: "Admin",
        }
      : null,
  );

  useRegisterAction(
    role?.toLowerCase() === "superadmin"
      ? {
          id: "nav-orgs",
          label: "Go to Organizations",
          shortcut: "Mod+4",
          handler: () => router.push(`/${organizationId}/admin/orgs`),
          icon: Building2Icon,
          category: "Admin",
        }
      : null,
  );

  useRegisterAction(
    role?.toLowerCase() === "superadmin"
      ? {
          id: "nav-invoices",
          label: "Go to Invoices",
          shortcut: "Mod+5",
          handler: () => router.push(`/${organizationId}/admin/invoices`),
          icon: ReceiptIcon,
          category: "Admin",
        }
      : null,
  );

  useRegisterAction(
    role?.toLowerCase() === "superadmin"
      ? {
          id: "nav-users",
          label: "Go to Users",
          shortcut: "Mod+6",
          handler: () => router.push(`/${organizationId}/admin/users`),
          icon: UsersIcon,
          category: "Admin",
        }
      : null,
  );

  useRegisterAction(
    role?.toLowerCase() === "superadmin"
      ? {
          id: "nav-logs",
          label: "Go to Logs",
          shortcut: "Mod+7",
          handler: () => router.push(`/${organizationId}/admin/logs`),
          icon: HistoryIcon,
          category: "Admin",
        }
      : null,
  );

  useRegisterAction(
    role?.toLowerCase() === "superadmin"
      ? {
          id: "nav-notifications",
          label: "Go to Notifications",
          shortcut: "Mod+8",
          handler: () => router.push(`/${organizationId}/admin/notifications`),
          icon: MegaphoneIcon,
          category: "Admin",
        }
      : null,
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      className="bg-card/60 backdrop-blur-md border border-border/40 shadow-2xl max-w-150! p-0! rounded-xl!"
    >
      <CommandPrimitive className="flex flex-col overflow-hidden">
        <div
          className="flex items-center border-b border-border/80 px-4"
          cmdk-input-wrapper=""
        >
          <SearchIcon className="mr-2 size-4 shrink-0 opacity-50 text-muted-foreground" />
          <CommandPrimitive.Input
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Type a command or search..."
          />
        </div>
        <CommandPrimitive.List className="max-h-112.5 overflow-y-auto overflow-x-hidden no-scrollbar p-2">
          <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </CommandPrimitive.Empty>

          {/* Group actions by category with custom sorting */}
          {Array.from(new Set(actions.map((a) => a.category || "General")))
            .sort((a, b) => {
              const lastPriorityCategories = ["Table", "Admin", "General"];
              const isALast = lastPriorityCategories.includes(a);
              const isBLast = lastPriorityCategories.includes(b);

              if (isALast && !isBLast) return 1;
              if (!isALast && isBLast) return -1;
              if (isALast && isBLast) {
                return (
                  lastPriorityCategories.indexOf(a) -
                  lastPriorityCategories.indexOf(b)
                );
              }
              return a.localeCompare(b);
            })
            .map((category) => (
              <CommandPrimitive.Group
                key={category}
                heading={category}
                className="overflow-hidden p-2 text-foreground **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-2 **:[[cmdk-group-heading]]:text-[11px] **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:text-muted-foreground/50 **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-wider"
              >
                {actions
                  .filter((a) => (a.category || "General") === category)
                  .map((action) => (
                    <CommandPrimitive.Item
                      key={action.id}
                      value={action.label}
                      onSelect={() => {
                        action.handler();
                        setOpen(false);
                      }}
                      className="aria-selected:bg-muted aria-selected:text-accent-foreground aria-selected:shadow-lg flex cursor-default select-none items-center gap-3 rounded-md p-2 text-sm transition-all data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
                    >
                      {action.icon && (
                        <action.icon className="h-4 w-4 opacity-70" />
                      )}
                      <span className="flex-1 font-medium">{action.label}</span>
                      {action.shortcut && (
                        <span className="bg-muted/50 text-muted-foreground border-border/40s pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[9px] font-bold opacity-100 ml-auto tracking-tight uppercase shadow">
                          {action.shortcut}
                        </span>
                      )}
                    </CommandPrimitive.Item>
                  ))}
              </CommandPrimitive.Group>
            ))}
        </CommandPrimitive.List>
      </CommandPrimitive>
    </CommandDialog>
  );
}
