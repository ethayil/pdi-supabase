"use client";

import { Moon, Sun } from "lucide-react";
import { useCallback, useRef } from "react";
import { buttonVariants } from "@/components/ui/button";
import { useThemeToggle } from "@/hooks/use-theme-toggle";
import { DropdownMenuGroup, DropdownMenuItem } from "./ui/dropdown-menu";

export function ThemeToggle({ type }: { type: "sidebar" | "auth" }) {
  const buttonRef = useRef<any>(null);

  const { toggleTheme } = useThemeToggle();

  const handleToggle = useCallback(() => {
    if (!buttonRef.current) return;
    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect();
    toggleTheme({ x: left + width / 2, y: top + height / 2 });
  }, [toggleTheme]);

  return type === "sidebar" ? (
    <DropdownMenuGroup>
      <DropdownMenuItem onClick={handleToggle} ref={buttonRef}>
        <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        Dark
      </DropdownMenuItem>
    </DropdownMenuGroup>
  ) : (
    <button
      type="button"
      className={buttonVariants({ variant: "outline", size: "icon" })}
      onClick={handleToggle}
      ref={buttonRef}
    >
      <Sun className="size-4 rotate-0 scale-100 transition-all duration-700 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-all duration-700 dark:rotate-0 dark:scale-100" />
    </button>
  );
}
