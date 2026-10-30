import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98] select-none cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-sm",
        secondary:
          "bg-white dark:bg-[#160F14] border border-[var(--border-strong)] text-[var(--foreground)] hover:bg-[var(--sunken)]",
        ghost:
          "bg-transparent text-[var(--foreground)] hover:bg-[var(--sunken)]",
        return:
          "bg-white dark:bg-[#160F14] border border-[var(--warn-border)] text-[var(--warn)] hover:bg-[var(--warn-tint)]",
        reject:
          "bg-white dark:bg-[#160F14] border border-[rgba(239,68,68,0.4)] text-[var(--danger)] hover:bg-[var(--danger-tint)]",
        ai:
          "bg-[var(--ai-tint)] border border-dashed border-[var(--ai-border)] text-[var(--ai)] hover:opacity-90 font-mono-id text-xs",
        link:
          "text-[var(--primary)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-4 text-[14px]",
        lg: "h-12 px-6 text-[15px] min-h-[48px]", // Min touch target 48px for mobile
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
