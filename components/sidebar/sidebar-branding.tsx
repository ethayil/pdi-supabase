/** biome-ignore-all lint/performance/noImgElement: img is required here*/
"use client";

import { Loader2 } from "lucide-react";
import type { Organization } from "@/app/generated/prisma/client";
import { SpotlightCard } from "@/components/ui/text-reveal-effects";
import { cn } from "@/lib/utils";
import { useOrganizationStore } from "@/store/use-organization-store";

interface SidebarBrandingProps {
  organizationId?: string | null;
  className?: string;
}

export function SidebarBranding({
  organizationId,
  className,
}: SidebarBrandingProps) {
  const { organizations, loading } = useOrganizationStore();

  if (!organizationId) return null;

  const selectedOrganization = organizations.find(
    (org) => org.id === organizationId,
  );

  const orgName = selectedOrganization?.name ?? "PDi";

  const getLogoUrl = (org: Organization | undefined) => {
    return (
      org?.logo ??
      `https://avatar.vercel.sh/${org?.name}.svg?text=${org?.name
        .slice(0, 2)
        .toUpperCase()}`
    );
  };

  return (
    <SpotlightCard
      className={cn("flex flex-col items-center w-full rounded-lg", className)}
    >
      <div className="relative w-full h-24 flex items-center justify-center">
        {loading ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : (
          <img
            src={getLogoUrl(selectedOrganization)}
            alt={orgName}
            className="w-full h-full object-contain"
          />
        )}
      </div>
      <div className="w-full p-2.5 text-center flex flex-col gap-1 border-t border-sidebar-border/50">
        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Partner Portal
        </span>
        <span className="text-sm font-semibold text-sidebar-foreground leading-snug whitespace-normal wrap-break-word">
          {orgName}
        </span>
      </div>
    </SpotlightCard>
  );
}
