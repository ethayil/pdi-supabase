"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useRef } from "react";
import { buttonVariants } from "@/components/ui/button";
import { DropdownMenuGroup, DropdownMenuItem } from "./ui/dropdown-menu";

export function ThemeToggle({ type }: { type: "sidebar" | "auth" }) {
  const { theme, setTheme } = useTheme();

  const buttonRef = useRef<HTMLDivElement>(null);

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return;

    await document.startViewTransition(() => {
      theme === "dark" ? setTheme("light") : setTheme("dark");
    }).ready;

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(left, window.innerWidth - left),
      Math.max(top, window.innerHeight - top),
    );

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
  }, [theme, setTheme]);

  return type === "sidebar" ? (
    <DropdownMenuGroup>
      <DropdownMenuItem onClick={toggleTheme} ref={buttonRef}>
        <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        Dark
      </DropdownMenuItem>
    </DropdownMenuGroup>
  ) : (
    <button
      type="button"
      className={buttonVariants({ variant: "outline", size: "icon" })}
      onClick={toggleTheme}
      ref={buttonRef}
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all duration-700 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all duration-700 dark:rotate-0 dark:scale-100" />
    </button>
  );
}
