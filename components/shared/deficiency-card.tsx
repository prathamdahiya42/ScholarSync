"use client";

import * as React from "react";
import { AlertTriangle, Upload, Volume2, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DeficiencyCardProps {
  id: string;
  title: string; // What is wrong (h3)
  reason: string; // Why (body)
  fixInstruction: string;
  samplePhotoUrl?: string;
  daysRemaining: number;
  onUpload?: (file: File) => void;
  onReadAloud?: () => void;
  className?: string;
}

export function DeficiencyCard({
  id,
  title,
  reason,
  fixInstruction,
  samplePhotoUrl,
  daysRemaining,
  onUpload,
  onReadAloud,
  className,
}: DeficiencyCardProps) {
  const [uploaded, setUploaded] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploaded(true);
      onUpload?.(e.target.files[0]);
    }
  };

  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `${title}. ${reason}. ${fixInstruction}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "hi-IN";
      window.speechSynthesis.speak(utterance);
    }
    onReadAloud?.();
  };

  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--border)] border-l-[3px] border-l-[var(--warn)] bg-white p-4 md:p-5 shadow-[var(--shadow-sm)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--warn-tint)] text-[var(--warn)]">
            <AlertTriangle className="w-3.5 h-3.5" />
          </span>
          <h3 className="font-h3 text-[var(--foreground)]">{title}</h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSpeak}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-white text-[var(--foreground)] hover:bg-[var(--sunken)] transition-colors"
            title="Read instructions aloud"
            aria-label="Read instructions aloud"
          >
            <Volume2 className="w-4 h-4 text-[var(--muted-foreground)]" />
          </button>

          <span className="inline-flex items-center gap-1 rounded-[var(--radius-full)] bg-[var(--warn-tint)] border border-[var(--warn-border)] px-2 py-0.5 text-xs font-medium text-[var(--warn)] tabular-nums">
            <Clock className="w-3 h-3" />
            <span>{daysRemaining} days left to fix</span>
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <p className="font-body text-[var(--muted-foreground)]">{reason}</p>
        <div className="rounded-[var(--radius-sm)] bg-[var(--sunken)] p-3 border border-[var(--border)] text-sm">
          <span className="font-medium text-[var(--foreground)] block mb-0.5">
            How to resolve:
          </span>
          <span className="text-[var(--foreground)]">{fixInstruction}</span>
        </div>
      </div>

      {samplePhotoUrl && (
        <div className="mb-4">
          <span className="font-small text-[var(--muted-foreground)] block mb-1">
            Example of acceptable document format:
          </span>
          <div className="relative h-28 w-44 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[#F0EDE6] overflow-hidden flex items-center justify-center text-xs text-[var(--muted-foreground)]">
            [Sample Document Preview]
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
        />

        {uploaded ? (
          <div className="flex items-center gap-2 text-sm text-[var(--success)] font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Replacement uploaded successfully. Ready for verification.</span>
          </div>
        ) : (
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto min-h-[48px]"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Corrected Document
          </Button>
        )}
      </div>
    </div>
  );
}
