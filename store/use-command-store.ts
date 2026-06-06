import type { LucideIcon } from "lucide-react";
import { create } from "zustand";

export interface CommandAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  category?: string;
  shortcut?: string;
  handler: () => void;
  isGlobal?: boolean;
}

interface CommandState {
  actions: CommandAction[];
  registerAction: (action: CommandAction) => void;
  unregisterAction: (id: string) => void;
}

export const useCommandStore = create<CommandState>((set) => ({
  actions: [],
  registerAction: (action) =>
    set((state) => {
      const existingIndex = state.actions.findIndex((a) => a.id === action.id);
      if (existingIndex !== -1) {
        const existing = state.actions[existingIndex];
        // Only trigger a state update if the visual/structural content changed.
        // We skip 'handler' check here to prevent re-render loops from unstable closures.
        const isSame =
          existing.label === action.label &&
          existing.shortcut === action.shortcut &&
          existing.category === action.category &&
          existing.isGlobal === action.isGlobal;

        if (isSame) return state;

        const newActions = [...state.actions];
        newActions[existingIndex] = action;
        return { actions: newActions };
      }
      return { actions: [...state.actions, action] };
    }),
  unregisterAction: (id) =>
    set((state) => ({
      actions: state.actions.filter((a) => a.id !== id),
    })),
}));
