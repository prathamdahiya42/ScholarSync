"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  currentLang?: "en" | "hi";
  onLanguageChange?: (lang: "en" | "hi") => void;
  className?: string;
}

export function LanguageToggle({
  currentLang = "en",
  onLanguageChange,
  className,
}: LanguageToggleProps) {
  const [lang, setLang] = React.useState<"en" | "hi">(currentLang);

  const handleSelect = (selected: "en" | "hi") => {
    setLang(selected);
    onLanguageChange?.(selected);
    if (typeof document !== "undefined") {
      document.documentElement.lang = selected;
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-red-200 dark:border-red-900/60 bg-white/95 dark:bg-[#160F14]/95 p-0.5 text-xs font-space font-medium shadow-xs select-none",
        className
      )}
      role="radiogroup"
      aria-label="Language selector"
    >
      <button
        type="button"
        role="radio"
        aria-checked={lang === "hi"}
        onClick={() => handleSelect("hi")}
        className={cn(
          "rounded-[4px] px-2.5 py-1 transition-colors cursor-pointer",
          lang === "hi"
            ? "bg-[var(--primary)] text-white shadow-xs font-semibold"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        )}
      >
        हिन्दी
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={lang === "en"}
        onClick={() => handleSelect("en")}
        className={cn(
          "rounded-[4px] px-2.5 py-1 transition-colors cursor-pointer",
          lang === "en"
            ? "bg-[var(--primary)] text-white shadow-xs font-semibold"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        )}
      >
        English
      </button>
    </div>
  );
}
