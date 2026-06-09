"use client";

import { useTheme } from "next-themes";
import { useCallback } from "react";
import { flushSync } from "react-dom";

export function useThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = useCallback(
    async (event?: { x: number; y: number }) => {
      if (!document.startViewTransition) {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        return;
      }

      const x = event?.x ?? window.innerWidth / 2;
      const y = event?.y ?? window.innerHeight / 2;
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      await document.startViewTransition(() => {
        flushSync(() => {
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
        });
      }).ready;

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 800,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    },
    [resolvedTheme, setTheme],
  );

  return { toggleTheme };
}
