"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MockBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  showTooltip?: boolean;
}

export function MockBadge({ className, showTooltip = true, ...props }: MockBadgeProps) {
  return (
    <span
      className={cn(
        "group relative inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wider uppercase border border-dashed border-[var(--warn-border)] bg-[var(--warn-tint)] text-[var(--warn)] cursor-help select-none",
        className
      )}
      title={showTooltip ? "Simulated response with real government response shape" : undefined}
      {...props}
    >
      MOCK
      {showTooltip && (
        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden w-48 rounded-[var(--radius-sm)] bg-[#1B2321] px-2 py-1 text-center font-sans text-[11px] font-normal normal-case tracking-normal text-white shadow-md group-hover:block z-50">
          Simulated response with real response shape.
        </span>
      )}
    </span>
  );
}
