"use client";

import * as React from "react";
import { RotateCcw, User, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type DemoRole = "student" | "officer" | "committee" | "admin";

interface DemoToolbarProps {
  currentRole: DemoRole;
  onRoleChange: (role: DemoRole) => void;
  onResetDemo?: () => void;
  className?: string;
}

const ROLES: { id: DemoRole; label: string; persona: string }[] = [
  { id: "student", label: "Student", persona: "Ramesh Gond (PhD, MP)" },
  { id: "officer", label: "Institute Officer", persona: "Dr. S. Sharma (DAVV)" },
  { id: "committee", label: "Selection Committee", persona: "National ST Board" },
  { id: "admin", label: "Ministry Admin", persona: "MoTA Delhi" },
];

export function DemoToolbar({
  currentRole,
  onRoleChange,
  onResetDemo,
  className,
}: DemoToolbarProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const currentPersona = ROLES.find((r) => r.id === currentRole);

  const handleReset = () => {
    onResetDemo?.();
    toast.success("Demo State Reset", {
      description: "Sample applications, OCR flags, and decision logs have been restored.",
    });
  };

  return (
    <div
      className={cn(
        "fixed top-3 right-4 z-50 flex items-center gap-2 rounded-full border border-red-200 dark:border-red-900/60 bg-[var(--card)]/95 px-3 py-1.5 shadow-md backdrop-blur-xs select-none font-space",
        className
      )}
    >
      <div className="flex items-center gap-1.5 border-r border-red-100 dark:border-red-950 pr-2">
        <span className="rounded-full bg-red-50 dark:bg-red-950 px-2 py-0.5 font-code text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">
          Demo
        </span>
        <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Test Persona</span>
      </div>

      {/* Role Selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--foreground)] hover:text-red-600 dark:hover:text-red-400 transition-colors px-1.5 py-1 rounded cursor-pointer"
        >
          <User className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          <span>{currentPersona?.label}</span>
          <span className="text-[10px] text-stone-500 dark:text-stone-400">
            ({currentPersona?.persona.split(" ")[0]})
          </span>
          <ChevronDown className="w-3 h-3 text-stone-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl border border-red-200 dark:border-red-900/80 bg-[var(--card)] py-1.5 shadow-xl z-50 animate-in fade-in-0 duration-100">
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-red-600 dark:text-red-400 border-b border-red-100 dark:border-red-950 font-space tracking-wide">
              Switch Test Persona
            </div>
            {ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  onRoleChange(role.id);
                  setDropdownOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer",
                  currentRole === role.id && "bg-red-50 dark:bg-red-950/80 font-bold text-red-600 dark:text-red-400"
                )}
              >
                <div>
                  <div className="text-[var(--foreground)] font-space">{role.label}</div>
                  <div className="text-[10px] font-sans text-stone-500 dark:text-stone-400">{role.persona}</div>
                </div>
                {currentRole === role.id && <Check className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Demo Reset button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReset}
        className="h-7 px-2 text-xs text-stone-500 hover:text-red-600 dark:hover:text-red-400 font-space"
        title="Restore initial synthetic state"
      >
        <RotateCcw className="w-3 h-3 mr-1" />
        Reset
      </Button>
    </div>
  );
}
