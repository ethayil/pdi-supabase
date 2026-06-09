"use client";

import { Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeColorSwitcher } from "@/components/theme-color-switcher";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SettingsView() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="size-4 text-muted-foreground" />
            Appearance
          </CardTitle>
          <CardDescription>
            Choose your preferred color theme and mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Theme */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium">Color Theme</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select an accent color palette for the interface
              </p>
            </div>
            <ThemeColorSwitcher layout="grid" />
          </div>

          {/* Light / Dark Mode */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium">Mode</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Switch between light and dark mode
              </p>
            </div>
            <div className="flex gap-2">
              {[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
                { value: "system", label: "System", icon: null },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    theme === value
                      ? "bg-linear-to-b from-[(--card-gradient-from)] to-[(--card-gradient-to)] ring-2 ring-ring/50 shadow-[inset_0_1px_0_0_var(--card-glow)]"
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {Icon && <Icon className="size-4" />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for future settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            More settings coming soon
          </CardTitle>
          <CardDescription>
            Additional preferences and configuration options will be added here
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
