import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none",
  {
    variants: {
      variant: {
        verified: "bg-[var(--success-tint)] text-[var(--success)]",
        review: "bg-[var(--warn-tint)] text-[var(--warn)]",
        returned: "bg-[var(--warn-tint)] text-[var(--warn)]",
        rejected: "bg-[var(--danger-tint)] text-[var(--danger)]",
        draft: "bg-[var(--sunken)] text-[var(--muted-foreground)]",
        selected: "bg-[var(--primary-tint)] text-[var(--primary)]",
        outline: "border border-[var(--border-strong)] text-[var(--foreground)]",
        ai: "bg-[var(--ai-tint)] border border-dashed border-[var(--ai-border)] text-[var(--ai)] font-mono-id text-[11px]",
      },
    },
    defaultVariants: {
      variant: "draft",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
