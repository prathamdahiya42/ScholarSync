"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AIFlagChipProps {
  label: string;
  confidence: number; // e.g. 82
  ruleId: string;
  explanation: string;
  evidenceSnippet?: string;
  className?: string;
}

export function AIFlagChip({
  label,
  confidence,
  ruleId,
  explanation,
  evidenceSnippet,
  className,
}: AIFlagChipProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-dashed border-[var(--ai-border)] bg-[var(--ai-tint)] px-2 py-0.5 text-[12px] font-medium text-[var(--ai)] hover:opacity-90 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ai)]",
            className
          )}
        >
          <span className="font-semibold text-[11px] uppercase tracking-wide">AI</span>
          <span className="text-[var(--ai-border)]">·</span>
          <span>{label}</span>
          <span className="text-[var(--ai-border)]">·</span>
          <span className="tabular-nums font-mono text-[11px]">{confidence}%</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-80 rounded-[var(--radius-md)] border border-[var(--ai-border)] bg-white p-3.5 shadow-[var(--shadow-md)] text-[var(--foreground)] outline-none animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          sideOffset={5}
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[var(--ai-tint)] text-[var(--ai)] border border-dashed border-[var(--ai-border)]">
                AI SIGNAL
              </span>
              <span className="font-mono text-xs text-[var(--muted-foreground)]">
                {ruleId}
              </span>
            </div>
            <span className="text-xs font-medium text-[var(--ai)] tabular-nums">
              Confidence: {confidence}%
            </span>
          </div>

          <p className="font-small text-[var(--foreground)] mb-2.5">
            {explanation}
          </p>

          {evidenceSnippet && (
            <div className="rounded-[var(--radius-sm)] bg-[var(--sunken)] p-2 font-mono text-xs text-[var(--foreground)] border border-[var(--border)] mb-2">
              <span className="text-[10px] text-[var(--muted-foreground)] uppercase block mb-1">
                Extracted snippet
              </span>
              {evidenceSnippet}
            </div>
          )}

          <div className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)] pt-1 border-t border-[var(--border)]">
            <Info className="w-3.5 h-3.5 text-[var(--ai)] shrink-0" />
            <span>Advisory only. Officer verifies and makes final decision.</span>
          </div>

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
