"use client";

import * as React from "react";
import {
  BookOpen,
  GraduationCap,
  Globe,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
  Info,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import BorderGlow from "@/components/BorderGlow";
import { useAppTheme, THEME_PALETTES } from "@/lib/useAppTheme";
import { ALL_MOTA_SCHEMES, MoTAScheme } from "@/lib/schemes";
import { cn } from "@/lib/utils";

interface SchemeCatalogProps {
  lang?: "en" | "hi";
  onApplyScheme: (schemeId: string) => void;
  onCheckEligibility: () => void;
}

export function SchemeCatalog({
  lang = "en",
  onApplyScheme,
  onCheckEligibility,
}: SchemeCatalogProps) {
  const appTheme = useAppTheme();
  const palette = THEME_PALETTES[appTheme];
  const [selectedScheme, setSelectedScheme] = React.useState<MoTAScheme | null>(null);

  const getSchemeIcon = (id: string) => {
    switch (id) {
      case "NOS-ST":
        return <Globe className="w-5 h-5 text-[#0F4C4A]" />;
      case "NFST":
        return <BookOpen className="w-5 h-5 text-[#4B4FA3]" />;
      case "NS-TOPCLASS-ST":
        return <Building className="w-5 h-5 text-[#9A5B00]" />;
      case "PMS-ST":
      default:
        return <GraduationCap className="w-5 h-5 text-[#2F6B3F]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-red-100 dark:border-red-950 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-space font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-900/60 px-2.5 py-0.5 rounded-full">
              {lang === "hi" ? "आधिकारिक डेटासेट" : "Official MoTA Dataset"}
            </span>
            <span className="text-xs font-code text-stone-500 dark:text-stone-400 font-medium">
              tribal_scholarship_schemes.json
            </span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mt-1">
            {lang === "hi"
              ? "जनजातीय कार्य मंत्रालय: 4 आधिकारिक योजनाएं"
              : "Official Ministry of Tribal Affairs (MoTA) Schemes"}
          </h2>
          <p className="text-xs sm:text-sm font-sans text-stone-600 dark:text-stone-300 mt-1 max-w-2xl">
            {lang === "hi"
              ? "कॉन्फ़िगर करने योग्य नियमों, विशिष्ट आय सीमाओं एवं स्वचालित ओसीआर त्रुटि जांच के साथ एकीकृत।"
              : "Integrated with deterministic eligibility rules, statutory income caps, and automated OCR scrutiny flags."}
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onCheckEligibility}
          className="text-xs font-space font-bold shrink-0 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-red-600 dark:text-red-400" />
          {lang === "hi" ? "पात्रता जांचकर्ता खोलें" : "Match Me to a Scheme"}
        </Button>
      </div>

      {/* 4 Official Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ALL_MOTA_SCHEMES.map((scheme) => {
          const isNoCeiling = scheme.eligibility.income_ceiling_inr_per_year === null;
          const ceilingText = isNoCeiling
            ? lang === "hi" ? "कोई आय सीमा नहीं" : "No Income Ceiling"
            : `₹${(scheme.eligibility.income_ceiling_inr_per_year! / 100000).toFixed(1)} Lakh / year`;

          const schemeStyles: Record<string, { spotlight: string; border: string }> = {
            "PMS-ST": { spotlight: "rgba(47, 107, 63, 0.16)", border: "border-t-3 border-t-[#2F6B3F]" },
            "NS-TOPCLASS-ST": { spotlight: "rgba(154, 91, 0, 0.16)", border: "border-t-3 border-t-[#9A5B00]" },
            "NFST": { spotlight: "rgba(75, 79, 163, 0.16)", border: "border-t-3 border-t-[#4B4FA3]" },
            "NOS-ST": { spotlight: "rgba(15, 76, 74, 0.16)", border: "border-t-3 border-t-[#0F4C4A]" },
          };
          const currentStyle = schemeStyles[scheme.id] || { spotlight: "rgba(15, 76, 74, 0.15)", border: "border-t-3 border-t-[#0F4C4A]" };

          return (
            <BorderGlow
              key={scheme.id}
              backgroundColor={palette.cardBg}
              glowColor={palette.borderGlowColor}
              colors={palette.borderGlowColors}
              borderRadius={18}
              edgeSensitivity={30}
              glowRadius={40}
              className="h-full"
            >
              <div className="p-5 flex flex-col justify-between h-full bg-transparent group">
                <div className="space-y-4">
                  {/* Top badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/80 flex items-center justify-center border border-red-200 dark:border-red-900/60 shadow-xs">
                        {getSchemeIcon(scheme.id)}
                      </div>
                      <div>
                        <span className="text-[11px] font-code font-bold text-red-600 dark:text-red-400 tracking-wider uppercase">
                          {scheme.id}
                        </span>
                        <h3 className="font-space text-base font-bold text-stone-900 dark:text-white leading-snug">
                          {scheme.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Scope & Type */}
                  <div className="text-xs text-stone-600 dark:text-stone-300 space-y-1 font-sans">
                    <p className="line-clamp-2">
                      <strong className="text-stone-900 dark:text-white font-space">{lang === "hi" ? "स्तर:" : "Level:"}</strong> {scheme.level}
                    </p>
                    <p>
                      <strong className="text-stone-900 dark:text-white font-space">{lang === "hi" ? "प्रकार:" : "Type:"}</strong> {scheme.type}
                    </p>
                  </div>

                  {/* Key Metrics Pills */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-red-50/40 dark:bg-[#1E1218] rounded-xl p-2.5 border border-red-100 dark:border-red-950">
                      <span className="text-[10px] uppercase font-space font-semibold text-stone-500 dark:text-stone-400 block">
                        {lang === "hi" ? "वार्षिक आय सीमा" : "Income Ceiling"}
                      </span>
                      <span className="text-xs font-extrabold text-stone-900 dark:text-white font-code">
                        {ceilingText}
                      </span>
                    </div>

                    <div className="bg-red-50/40 dark:bg-[#1E1218] rounded-xl p-2.5 border border-red-100 dark:border-red-950">
                      <span className="text-[10px] uppercase font-space font-semibold text-stone-500 dark:text-stone-400 block">
                        {lang === "hi" ? "वार्षिक स्लॉट / कोटा" : "Annual Slots / Ceiling"}
                      </span>
                      <span className="text-xs font-extrabold text-stone-900 dark:text-white font-code">
                        {scheme.id === "NFST"
                          ? "750 Slots (Fixed)"
                          : scheme.id === "NOS-ST"
                          ? "20 Slots (Overseas)"
                          : scheme.id === "NS-TOPCLASS-ST"
                          ? "265 Premier Inst."
                          : "State Allocation"}
                      </span>
                    </div>
                  </div>

                  {/* AI OCR Scrutiny Rules Highlight */}
                  <div className="bg-red-50/70 dark:bg-red-950/40 rounded-xl p-2.5 border border-red-200/80 dark:border-red-900/60">
                    <span className="text-[11px] font-space font-bold text-red-700 dark:text-red-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                      {scheme.ocr_deficiency_flags.length} {lang === "hi" ? "स्वचालित ओसीआर नियम जांच" : "Automated OCR Verification Rules"}
                    </span>
                    <p className="text-[11px] font-sans text-stone-600 dark:text-stone-300 mt-0.5 line-clamp-1">
                      {scheme.ocr_deficiency_flags[0]}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 mt-4 border-t border-red-100 dark:border-red-950 flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedScheme(scheme)}
                    className="text-xs font-space font-bold border-red-200 dark:border-red-900 text-stone-700 dark:text-stone-200 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <Info className="w-3.5 h-3.5 mr-1 text-red-600 dark:text-red-400" />
                    {lang === "hi" ? "नियम व दस्तावेज" : "View Rules & Docs"}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onApplyScheme(scheme.id)}
                    className="text-xs font-space font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs"
                  >
                    {lang === "hi" ? "आवेदन प्रारंभ करें" : "Apply Now"}
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </BorderGlow>
          );
        })}
      </div>

      {/* Scheme Detail Inspection Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50 duration-200">
          <div className="bg-white dark:bg-[#160F14] rounded-2xl border border-red-200 dark:border-red-900/80 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-red-100 dark:border-red-950 flex items-start justify-between bg-red-50/60 dark:bg-[#1E1218]">
              <div>
                <span className="text-xs font-code font-bold text-red-600 dark:text-red-400 uppercase bg-red-100/80 dark:bg-red-950 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                  {selectedScheme.id} · {selectedScheme.ministry}
                </span>
                <h3 className="font-editorial text-2xl font-bold text-stone-900 dark:text-white mt-1.5">
                  {selectedScheme.name}
                </h3>
                <p className="text-xs font-space text-stone-600 dark:text-stone-300 mt-0.5">
                  {selectedScheme.type} · {selectedScheme.level}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScheme(null)}
                className="text-stone-400 hover:text-stone-900 dark:hover:text-white p-1 rounded-md hover:bg-red-100/50 dark:hover:bg-red-950 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs text-stone-900 dark:text-stone-100">
              {/* Eligibility Criteria */}
              <div className="space-y-2">
                <h4 className="font-space text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                  Statutory Eligibility Criteria
                </h4>
                <div className="bg-red-50/30 dark:bg-[#1E1218] rounded-xl p-3.5 border border-red-100 dark:border-red-950 space-y-1.5 font-sans">
                  <p>
                    <strong className="font-space">Category:</strong> {selectedScheme.eligibility.category}
                  </p>
                  <p>
                    <strong className="font-space">Income Ceiling:</strong>{" "}
                    {selectedScheme.eligibility.income_ceiling_inr_per_year
                      ? `₹${selectedScheme.eligibility.income_ceiling_inr_per_year.toLocaleString()} / year`
                      : "No income criterion (Universal for ST scholars)"}
                  </p>
                  {selectedScheme.eligibility.min_marks_pct && (
                    <p>
                      <strong className="font-space">Minimum Qualifying Marks:</strong> {selectedScheme.eligibility.min_marks_pct}%
                    </p>
                  )}
                  {selectedScheme.eligibility.must_have_passed && (
                    <p>
                      <strong className="font-space">Must Have Passed:</strong> {selectedScheme.eligibility.must_have_passed}
                    </p>
                  )}
                  {selectedScheme.eligibility.exclusions && (
                    <p className="text-red-600 dark:text-red-400 font-medium">
                      <strong className="font-space">Exclusions:</strong> {selectedScheme.eligibility.exclusions.join("; ")}
                    </p>
                  )}
                </div>
              </div>

              {/* Required Documents */}
              <div className="space-y-2">
                <h4 className="font-space text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                  Mandatory Verification Documents
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedScheme.documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="p-2.5 rounded-xl border border-red-100 dark:border-red-950 bg-white/90 dark:bg-[#1E1218] flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-space font-bold text-[11px] block text-stone-900 dark:text-white">
                          {doc.name}
                        </span>
                        {doc.note && (
                          <span className="text-[10px] font-sans text-stone-500 dark:text-stone-400">{doc.note}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI OCR Scrutiny Flags */}
              <div className="space-y-2">
                <h4 className="font-space text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                  AI OCR Scrutiny & Deficiency Flags
                </h4>
                <p className="text-stone-600 dark:text-stone-300 text-[11px] font-sans">
                  The platform&apos;s Document AI worker automatically evaluates uploaded scans against these statutory rules before officer review:
                </p>
                <div className="space-y-1.5">
                  {selectedScheme.ocr_deficiency_flags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-[11px] flex items-start gap-2"
                    >
                      <span className="font-code font-bold text-[10px] mt-0.5">#{idx + 1}</span>
                      <span className="font-sans leading-snug">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Level Verification Workflow */}
              <div className="space-y-2">
                <h4 className="font-space text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
                  Statutory Multi-Level Approval Workflow
                </h4>
                <ol className="space-y-1.5 list-decimal list-inside text-[11px] text-stone-600 dark:text-stone-300 font-sans">
                  {selectedScheme.workflow.map((step, idx) => (
                    <li key={idx} className="p-2 bg-red-50/40 dark:bg-[#1E1218] rounded-lg border border-red-100 dark:border-red-950">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-red-100 dark:border-red-950 bg-red-50/60 dark:bg-[#1E1218] flex items-center justify-between">
              <span className="text-[11px] font-space text-stone-600 dark:text-stone-300">
                Human Gate Principle: Officers retain 100% decision authority.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedScheme(null)}
                  className="text-xs font-space font-semibold"
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const id = selectedScheme.id;
                    setSelectedScheme(null);
                    onApplyScheme(id);
                  }}
                  className="text-xs font-space font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs"
                >
                  Apply Under This Scheme
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
