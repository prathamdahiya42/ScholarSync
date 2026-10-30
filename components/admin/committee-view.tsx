"use client";

import * as React from "react";
import {
  Award,
  CheckCircle2,
  Users,
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HumanGateTag } from "@/components/shared/human-gate-tag";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CommitteeViewProps {
  lang?: "en" | "hi";
}

const RANKED_CANDIDATES = [
  {
    rank: 1,
    appId: "NFS-26-JH-44102",
    name: "Sunita Santhal",
    tribe: "Santhal",
    state: "Jharkhand",
    institute: "Ranchi University",
    score: 96.4,
    scoreComponents: { pgMarks: 94.0, researchProposal: 98.0, nationalExam: 97.2 },
    slotCategory: "General ST",
    status: "SELECTED",
    tieBreak: "Older candidate in age priority rule",
  },
  {
    rank: 2,
    appId: "NFS-26-MP-88391",
    name: "Ramesh Kumar Gond",
    tribe: "Gond",
    state: "Madhya Pradesh",
    institute: "Devi Ahilya Vishwavidyalaya",
    score: 93.8,
    scoreComponents: { pgMarks: 91.5, researchProposal: 95.0, nationalExam: 95.0 },
    slotCategory: "PVTG / Special ST",
    status: "PROVISIONALLY SELECTED",
    tieBreak: "PG percentile higher",
  },
  {
    rank: 3,
    appId: "NFS-26-OD-77215",
    name: "Arjun Bhil",
    tribe: "Bhil",
    state: "Odisha",
    institute: "NIT Rourkela",
    score: 91.2,
    scoreComponents: { pgMarks: 89.0, researchProposal: 93.0, nationalExam: 91.6 },
    slotCategory: "Divyangjan (Differently-Abled)",
    status: "SELECTED (RESERVED SLOT)",
    tieBreak: "UDID priority rule applied",
  },
  {
    rank: 4,
    appId: "NFS-26-TR-12903",
    name: "Debbarma Joy",
    tribe: "Tripuri",
    state: "Tripura",
    institute: "Tripura University",
    score: 87.5,
    scoreComponents: { pgMarks: 86.0, researchProposal: 88.0, nationalExam: 88.5 },
    slotCategory: "Waitlist 1",
    status: "WAITLISTED",
    tieBreak: "Auto-promotes if selected declines",
  },
];

export function CommitteeView({ lang = "en" }: CommitteeViewProps) {
  const [expandedRank, setExpandedRank] = React.useState<number | null>(null);
  const [signOffModalOpen, setSignOffModalOpen] = React.useState<boolean>(false);
  const [isSignedOff, setIsSignedOff] = React.useState<boolean>(false);

  const handleSignOff = () => {
    setIsSignedOff(true);
    setSignOffModalOpen(false);
    toast.success("Merit List Signed Off", {
      description: "750 National ST Fellowship slots published with cryptographic signature.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <span className="font-mono text-xs uppercase text-[var(--primary)] bg-[var(--primary-tint)] px-2 py-0.5 rounded font-semibold">
            Human Gate 2: Selection & Sanction
          </span>
          <h2 className="font-h2 text-[var(--foreground)] mt-1">
            National Selection Committee Allotment
          </h2>
          <p className="font-small text-xs text-[var(--muted-foreground)]">
            A.Y. 2026-27 Merit Allocation for 750 Fellowship Slots
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSignedOff ? (
            <span className="inline-flex items-center gap-1.5 rounded bg-[var(--success-tint)] border border-[var(--success)]/30 text-[var(--success)] px-3 py-1.5 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Signed & Published
            </span>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => setSignOffModalOpen(true)}
            >
              <Award className="w-4 h-4 mr-1.5" />
              Committee Sign-Off & Publish
            </Button>
          )}
        </div>
      </div>

      {/* Equity Preview Strip (Section 10.5 of UI.md) */}
      <Card className="p-4 bg-white border border-[var(--border)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wide">
            Equity Preview Strip
          </span>
          <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
            Preview before final publishing
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Gender */}
          <div className="space-y-1">
            <div className="flex justify-between text-[var(--muted-foreground)]">
              <span>Female Representation</span>
              <span className="font-mono font-semibold text-[var(--foreground)]">44% (Target: 33%)</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--sunken)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--primary)] w-[44%]" />
            </div>
          </div>

          {/* PVTG */}
          <div className="space-y-1">
            <div className="flex justify-between text-[var(--muted-foreground)]">
              <span>PVTG Allocation</span>
              <span className="font-mono font-semibold text-[var(--foreground)]">12% (Target: 10%)</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--sunken)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--primary)] w-[12%]" />
            </div>
          </div>

          {/* Divyangjan */}
          <div className="space-y-1">
            <div className="flex justify-between text-[var(--muted-foreground)]">
              <span>Divyangjan Allotment</span>
              <span className="font-mono font-semibold text-[var(--foreground)]">5% (Statutory: 5%)</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--sunken)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--primary)] w-[5%]" />
            </div>
          </div>

          {/* Scheduled Area */}
          <div className="space-y-1">
            <div className="flex justify-between text-[var(--muted-foreground)]">
              <span>Scheduled Districts</span>
              <span className="font-mono font-semibold text-[var(--foreground)]">38% Covered</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--sunken)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--primary)] w-[38%]" />
            </div>
          </div>
        </div>
      </Card>

      {/* Ranked Table */}
      <Card className="p-0 overflow-hidden border border-[var(--border)] shadow-[var(--shadow-sm)]">
        <div className="p-3 bg-[var(--sunken)] border-b border-[var(--border)] flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--foreground)]">
            Merit Rank Order (750 Central Sector Seats)
          </span>
          <span className="text-xs font-mono text-[var(--muted-foreground)]">
            Scored by Deterministic Scheme Merit Formula
          </span>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {RANKED_CANDIDATES.map((cand) => {
            const isExpanded = expandedRank === cand.rank;
            const isWaitlist = cand.status === "WAITLISTED";

            return (
              <div key={cand.rank} className={cn("p-3.5 transition-colors", isWaitlist && "bg-[#FAF8F5]")}>
                <div className="flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary-tint)] font-mono font-bold text-xs text-[var(--primary)] tabular-nums">
                      #{cand.rank}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[var(--foreground)]">
                          {cand.name}
                        </span>
                        <span className="font-mono text-xs text-[var(--muted-foreground)]">
                          ({cand.appId})
                        </span>
                      </div>
                      <p className="text-[var(--muted-foreground)] text-xs">
                        {cand.tribe} · {cand.state} · {cand.institute}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-[var(--foreground)] tabular-nums">
                        {cand.score} pts
                      </span>
                      <span className="block text-[10px] font-semibold text-[var(--primary)]">
                        {cand.slotCategory}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedRank(isExpanded ? null : cand.rank)}
                      className="p-1 rounded hover:bg-[var(--sunken)] text-[var(--muted-foreground)] cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Score Components */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[var(--border)] text-xs space-y-2 animate-in fade-in-0 duration-150">
                    <div className="grid grid-cols-3 gap-2 bg-[var(--sunken)] p-2.5 rounded">
                      <div>
                        <span className="text-[var(--muted-foreground)] block">PG Qualifying Score:</span>
                        <span className="font-mono font-semibold">{cand.scoreComponents.pgMarks}%</span>
                      </div>
                      <div>
                        <span className="text-[var(--muted-foreground)] block">Research Plan:</span>
                        <span className="font-mono font-semibold">{cand.scoreComponents.researchProposal} pts</span>
                      </div>
                      <div>
                        <span className="text-[var(--muted-foreground)] block">National Exam:</span>
                        <span className="font-mono font-semibold">{cand.scoreComponents.nationalExam}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-foreground)]">
                      <span className="font-semibold text-[var(--foreground)]">Tie-Break Rule:</span>
                      <span>{cand.tieBreak}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Confirmation Sign-off Modal */}
      {signOffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-md)] space-y-4">
            <h3 className="font-h3 text-base text-[var(--foreground)]">
              Confirm Official Committee Sign-Off
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              You are about to sign off on the 750 candidate allotment for Academic Year 2026-27. Upon publication:
            </p>
            <ul className="text-xs text-[var(--foreground)] space-y-1.5 list-disc pl-4">
              <li>Candidate list is published publicly with masked IDs (no raw PII).</li>
              <li>Aadhaar DBT payment batches are automatically staged for PFMS dispatch.</li>
              <li>SMS/WhatsApp notifications dispatched to all selected and waitlisted scholars.</li>
            </ul>

            <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSignOffModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSignOff}
              >
                Sign & Transmit to PFMS
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
