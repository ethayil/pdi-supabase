"use client";

import { useRef } from "react";
import type { Organization } from "@/app/generated/prisma/client";
import { useOrganizationStore } from "@/store/use-organization-store";

export function StoreInitializer({
  organizations,
}: {
  organizations: Organization[];
}) {
  const initialized = useRef(false);

  if (!initialized.current) {
    useOrganizationStore.setState({
      organizations,
      lastSyncedAt: new Date().toLocaleString(),
    });
    initialized.current = true;
  }

  return null;
}
