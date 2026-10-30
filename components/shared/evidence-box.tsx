"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface EvidenceBoxProps {
  id: string;
  fieldId: string;
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  isHovered?: boolean;
  onHover?: (fieldId: string | null) => void;
  onClick?: (fieldId: string) => void;
}

export function EvidenceBox({
  id,
  fieldId,
  label,
  x,
  y,
  width,
  height,
  isHovered,
  onHover,
  onClick,
}: EvidenceBoxProps) {
  return (
    <div
      id={`evidence-box-${fieldId}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
      }}
      className={cn(
        "absolute border-2 border-[var(--ai)] bg-[rgba(75,79,163,0.08)] transition-all duration-300 cursor-pointer group",
        isHovered &&
          "bg-[rgba(75,79,163,0.22)] ring-2 ring-[var(--ai)] ring-offset-1 scale-[1.01]"
      )}
      onMouseEnter={() => onHover?.(fieldId)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(fieldId)}
    >
      <span
        className={cn(
          "absolute -top-5 left-0 px-1 py-0.2 rounded text-[10px] font-mono font-medium bg-[var(--ai)] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10",
          isHovered && "opacity-100"
        )}
      >
        {label}
      </span>
    </div>
  );
}
