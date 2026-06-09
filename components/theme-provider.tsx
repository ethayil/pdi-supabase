"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

const COLOR_THEMES = ["midnight", "steel", "ember", "emerald", "amethyst"] as const;
export type ColorTheme = (typeof COLOR_THEMES)[number];

const STORAGE_KEY = "color-theme";
const DEFAULT_THEME: ColorTheme = "midnight";

type ColorThemeContextValue = {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  colorThemes: readonly ColorTheme[];
};

const ColorThemeContext = createContext<ColorThemeContextValue>({
  colorTheme: DEFAULT_THEME,
  setColorTheme: () => {},
  colorThemes: COLOR_THEMES,
});

export function useColorTheme() {
  return useContext(ColorThemeContext);
}

function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(DEFAULT_THEME);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ColorTheme | null;
    if (stored && COLOR_THEMES.includes(stored)) {
      setColorThemeState(stored);
      applyThemeClass(stored);
    }
  }, []);

  const setColorTheme = useCallback((theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    applyThemeClass(theme);
  }, []);

  return (
    <ColorThemeContext.Provider
      value={{ colorTheme, setColorTheme, colorThemes: COLOR_THEMES }}
    >
      {children}
    </ColorThemeContext.Provider>
  );
}

function applyThemeClass(theme: ColorTheme) {
  const root = document.documentElement;
  // Remove all theme-* classes
  root.classList.forEach((cls) => {
    if (cls.startsWith("theme-")) {
      root.classList.remove(cls);
    }
  });
  // "midnight" is the default — no class needed (base dark/light covers it)
  // But we still add the class for consistency
  if (theme !== "midnight") {
    root.classList.add(`theme-${theme}`);
  }
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ColorThemeProvider>{children}</ColorThemeProvider>
    </NextThemesProvider>
  );
}
