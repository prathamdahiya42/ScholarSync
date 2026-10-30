"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export interface ThemePalette {
  bg: string;
  cardBg: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
  borderGlowColor: string;
  borderGlowColors: string[];
  gridColor: string;
}

export const THEME_PALETTES: Record<Theme, ThemePalette> = {
  light: {
    bg: "#FFFFFF",
    cardBg: "#FFFFFF",
    text: "#160F14",
    muted: "#78716C",
    accent: "#DC2626", // Crimson Red
    border: "#FEE2E2",
    borderGlowColor: "350 95 45", // Deep saturated crimson for light surfaces
    borderGlowColors: ["#DC2626", "#B91C1C", "#E11D48"],
    gridColor: "#DC2626",
  },
  dark: {
    bg: "#000000", // Pure Black
    cardBg: "#121212",
    text: "#FFFFFF", // Crisp White
    muted: "#D6C7CC",
    accent: "#EF4444", // Neon Ruby Red
    border: "#3A1821",
    borderGlowColor: "350 90 60", // Bright neon ruby glow for dark mode
    borderGlowColors: ["#EF4444", "#DC2626", "#F87171"],
    gridColor: "#EF4444",
  },
};

/**
 * Hydration-safe hook that returns the active application theme ('light' | 'dark').
 * Guarantees consistent initial render between SSR and client, then syncs
 * live with document.documentElement (data-theme & dark class) via MutationObserver.
 */
export function useAppTheme(): Theme {
  // Hydration-safe initial state: fixed to 'light' on server and initial client render
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const resolveTheme = (): Theme => {
      const html = document.documentElement;
      const dataTheme = html.getAttribute("data-theme");
      if (dataTheme === "dark" || dataTheme === "light") {
        return dataTheme as Theme;
      }
      if (html.classList.contains("dark")) return "dark";
      if (html.classList.contains("light")) return "light";
      try {
        const saved = localStorage.getItem("theme");
        if (saved === "dark" || saved === "light") return saved as Theme;
      } catch (e) {}
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    };

    // Sync on mount
    setTheme(resolveTheme());

    // Observe changes to <html> attributes live
    const observer = new MutationObserver(() => {
      setTheme(resolveTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    // Listen for OS system theme changes
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      const html = document.documentElement;
      if (!html.getAttribute("data-theme") && !html.classList.contains("dark") && !html.classList.contains("light")) {
        setTheme(mql.matches ? "dark" : "light");
      }
    };
    mql.addEventListener("change", handleMediaChange);

    return () => {
      observer.disconnect();
      mql.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return theme;
}

export default useAppTheme;
