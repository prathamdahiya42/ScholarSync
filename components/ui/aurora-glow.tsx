"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AuroraGlowProps {
  className?: string;
  children?: React.ReactNode;
}

export function AuroraGlow({ className = "", children }: AuroraGlowProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background Animated Aurora Blobs with Crimson Red & Rose Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-70">
        <div
          className="absolute -top-[20%] left-[10%] h-[480px] w-[520px] rounded-full blur-[110px] animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(220, 38, 38, 0.18) 0%, rgba(254, 226, 226, 0.04) 70%)",
            animationDuration: "8s",
          }}
        />
        <div
          className="absolute top-[10%] right-[15%] h-[420px] w-[460px] rounded-full blur-[95px] animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(244, 63, 94, 0.15) 0%, rgba(255, 241, 242, 0.04) 70%)",
            animationDuration: "12s",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute top-[35%] left-[30%] h-[360px] w-[420px] rounded-full blur-[85px] animate-pulse"
          style={{
            background: "radial-gradient(circle, rgba(185, 28, 28, 0.14) 0%, rgba(254, 202, 202, 0.04) 70%)",
            animationDuration: "10s",
            animationDelay: "4s",
          }}
        />
      </div>
      {children}
    </div>
  );
}
