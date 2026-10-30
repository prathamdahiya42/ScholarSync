"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved === "dark" || (!saved && prefersDark) ? "dark" : "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <div className="h-8 px-2.5 rounded-full border border-red-200 dark:border-red-900/60 bg-white dark:bg-[#160F14] flex items-center gap-1.5 text-xs text-stone-500">
        <Sun className="h-3.5 w-3.5 text-amber-500" />
        <span className="font-mono text-[11px] font-semibold">Day</span>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="h-8 px-3 rounded-full border border-red-200 dark:border-red-900/60 bg-white/95 dark:bg-[#160F14]/95 text-stone-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-950/40 shadow-xs hover:border-red-300 dark:hover:border-red-700 transition-all flex items-center gap-1.5 cursor-pointer font-sans"
      aria-label={theme === "light" ? "Switch to Night mode" : "Switch to Day mode"}
      title={theme === "light" ? "Switch to Night mode" : "Switch to Day mode"}
    >
      {theme === "light" ? (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          <span className="font-space font-semibold text-[11px] text-stone-700 tracking-tight">Day</span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-red-400 fill-red-400" />
          <span className="font-space font-semibold text-[11px] text-red-200 tracking-tight">Night</span>
        </>
      )}
    </Button>
  );
}
