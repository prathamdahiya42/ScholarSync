"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RiskComponent {
  factor: string;
  points: number;
}

export interface RiskMeterProps {
  score: number; // 0 to 100
  components?: RiskComponent[];
  className?: string;
  compact?: boolean;
}

export function RiskMeter({
  score,
  components = [],
  className,
  compact = false,
}: RiskMeterProps) {
  const [expanded, setExpanded] = React.useState(false);

  // Determine risk level: Low (<30), Medium (30-65), High (>65)
  const isLow = score < 30;
  const isMed = score >= 30 && score <= 65;
  const isHigh = score > 65;

  const barColor = isLow
    ? "bg-[var(--success)]"
    : isMed
    ? "bg-[var(--warn)]"
    : "bg-[var(--danger)]";

  const levelLabel = isLow ? "Low Risk" : isMed ? "Medium Risk" : "High Risk";
  const badgeTint = isLow
    ? "bg-[var(--success-tint)] text-[var(--success)]"
    : isMed
    ? "bg-[var(--warn-tint)] text-[var(--warn)]"
    : "bg-[var(--danger-tint)] text-[var(--danger)]";

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-[var(--foreground)]">AI Scrutiny Index</span>
          <span className={cn("px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider", badgeTint)}>
            {levelLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs font-semibold tabular-nums text-[var(--foreground)]">
            {score}/100
          </span>
          {components.length > 0 && !compact && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-0.5 ml-0.5 cursor-pointer"
              title="Show score breakdown"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Thin 4px horizontal bar */}
      <div className="h-1 w-full rounded-full bg-[var(--sunken)] overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", barColor)}
          style={{ width: `${Math.min(Math.max(score, 5), 100)}%` }}
        />
      </div>

      {/* Expandable score breakdown components */}
      {expanded && components.length > 0 && (
        <div className="mt-2 rounded-[var(--radius-sm)] bg-[var(--sunken)] p-2.5 space-y-1 text-xs border border-[var(--border)] animate-in fade-in-0 duration-150">
          <span className="text-[10px] uppercase font-semibold text-[var(--muted-foreground)] block mb-1">
            Risk Factor Breakdown
          </span>
          {components.map((c, i) => (
            <div key={i} className="flex items-center justify-between text-[var(--foreground)]">
              <span>{c.factor}</span>
              <span className="font-mono font-medium text-[var(--danger)] tabular-nums">
                +{c.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
