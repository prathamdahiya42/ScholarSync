"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string; // e.g. "+12% this cycle"
  deltaType?: "positive" | "negative" | "neutral";
  definition: string;
  freshness?: string; // e.g. "Updated 2 min ago"
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  deltaType = "neutral",
  definition,
  freshness = "Updated 2 min ago",
  className,
}: StatCardProps) {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <Card className={cn("p-4 md:p-5 flex flex-col justify-between", className)}>
      <div>
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-1">
          <span className="font-medium text-[var(--foreground)]">{label}</span>
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
              className="text-[var(--subtle)] hover:text-[var(--foreground)] transition-colors p-0.5 cursor-help"
              aria-label={`Definition for ${label}`}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
            {showTooltip && (
              <div className="absolute right-0 bottom-full mb-1.5 w-52 rounded-[var(--radius-sm)] bg-[#1B2321] text-white p-2 text-[11px] font-normal leading-snug shadow-md z-50">
                {definition}
              </div>
            )}
          </div>
        </div>

        <div className="font-display text-[32px] leading-[40px] text-[var(--foreground)] tabular-nums my-1">
          {value}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] mt-2">
        {delta && (
          <span
            className={cn(
              "text-[11px] font-medium rounded-full px-2 py-0.5 tabular-nums",
              deltaType === "positive" && "bg-[var(--success-tint)] text-[var(--success)]",
              deltaType === "negative" && "bg-[var(--danger-tint)] text-[var(--danger)]",
              deltaType === "neutral" && "bg-[var(--sunken)] text-[var(--muted-foreground)]"
            )}
          >
            {delta}
          </span>
        )}
        <span className="font-small text-[11px] text-[var(--muted-foreground)]">
          {freshness}
        </span>
      </div>
    </Card>
  );
}
