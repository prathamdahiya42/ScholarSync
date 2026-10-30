"use client";

import * as React from "react";
import { Check, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineStep {
  id: string;
  title: string;
  status: "completed" | "current" | "upcoming";
  completedAt?: string;
  description?: string;
  expectedWait?: string;
  hasDeficiency?: boolean;
  deficiencyDeadline?: string;
}

interface StatusTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function StatusTimeline({ steps, className }: StatusTimelineProps) {
  return (
    <div className={cn("relative pl-6 space-y-7 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--border)]", className)}>
      {steps.map((step, idx) => {
        const isCompleted = step.status === "completed";
        const isCurrent = step.status === "current";

        return (
          <div key={step.id} className="relative flex items-start group">
            {/* Dot marker */}
            <div
              className={cn(
                "absolute -left-6 top-1 flex h-6 w-6 items-center justify-center rounded-full transition-colors z-10",
                isCompleted && "bg-[var(--primary)] text-white shadow-sm",
                isCurrent &&
                  !step.hasDeficiency &&
                  "border-2 border-[var(--primary)] bg-white text-[var(--primary)]",
                isCurrent &&
                  step.hasDeficiency &&
                  "border-2 border-[var(--warn)] bg-[var(--warn-tint)] text-[var(--warn)]",
                !isCompleted &&
                  !isCurrent &&
                  "border-2 border-[var(--border-strong)] bg-[var(--sunken)] text-transparent"
              )}
            >
              {isCompleted && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              {isCurrent && !step.hasDeficiency && (
                <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
              )}
              {isCurrent && step.hasDeficiency && (
                <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </div>

            {/* Step content */}
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h4
                  className={cn(
                    "text-sm font-semibold",
                    isCurrent ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
                  )}
                >
                  {step.title}
                </h4>
                {step.completedAt && (
                  <span className="font-mono text-xs text-[var(--muted-foreground)] tabular-nums">
                    {step.completedAt}
                  </span>
                )}
              </div>

              {step.description && (
                <p className="font-small text-[var(--muted-foreground)] mt-0.5">
                  {step.description}
                </p>
              )}

              {isCurrent && step.expectedWait && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--primary)] font-medium bg-[var(--primary-tint)] px-2 py-0.5 rounded-[var(--radius-sm)] w-fit">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Expected time: {step.expectedWait}</span>
                </div>
              )}

              {isCurrent && step.hasDeficiency && step.deficiencyDeadline && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--warn)] font-medium bg-[var(--warn-tint)] border border-[var(--warn-border)] px-2.5 py-1 rounded-[var(--radius-sm)] w-fit">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Action required: Respond within {step.deficiencyDeadline}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
