import { create } from "zustand";
import type { Organization } from "@/app/generated/prisma/client";
import { getOrganizations } from "@/data/organizations";

interface OrganizationStore {
  organizations: Organization[];
  loading: boolean;
  error: string | null;
  lastSyncedAt: string | null;
  fetchOrganizations: (force?: boolean) => Promise<void>;
  clearStore: () => void;
}

export const useOrganizationStore = create<OrganizationStore>((set, get) => ({
  organizations: [],
  loading: false,
  error: null,
  lastSyncedAt: null,
  fetchOrganizations: async (force = false) => {
    const { organizations, loading } = get();
    if (loading) return;

    // If we already have organizations and are not forcing, skip fetch
    if (organizations.length > 0 && !force) return;

    set({ loading: true, error: null });
    try {
      const res = await getOrganizations({ entriesPerPage: 1000, bypassCache: force });
      if (res?.success && res.data) {
        set({
          organizations: res.data,
          lastSyncedAt: new Date().toLocaleString(),
          error: null,
        });
      } else {
        set({ error: res?.error || "Failed to load organizations" });
      }
    } catch (err) {
      set({
        error: err instanceof Error
          ? err.message
          : "Error fetching organizations",
      });
    } finally {
      set({ loading: false });
    }
  },
  clearStore: () =>
    set({ organizations: [], lastSyncedAt: null, error: null }),
}));
