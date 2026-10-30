import * as React from "react";
import { UserCheck, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface HumanGateTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  officerInitials?: string;
  decidedAt?: string;
  stageName?: string;
}

export function HumanGateTag({
  className,
  officerInitials,
  decidedAt,
  stageName = "Human decision",
  ...props
}: HumanGateTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--primary)] bg-white px-2 py-0.5 text-[12px] font-medium text-[var(--primary)] select-none",
        className
      )}
      {...props}
    >
      {officerInitials ? (
        <>
          <UserCheck className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
          <span>
            {stageName}: <span className="font-semibold">{officerInitials}</span>
            {decidedAt && ` · ${decidedAt}`}
          </span>
        </>
      ) : (
        <>
          <Shield className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
          <span>{stageName}</span>
        </>
      )}
    </span>
  );
}
