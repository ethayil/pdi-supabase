"use client";

import { type RegisterableHotkey, useHotkey } from "@tanstack/react-hotkeys";
import { useCallback, useEffect, useRef } from "react";
import { type CommandAction, useCommandStore } from "@/store/use-command-store";

export type { CommandAction };

/**
 * Access all registered command actions.
 */
export function useCommandActions() {
  const actions = useCommandStore((state) => state.actions);
  return { actions };
}

/**
 * Hook to register a command action that unregisters on unmount.
 */
export function useRegisterAction(action: CommandAction | null) {
  const registerAction = useCommandStore((state) => state.registerAction);
  const unregisterAction = useCommandStore((state) => state.unregisterAction);

  // Keep the latest handler in a ref to avoid stale closure issues
  // while keeping the registration stable.
  const handlerRef = useRef(action?.handler);
  useEffect(() => {
    handlerRef.current = action?.handler;
  }, [action?.handler]);

  // Create a stable wrapper handler that calls the latest handler from the ref.
  const stableHandler = useCallback(() => {
    handlerRef.current?.();
  }, []);

  useHotkey(
    (action?.shortcut as RegisterableHotkey) || ("" as RegisterableHotkey),
    stableHandler,
    { enabled: !!action?.shortcut, conflictBehavior: "allow" },
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional omission of 'action' identity to break the infinite re-render loop
  useEffect(() => {
    if (action) {
      registerAction({
        ...action,
        handler: stableHandler,
      });
      return () => unregisterAction(action.id);
    }
  }, [
    action?.id,
    action?.shortcut,
    action?.label,
    action?.category,
    action?.isGlobal,
    registerAction,
    unregisterAction,
    stableHandler,
  ]);
}
