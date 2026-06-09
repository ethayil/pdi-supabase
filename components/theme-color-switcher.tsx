"use client";

import { CheckIcon } from "lucide-react";
import { type ColorTheme, useColorTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const THEME_META: Record<
  ColorTheme,
  { label: string; swatch: string; accent: string }
> = {
  midnight: {
    label: "Midnight",
    swatch: "bg-gradient-to-br from-blue-600 to-indigo-800",
    accent: "ring-blue-500",
  },
  steel: {
    label: "Steel",
    swatch: "bg-gradient-to-br from-slate-400 to-slate-600",
    accent: "ring-slate-500",
  },
  ember: {
    label: "Ember",
    swatch: "bg-gradient-to-br from-amber-500 to-orange-700",
    accent: "ring-amber-500",
  },
  emerald: {
    label: "Emerald",
    swatch: "bg-gradient-to-br from-emerald-500 to-teal-700",
    accent: "ring-emerald-500",
  },
  amethyst: {
    label: "Amethyst",
    swatch: "bg-gradient-to-br from-purple-500 to-violet-800",
    accent: "ring-purple-500",
  },
};

export function ThemeColorSwitcher({
  layout = "row",
}: {
  layout?: "row" | "grid";
}) {
  const { colorTheme, setColorTheme, colorThemes } = useColorTheme();

  return (
    <div
      className={cn(
        "flex gap-2",
        layout === "grid" && "grid grid-cols-4 gap-3",
      )}
    >
      {colorThemes.map((theme) => {
        const meta = THEME_META[theme];
        const isActive = colorTheme === theme;

        return (
          <button
            key={theme}
            type="button"
            onClick={() => setColorTheme(theme)}
            className={cn(
              "group relative flex flex-col items-center gap-1.5 rounded-lg p-2 transition-all",
              layout === "grid" && "p-3",
              isActive
                ? "bg-muted ring-2 ring-offset-2 ring-offset-background " +
                    meta.accent
                : "hover:bg-muted/50",
            )}
            title={meta.label}
          >
            <div
              className={cn(
                "relative rounded-full transition-transform",
                layout === "grid" ? "size-8" : "size-6",
                meta.swatch,
                isActive && "scale-110",
              )}
            >
              {isActive && (
                <CheckIcon className="absolute inset-0 m-auto size-3 text-white drop-shadow-sm" />
              )}
            </div>
            {layout === "grid" && (
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {meta.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
