/** biome-ignore-all lint/performance/noImgElement: img is required here*/

"use client";

import { ChevronsUpDownIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import type { Organization } from "@/app/generated/prisma/client";
import type { User } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { SidebarHeader } from "@/components/ui/sidebar";
import { useCurrentPath } from "@/hooks/use-current-path";
import { cn } from "@/lib/utils";
import { useOrganizationStore } from "@/store/use-organization-store";

interface OrganizationSwitcherProps {
  user: User;
  organizationId?: string | null;
  className?: string;
}

export default function OrganizationSwitcher({
  user,
  organizationId,
  className,
}: OrganizationSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { currentPath } = useCurrentPath();

  const { organizations, loading } = useOrganizationStore();

  const selectedOrganization = organizations.find(
    (org) => org.id === organizationId,
  );

  const orgName = selectedOrganization?.name ?? "PDi";

  const isAdmin = user?.role === "admin";

  if (!organizationId) return null;

  const getLogoUrl = (org: Organization | undefined) => {
    return (
      org?.logo ??
      `https://avatar.vercel.sh/${org?.name}.svg?text=${org?.name
        .slice(0, 2)
        .toUpperCase()}`
    );
  };

  // If not admin, just show the current organization
  if (!isAdmin || !organizations) {
    return (
      <SidebarHeader className="border-b border-sidebar-border h-16 flex items-center justify-center px-0.5 py-0">
        <div
          className={cn(
            "flex items-center gap-3 px-1 py-2 w-full",
            "group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:w-full transition-all",
            className,
          )}
        >
          <div className="relative w-12 h-8 shrink-0 overflow-hidden flex items-center justify-center">
            {loading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <img
                src={getLogoUrl(selectedOrganization)}
                alt={orgName}
                className="size-full object-contain"
              />
            )}
          </div>
          <div className="flex-1 min-w-0 group-data-[state=collapsed]:hidden">
            <p className="text-sm font-semibold leading-snug">{orgName}</p>
            {/* <p className="text-[10px] text-muted-foreground font-mono leading-none">
              {selectedOrganization?.slug}
            </p> */}
          </div>
        </div>
      </SidebarHeader>
    );
  }

  const handleOrganizationSwitch = (organization: Organization) => {
    // If we're on a specific item (e.g., admin/orders/[id]), go back to the list
    const parts = currentPath.split("/");
    let targetPath = currentPath;

    // Check for 20+ char hex ids or similar
    if (
      parts.length >= 2 &&
      /^[a-zA-Z0-9]{20,}$/.test(parts[parts.length - 1])
    ) {
      targetPath = parts.slice(0, -1).join("/");
    }

    router.replace(`/${organization.id}/${targetPath}`);
    setOpen(false);
  };

  return (
    <SidebarHeader className="border-b border-sidebar-border h-16 flex items-center justify-center px-0.5 py-0 group-data-[state=collapsed]:p-0">
      <Combobox items={organizations} value={selectedOrganization?.id ?? ""}>
        <ComboboxTrigger
          render={
            <Button
              variant="outline"
              aria-expanded={open}
              aria-label="Select a team"
              className={cn("w-full justify-between h-auto py-3", className)}
            />
          }
        >
          <div className="flex items-center gap-2 flex-1 min-w-0 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:w-full transition-all">
            <div className="relative w-12 h-8 shrink-0 overflow-hidden flex items-center justify-center">
              {loading ? (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              ) : (
                <img
                  src={getLogoUrl(selectedOrganization)}
                  alt={selectedOrganization?.name ?? "PDi"}
                  className="size-full object-contain"
                />
              )}
            </div>
            <div className="flex-1 min-w-0 text-left group-data-[state=collapsed]:hidden">
              <p className="text-sm font-semibold leading-snug mb-1 truncate">
                {selectedOrganization?.name}
              </p>
              <p className="text-[10px] text-muted-foreground font-mono leading-none">
                {selectedOrganization?.prefix}
              </p>
            </div>
          </div>
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50 group-data-[state=collapsed]:hidden" />
        </ComboboxTrigger>

        <ComboboxContent className="w-60">
          <ComboboxInput
            showTrigger={false}
            placeholder="Search organization..."
          />
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(organization) => (
              <ComboboxItem
                key={organization.id}
                value={organization.id}
                onClick={() => handleOrganizationSwitch(organization)}
              >
                <div className="relative mr-2 size-5 shrink-0 rounded border border-sidebar-border bg-white p-0.5 overflow-hidden flex items-center justify-center shadow-sm">
                  <img
                    src={getLogoUrl(organization)}
                    alt={organization.name}
                    className={cn(
                      selectedOrganization?.id === organization.id
                        ? "grayscale-0"
                        : "grayscale",
                      "group-hover:grayscale-0",
                      "size-full object-contain rounded-xs",
                    )}
                  />
                </div>
                <span className="truncate">{organization.name}</span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </SidebarHeader>
  );
}
