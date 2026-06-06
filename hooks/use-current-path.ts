"use client";

import { useParams, usePathname } from "next/navigation";

export function useCurrentPath() {
  const params = useParams();
  const pathname = usePathname();

  const orgId = params.orgId as string;
  const organizationId = orgId; // for backward compatibility if referenced elsewhere

  // Strip orgId from pathname
  const pathParts = pathname.split("/").filter(Boolean);
  const currentPath =
    pathParts[0] === orgId
      ? pathParts.slice(1).join("/")
      : pathParts.join("/");

  return { orgId, organizationId, currentPath, pathname };
}
