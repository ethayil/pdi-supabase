import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface BannerStore {
  dismissedIds: string[];
  dismissBanner: (id: string) => void;
  clearDismissed: () => void;
}

export const useBannerStore = create<BannerStore>()(
  persist(
    (set) => ({
      dismissedIds: [],
      dismissBanner: (id) =>
        set((state) => {
          if (state.dismissedIds.includes(id)) return state;
          return { dismissedIds: [...state.dismissedIds, id] };
        }),
      clearDismissed: () => set({ dismissedIds: [] }),
    }),
    {
      name: "banner-dismissal-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
