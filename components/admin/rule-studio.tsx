"use client";

import * as React from "react";
import {
  Sliders,
  Check,
  Code2,
  FileCode,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Plus,
  BookOpen,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ALL_MOTA_SCHEMES, TRIBAL_SCHEMES_DATA, MoTAScheme } from "@/lib/schemes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RuleStudioProps {
  lang?: "en" | "hi";
}

export function RuleStudio({ lang = "en" }: RuleStudioProps) {
  const [selectedSchemeId, setSelectedSchemeId] = React.useState<string>("NS-TOPCLASS-ST");
  const [activeTab, setActiveTab] = React.useState<"rules" | "deficiency_flags" | "json" | "diff">("rules");

  const currentScheme: MoTAScheme =
    ALL_MOTA_SCHEMES.find((s) => s.id === selectedSchemeId) || ALL_MOTA_SCHEMES[0];

  // What-If Simulator State: Income Ceiling Slider
  const baseCeiling = currentScheme.eligibility.income_ceiling_inr_per_year || 600000;
  const [simulatedCeiling, setSimulatedCeiling] = React.useState<number>(baseCeiling);

  // Update slider when scheme changes
  React.useEffect(() => {
    setSimulatedCeiling(currentScheme.eligibility.income_ceiling_inr_per_year || 600000);
  }, [selectedSchemeId]);

  // Maker-checker status: "draft" | "pending" | "live"
  const [publishStatus, setPublishStatus] = React.useState<"draft" | "pending" | "live">("live");

  // What-If Simulation Math:
  const baseCount = selectedSchemeId === "NFST" ? 750 : selectedSchemeId === "NOS-ST" ? 20 : 1240;
  const countDelta = currentScheme.eligibility.income_ceiling_inr_per_year
    ? Math.round(((simulatedCeiling - baseCeiling) / 100000) * 115)
    : 0;
  const projectedEligible = Math.max(20, baseCount + countDelta);
  const percentChange = baseCount > 0 ? Math.round(((projectedEligible - baseCount) / baseCount) * 100) : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSimulatedCeiling(Number(e.target.value));
  };

  const handlePublishRuleChange = () => {
    setPublishStatus("pending");
    toast.success("Rule Modification Drafted", {
      description: `Updated ${currentScheme.id} income threshold to ₹${simulatedCeiling.toLocaleString()}. Awaiting JS sign-off.`,
    });
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#FBF9F5] overflow-hidden">
      {/* Top Header & Scheme Switcher (All 4 MoTA Official Schemes from JSON) */}
      <div className="h-14 border-b border-[#E8E4DC] bg-white px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-[#1B2321]">
              Rule Studio & What-If Engine
            </span>
            <span className="text-[#8A938F]">|</span>
            <span className="text-xs font-mono text-[#0F4C4A] bg-[#E3EFEE] px-2 py-0.5 rounded font-semibold">
              4 MoTA Schemes Seeded
            </span>
          </div>

          {/* Scheme Switcher Tabs */}
          <div className="flex items-center gap-1.5 ml-2 overflow-x-auto">
            {ALL_MOTA_SCHEMES.map((scheme) => (
              <button
                key={scheme.id}
                type="button"
                onClick={() => setSelectedSchemeId(scheme.id)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap",
                  selectedSchemeId === scheme.id
                    ? "bg-[#0F4C4A] text-white font-semibold shadow-xs"
                    : "text-[#5B6663] hover:bg-[#EFECE5]"
                )}
              >
                <span>{scheme.id}</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">
                  ({scheme.type.includes("Central Sector") ? "Central" : "Sponsored"})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Maker-Checker Workflow Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#5B6663]">Workflow Status:</span>
          <span
            className={cn(
              "rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
              publishStatus === "live" && "bg-[#E4F1E7] text-[#2F6B3F]",
              publishStatus === "pending" && "bg-[#FBF0DA] text-[#9A5B00]",
              publishStatus === "draft" && "bg-[#EFECE5] text-[#5B6663]"
            )}
          >
            {publishStatus === "live" ? "Live Approved" : "Awaiting Approval"}
          </span>
        </div>
      </div>

      {/* 3-Column Studio Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Scheme Metadata & Document Checklist (320px) */}
        <div className="w-80 border-r border-[#E8E4DC] bg-white flex flex-col shrink-0">
          <div className="p-3 border-b border-[#E8E4DC] bg-[#FAF8F5]">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#0F4C4A] block">
              {currentScheme.id} · {currentScheme.type}
            </span>
            <h3 className="font-serif text-sm font-semibold text-[#1B2321] mt-0.5 leading-snug">
              {currentScheme.name}
            </h3>
            <span className="text-xs text-[#5B6663] block mt-1">
              Target: {currentScheme.level}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
            {/* Required Documents */}
            <div className="space-y-2">
              <span className="font-semibold text-[#1B2321] uppercase text-[10px] tracking-wider block">
                Required Document Checklist ({currentScheme.documents.length})
              </span>
              <div className="space-y-1.5">
                {currentScheme.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2 rounded border border-[#E2DED5] bg-[#FBF9F5] flex items-start gap-2"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-[#0F4C4A] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-medium text-[#1B2321] block leading-tight">
                        {doc.name}
                      </span>
                      {doc.note && (
                        <span className="text-[10px] text-[#A63A2B] block mt-0.5">
                          ⚠️ {doc.note}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Chain */}
            <div className="space-y-1.5 pt-2 border-t border-[#E8E4DC]">
              <span className="font-semibold text-[#1B2321] uppercase text-[10px] tracking-wider block">
                Statutory Verification Chain
              </span>
              <div className="space-y-1 text-[11px] text-[#5B6663]">
                {currentScheme.workflow.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <span className="font-mono text-[10px] text-[#0F4C4A] font-bold">
                      0{idx + 1}.
                    </span>
                    <span className="leading-tight">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Rules Inspector / OCR Deficiency Flags / Live JSON */}
        <div className="flex-1 bg-white flex flex-col overflow-hidden border-r border-[#E8E4DC]">
          <div className="h-10 border-b border-[#E8E4DC] px-4 flex items-center justify-between shrink-0">
            <div className="flex gap-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("rules")}
                className={cn(
                  "pb-2.5 pt-2 border-b-2 transition-colors cursor-pointer",
                  activeTab === "rules"
                    ? "border-[#0F4C4A] text-[#0F4C4A] font-semibold"
                    : "border-transparent text-[#5B6663]"
                )}
              >
                Statutory Criteria
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("deficiency_flags")}
                className={cn(
                  "pb-2.5 pt-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1",
                  activeTab === "deficiency_flags"
                    ? "border-[#0F4C4A] text-[#0F4C4A] font-semibold"
                    : "border-transparent text-[#5B6663]"
                )}
              >
                <span>Automated OCR Flags</span>
                <span className="rounded-full bg-[#ECECF8] text-[#4B4FA3] px-1.5 text-[10px] font-mono">
                  {currentScheme.ocr_deficiency_flags.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("json")}
                className={cn(
                  "pb-2.5 pt-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1",
                  activeTab === "json"
                    ? "border-[#0F4C4A] text-[#0F4C4A] font-semibold"
                    : "border-transparent text-[#5B6663]"
                )}
              >
                <Code2 className="w-3.5 h-3.5" />
                Raw Scheme JSON
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("diff")}
                className={cn(
                  "pb-2.5 pt-2 border-b-2 transition-colors cursor-pointer",
                  activeTab === "diff"
                    ? "border-[#0F4C4A] text-[#0F4C4A] font-semibold"
                    : "border-transparent text-[#5B6663]"
                )}
              >
                Shared Anti-Fraud Rules
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handlePublishRuleChange}
              className="text-xs h-7"
            >
              Draft Rule Modification
            </Button>
          </div>

          <div className="flex-1 p-5 overflow-y-auto">
            {/* TAB 1: Rules & Eligibility */}
            {activeTab === "rules" && (
              <div className="max-w-2xl space-y-4 text-xs">
                <Card className="p-4 space-y-3">
                  <h4 className="font-serif text-sm font-semibold text-[#1B2321]">
                    Statutory Eligibility & Limits
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded bg-[#FAF8F5] border border-[#E2DED5]">
                      <span className="text-[#5B6663] block">Income Ceiling:</span>
                      <span className="font-mono font-bold text-sm text-[#0F4C4A]">
                        {currentScheme.eligibility.income_ceiling_inr_per_year
                          ? `₹${currentScheme.eligibility.income_ceiling_inr_per_year.toLocaleString()} / year`
                          : "No Income Limit (Merit Based)"}
                      </span>
                      {currentScheme.eligibility.income_note && (
                        <p className="text-[10px] text-[#5B6663] mt-1">
                          {currentScheme.eligibility.income_note}
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded bg-[#FAF8F5] border border-[#E2DED5]">
                      <span className="text-[#5B6663] block">Minimum Qualifying Marks:</span>
                      <span className="font-mono font-bold text-sm text-[#1B2321]">
                        {currentScheme.eligibility.min_marks_pct
                          ? `${currentScheme.eligibility.min_marks_pct}%`
                          : "Pass in Qualifying Exam"}
                      </span>
                    </div>
                  </div>

                  {/* Exclusions */}
                  <div className="pt-2 border-t border-[#E8E4DC] space-y-1.5">
                    <span className="font-semibold text-[#1B2321] block">Statutory Exclusions:</span>
                    <ul className="list-disc pl-4 text-[#5B6663] space-y-0.5">
                      {currentScheme.eligibility.exclusions.map((exc, i) => (
                        <li key={i}>{exc}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefit Structure */}
                  <div className="pt-2 border-t border-[#E8E4DC] space-y-1.5">
                    <span className="font-semibold text-[#1B2321] block">Sanctioned Benefits & Allowances:</span>
                    <pre className="p-2.5 rounded bg-[#FAF8F5] text-[11px] font-mono text-[#1B2321] border border-[#E2DED5] overflow-auto">
                      {JSON.stringify(currentScheme.benefit, null, 2)}
                    </pre>
                  </div>
                </Card>
              </div>
            )}

            {/* TAB 2: OCR Deficiency Flags (Directly from tribal_scholarship_schemes.json) */}
            {activeTab === "deficiency_flags" && (
              <div className="max-w-2xl space-y-3">
                <div className="p-3 rounded bg-[#ECECF8] border border-dashed border-[#C9CAEA] text-xs text-[#4B4FA3]">
                  <span className="font-semibold block mb-0.5">Automated Scrutiny Rules</span>
                  The Document AI engine evaluates these exact {currentScheme.ocr_deficiency_flags.length} conditions against uploaded certificates. Flags are presented to the verifying officer with bounding box coordinates.
                </div>

                <div className="space-y-2">
                  {currentScheme.ocr_deficiency_flags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-[#E2DED5] bg-white flex items-start gap-2.5 shadow-2xs"
                    >
                      <AlertTriangle className="w-4 h-4 text-[#9A5B00] shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-mono font-semibold text-[#4B4FA3] block text-[11px]">
                          DEF-RULE-0{idx + 1}
                        </span>
                        <p className="text-[#1B2321] mt-0.5">{flag}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Raw JSON */}
            {activeTab === "json" && (
              <pre className="h-full rounded bg-[#FAF8F5] p-4 font-mono text-xs text-[#1B2321] overflow-auto border border-[#E2DED5] leading-relaxed">
                {JSON.stringify(currentScheme, null, 2)}
              </pre>
            )}

            {/* TAB 4: Shared Anti-Fraud Rules */}
            {activeTab === "diff" && (
              <div className="max-w-2xl space-y-4 text-xs">
                <Card className="p-4 space-y-3">
                  <h4 className="font-serif text-sm font-semibold text-[#1B2321]">
                    Universal Anti-Fraud & Cross-Document Checks
                  </h4>
                  <p className="text-[#5B6663]">
                    Applied across all central & state schemes to prevent ghost beneficiaries and double disbursement.
                  </p>

                  <div className="space-y-2 pt-2">
                    {TRIBAL_SCHEMES_DATA.shared_rules.cross_document_checks.map((rule, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded bg-[#FAF8F5] border border-[#E2DED5] flex items-start gap-2"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#E3EFEE] text-[#0F4C4A] font-bold text-[10px] flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-[#1B2321]">{rule}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded bg-[#F8E6E2] text-[#A63A2B] border border-[#A63A2B]/20 font-medium text-[11px] mt-2">
                    Penalty: {TRIBAL_SCHEMES_DATA.shared_rules.false_statement_penalty}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: What-If Policy Simulator (400px) */}
        <div className="w-[400px] bg-[#FAF8F5] p-5 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-1.5 text-[#0F4C4A] font-semibold text-xs uppercase tracking-wide">
                <Sliders className="w-4 h-4" />
                <span>What-If Policy Simulator</span>
              </div>
              <h3 className="font-serif text-base font-semibold text-[#1B2321] mt-1">
                Model Income Threshold Shifts
              </h3>
              <p className="text-xs text-[#5B6663] mt-0.5">
                Simulate changing the income ceiling for {currentScheme.id} across state census data.
              </p>
            </div>

            {/* Slider Card */}
            <Card className="p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#5B6663] font-medium">Income Ceiling</span>
                <span className="font-mono font-bold text-sm text-[#0F4C4A]">
                  ₹{(simulatedCeiling / 100000).toFixed(1)} Lakh / yr
                </span>
              </div>

              <input
                type="range"
                min={200000}
                max={1000000}
                step={50000}
                value={simulatedCeiling}
                onChange={handleSliderChange}
                disabled={!currentScheme.eligibility.income_ceiling_inr_per_year}
                className="w-full h-2 bg-[#EFECE5] rounded-lg appearance-none cursor-pointer accent-[#0F4C4A]"
              />

              <div className="flex justify-between text-[10px] font-mono text-[#5B6663]">
                <span>₹2.0L</span>
                <span>Base (₹{(baseCeiling / 100000).toFixed(1)}L)</span>
                <span>₹10.0L</span>
              </div>
            </Card>

            {/* Beneficiary Shift Output */}
            <Card className="p-4 space-y-3 bg-white">
              <span className="text-xs font-semibold text-[#1B2321] block">
                Projected Beneficiary Pool Impact:
              </span>

              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl font-bold text-[#1B2321] tabular-nums">
                  {projectedEligible}
                </span>
                <span className="text-xs text-[#5B6663]">scholars eligible</span>
                {percentChange !== 0 && (
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ml-auto",
                      percentChange > 0
                        ? "bg-[#E4F1E7] text-[#2F6B3F]"
                        : "bg-[#F8E6E2] text-[#A63A2B]"
                    )}
                  >
                    {percentChange > 0 ? `+${percentChange}%` : `${percentChange}%`}
                  </span>
                )}
              </div>

              <div className="h-2.5 w-full rounded bg-[#EFECE5] overflow-hidden flex">
                <div
                  className="h-full bg-[#0F4C4A] transition-all duration-300"
                  style={{ width: `${Math.min((projectedEligible / 1800) * 100, 100)}%` }}
                />
              </div>

              <div className="pt-2 border-t border-[#E8E4DC] text-xs text-[#5B6663]">
                <span>Estimated Annual Outlay: </span>
                <span className="font-mono font-bold text-[#1B2321]">
                  ₹{((projectedEligible * 240000) / 10000000).toFixed(2)} Cr
                </span>
              </div>
            </Card>
          </div>

          <div className="pt-4 border-t border-[#E8E4DC]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSimulatedCeiling(baseCeiling);
                toast.info("Reset to Statutory Baseline");
              }}
              className="w-full text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset to Official Guideline Value
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
