import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CookieConsentStore {
  hasConsented: boolean;
  acceptNecessary: () => void;
}

export const useCookieConsentStore = create<CookieConsentStore>()(
  persist(
    (set) => ({
      hasConsented: false,
      acceptNecessary: () => set({ hasConsented: true }),
    }),
    {
      name: "cookie-consent-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
