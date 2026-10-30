"use client";

import * as React from "react";
import {
  TrendingUp,
  AlertTriangle,
  FileText,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  CreditCard,
  Building,
  CheckCircle,
} from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SOURCED_CAG_METRICS } from "@/lib/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminDashboardProps {
  lang?: "en" | "hi";
}

// Recharts data conforming to UI.md Section 10.6 & 4-color palette
const INSTITUTE_PENDENCY_DATA = [
  { institute: "DAVV Indore", pending: 42, color: "#0F4C4A" },
  { institute: "Ranchi Univ", pending: 78, color: "#9A5B00" }, // Exceeded SLA
  { institute: "NIT Rourkela", pending: 18, color: "#0F4C4A" },
  { institute: "Tripura Univ", pending: 65, color: "#9A5B00" },
  { institute: "Manipur Univ", pending: 89, color: "#A63A2B" },
];

const DEFICIENCY_REASONS_DATA = [
  { reason: "Income Cert Expired (Old FY)", count: 342, percentage: 41 },
  { reason: "Bank Lacks Aadhaar DBT Seeding", count: 268, percentage: 32 },
  { reason: "Name Token Mismatch", count: 145, percentage: 17 },
  { reason: "Institute Code Not Recognized", count: 82, percentage: 10 },
];

export function AdminDashboard({ lang = "en" }: AdminDashboardProps) {
  const [seedingDoctorModal, setSeedingDoctorModal] = React.useState<boolean>(false);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--primary)] bg-[var(--primary-tint)] px-2 py-0.5 rounded font-semibold">
              Ministry Performance & Transparency Console
            </span>
            <span className="font-mono text-[11px] uppercase rounded border border-dashed border-[var(--warn-border)] bg-[var(--warn-tint)] px-1.5 py-0.2 text-[var(--warn)] font-semibold">
              Simulated Data
            </span>
          </div>
          <h2 className="font-h2 text-[var(--foreground)] mt-1">
            Executive Scheme Performance & Equity Oversight
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSeedingDoctorModal(true)}
            className="text-xs"
          >
            <CreditCard className="w-3.5 h-3.5 mr-1 text-[var(--primary)]" />
            Launch Seeding Doctor
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => toast.success("CAG Audit Dossier Generated", { description: "Exported summary with tamper-evident hash trail." })}
            className="text-xs"
          >
            <FileText className="w-3.5 h-3.5 mr-1" />
            Export Audit Dossier
          </Button>
        </div>
      </div>

      {/* Row of 5 StatCards in FIXED order matching Problem Statement (UI.md Section 10.6) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* 1. Speed */}
        <StatCard
          label="Speed"
          value="4.2 days"
          delta="-68% vs paper"
          deltaType="positive"
          definition="Median days from candidate submission to institute/ministry verification sign-off."
        />

        {/* 2. Transparency */}
        <StatCard
          label="Transparency"
          value="99.4%"
          delta="+42% visibility"
          deltaType="positive"
          definition="Share of applicants who can see their exact holding stage and plain-language reason for return."
        />

        {/* 3. Accuracy */}
        <StatCard
          label="Accuracy"
          value="91.2%"
          delta="1st-pass rate"
          deltaType="positive"
          definition="Share of files approved without returning for deficiency, powered by Pre-flight checks."
        />

        {/* 4. Accountability */}
        <StatCard
          label="Accountability"
          value="100%"
          delta="Cryptographic"
          deltaType="neutral"
          definition="Every decision logged with officer ID, timestamp, signals displayed, and SHA-256 hash."
        />

        {/* 5. Accessibility */}
        <StatCard
          label="Accessibility"
          value="68%"
          delta="Vernacular/Assisted"
          deltaType="positive"
          definition="Share of applications completed in regional language (Hindi/Adi Vaani) or assisted CSC mode."
        />
      </div>

      {/* Sourced Real-World Problem Metrics Banner (Section 14 of UI.md) */}
      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[#FAF8F5] p-4">
        <div className="flex items-center justify-between mb-3 border-b border-[var(--border)] pb-2">
          <span className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wide">
            Field Ground Truth: Documented Audit Bottlenecks Addressed
          </span>
          <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
            Source: Official CAG & State Welfare Notices
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SOURCED_CAG_METRICS.map((metric, i) => (
            <div key={i} className="p-3 bg-white rounded-[var(--radius-sm)] border border-[var(--border)] space-y-1">
              <div className="font-display text-2xl text-[var(--danger)] tabular-nums">
                {metric.figure}
              </div>
              <h5 className="font-semibold text-xs text-[var(--foreground)]">{metric.label}</h5>
              <p className="font-small text-[11px] text-[var(--muted-foreground)] leading-snug">
                {metric.detail}
              </p>
              <span className="text-[10px] font-mono text-[var(--primary)] block pt-1">
                Ref: {metric.source}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CHART 1: Operations */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-h3 text-sm text-[var(--foreground)]">
                Which institutes need a nudge this week?
              </h4>
              <p className="text-xs text-[var(--muted-foreground)]">
                Pendency by institute vs 7-day statutory verification SLA
              </p>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Opening Institute Verification Files...")}
              className="text-xs text-[var(--primary)] hover:underline flex items-center gap-0.5"
            >
              <span>View files</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={INSTITUTE_PENDENCY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2DED5" />
                <XAxis dataKey="institute" tick={{ fontSize: 11, fill: "#5B6663" }} />
                <YAxis tick={{ fontSize: 11, fill: "#5B6663" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E2DED5",
                    fontSize: 12,
                    borderRadius: 6,
                  }}
                />
                <Bar dataKey="pending" radius={[4, 4, 0, 0]}>
                  {INSTITUTE_PENDENCY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* CHART 2: Quality & Deficiency Analysis */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-h3 text-sm text-[var(--foreground)]">
                What causes student application delays?
              </h4>
              <p className="text-xs text-[var(--muted-foreground)]">
                Ranked deficiency reasons caught before submission & at officer review
              </p>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Viewing Deficiency Resolution Cards...")}
              className="text-xs text-[var(--primary)] hover:underline flex items-center gap-0.5"
            >
              <span>View files</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {DEFICIENCY_REASONS_DATA.map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[var(--foreground)]">{d.reason}</span>
                  <span className="font-mono text-[var(--muted-foreground)]">
                    {d.count} ({d.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--sunken)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--warn)] rounded-full"
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
            Pre-flight checks and Deficiency Copilot cards resolve 84% of these without manual officer calls.
          </div>
        </Card>
      </div>

      {/* SEEDING DOCTOR MODAL */}
      {seedingDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-md)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[var(--primary)]" />
                <h3 className="font-h3 text-base text-[var(--foreground)]">
                  Aadhaar Seeding Doctor
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSeedingDoctorModal(false)}
              >
                Close
              </Button>
            </div>

            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Arunachal Pradesh documented 7,164 ST scholars unpaid due to bank seeding errors. The Seeding Doctor diagnoses the exact NPCI bank code and generates a printable resolution slip for the student:
            </p>

            <div className="rounded-[var(--radius-sm)] border border-[var(--warn-border)] bg-[var(--warn-tint)]/40 p-3.5 space-y-2 text-xs">
              <span className="font-semibold text-[var(--warn)] block">
                Detected Error: Code 01 (UID NEVER SEEDED FOR DBT)
              </span>
              <p className="text-[var(--foreground)]">
                The account number is KYC-verified, but the bank branch has not submitted the DBT Mandate to the National Payments Corporation of India (NPCI) mapper.
              </p>
            </div>

            <div className="rounded-[var(--radius-sm)] bg-[var(--sunken)] p-3 border border-[var(--border)] space-y-1.5 text-xs">
              <span className="font-semibold text-[var(--foreground)] block">
                Generated Branch Slip for Candidate:
              </span>
              <p className="font-serif italic text-[var(--foreground)] bg-white p-2.5 rounded border border-[var(--border)]">
                &ldquo;To The Branch Manager, SBI Indore: Please enable Aadhaar Seeding on Savings A/c No. 33190821455 under NPCI Mapper for DBT Central Scholarship Disbursement under Aadhaar Act Section 7.&rdquo;
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  toast.success("Seeding Slip Downloaded", { description: "Slip generated for Ramesh Kumar Gond." });
                  setSeedingDoctorModal(false);
                }}
              >
                Print Candidate Seeding Slip
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
