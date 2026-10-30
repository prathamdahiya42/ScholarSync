"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import { MockBadge } from "@/components/shared/mock-badge";
import { cn } from "@/lib/utils";

export interface PreflightItem {
  id: string;
  name: string;
  status: "pass" | "warn" | "fail";
  isMocked?: boolean;
  message: string;
  fixAction?: string;
}

interface PreflightChecklistProps {
  items: PreflightItem[];
  warningsAcknowledged: boolean;
  onAcknowledgeChange: (checked: boolean) => void;
  className?: string;
}

export function PreflightChecklist({
  items,
  warningsAcknowledged,
  onAcknowledgeChange,
  className,
}: PreflightChecklistProps) {
  const hasWarnings = items.some((item) => item.status === "warn");
  const hasFailures = items.some((item) => item.status === "fail");

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-white divide-y divide-[var(--border)] overflow-hidden shadow-[var(--shadow-sm)]">
        {items.map((item) => {
          const isPass = item.status === "pass";
          const isWarn = item.status === "warn";
          const isFail = item.status === "fail";

          return (
            <div
              key={item.id}
              className={cn(
                "p-3.5 md:p-4 flex items-start gap-3 transition-colors",
                isWarn && "bg-[var(--warn-tint)]/20",
                isFail && "bg-[var(--danger-tint)]/20"
              )}
            >
              <div className="mt-0.5 shrink-0">
                {isPass && <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />}
                {isWarn && <AlertTriangle className="w-5 h-5 text-[var(--warn)]" />}
                {isFail && <XCircle className="w-5 h-5 text-[var(--danger)]" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[var(--foreground)]">
                    {item.name}
                  </span>
                  {item.isMocked && <MockBadge />}
                </div>

                <p className="font-small text-[var(--muted-foreground)] mt-0.5">
                  {item.message}
                </p>

                {item.fixAction && (
                  <div className="mt-1 flex items-center gap-1 text-xs font-medium text-[var(--primary)]">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Resolution: {item.fixAction}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasWarnings && !hasFailures && (
        <div className="rounded-[var(--radius-sm)] border border-[var(--warn-border)] bg-[var(--warn-tint)] p-3 flex items-start gap-2.5">
          <input
            type="checkbox"
            id="acknowledge-warnings"
            checked={warningsAcknowledged}
            onChange={(e) => onAcknowledgeChange(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-[var(--warn-border)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
          />
          <label
            htmlFor="acknowledge-warnings"
            className="text-xs text-[var(--warn)] font-medium select-none cursor-pointer leading-relaxed"
          >
            I understand that the warnings above may delay verification by the officer. I confirm the details provided are correct and wish to proceed with submission.
          </label>
        </div>
      )}

      {hasFailures && (
        <div className="rounded-[var(--radius-sm)] border border-[var(--danger)]/30 bg-[var(--danger-tint)] p-3 text-xs text-[var(--danger)] font-medium">
          Critical documents or eligibility constraints are blocking submission. Please rectify the failed checks above to unlock application submission.
        </div>
      )}
    </div>
  );
}
