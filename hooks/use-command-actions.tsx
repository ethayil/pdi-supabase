"use client";

import { type RegisterableHotkey, useHotkey } from "@tanstack/react-hotkeys";
import { useEffect, useEffectEvent } from "react";
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

  // useEffectEvent always sees the freshest action.handler without needing ref syncing
  const onExecuteAction = useEffectEvent(() => {
    action?.handler?.();
  });

  useHotkey(
    (action?.shortcut as RegisterableHotkey) || ("" as RegisterableHotkey),
    onExecuteAction,
    { enabled: !!action?.shortcut, conflictBehavior: "allow" },
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional omission of 'action' identity to break the infinite re-render loop
  useEffect(() => {
    if (action) {
      registerAction({
        ...action,
        handler: onExecuteAction,
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
  ]);
}
