"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShinyBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  variant?: "red" | "teal" | "indigo" | "amber" | "terracotta";
}

export function ShinyBadge({
  children,
  icon,
  className = "",
  variant = "red",
  ...props
}: ShinyBadgeProps) {
  const variantStyles = {
    red: "bg-red-50/95 dark:bg-red-950/70 text-red-700 dark:text-red-200 border-red-200 dark:border-red-800/80 shadow-xs",
    teal: "bg-[#E3EFEE]/90 text-[#0F4C4A] border-[#C5DDD9] shadow-xs",
    indigo: "bg-[#ECECF8]/90 text-[#4B4FA3] border-[#CFCFEA] shadow-xs",
    amber: "bg-[#FBF0DA]/90 text-[#9A5B00] border-[#EAD5AA] shadow-xs",
    terracotta: "bg-[#FDF4F2]/90 text-[#A63A2B] border-[#F2C2BA] shadow-xs",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold overflow-hidden group select-none font-space tracking-tight",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {/* Moving Shimmer Beam */}
      <span
        className="pointer-events-none absolute -inset-y-full -left-full w-full bg-gradient-to-r from-transparent via-white/50 dark:via-red-400/20 to-transparent group-hover:translate-x-[250%] transition-transform duration-1000 ease-in-out"
        style={{ transform: "skewX(-20deg)" }}
      />
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </div>
  );
}
