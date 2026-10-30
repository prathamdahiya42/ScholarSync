"use client";

import * as React from "react";
import { Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReasonCode {
  code: string;
  sentenceEn: string;
  sentenceHi: string;
  isFixable: boolean;
  isAppealable: boolean;
  category: "document" | "eligibility" | "institute" | "bank";
}

export const OFFICIAL_REASON_CODES: ReasonCode[] = [
  {
    code: "DEF_DOC_UNREADABLE",
    sentenceEn: "Uploaded document image is cropped, blurry, or illegible.",
    sentenceHi: "अपलोड किया गया दस्तावेज़ अस्पष्ट या कटा हुआ है।",
    isFixable: true,
    isAppealable: false,
    category: "document",
  },
  {
    code: "DEF_INC_EXPIRED",
    sentenceEn: "Income certificate is older than the allowed 1-year financial validity.",
    sentenceHi: "आय प्रमाण पत्र अनुमत 1 वर्ष की वैधता से पुराना है।",
    isFixable: true,
    isAppealable: false,
    category: "document",
  },
  {
    code: "DEF_NAME_MISMATCH",
    sentenceEn: "Candidate name differs across Aadhaar and qualifying marksheet.",
    sentenceHi: "आधार और अंकतालिका में अभ्यर्थी के नाम की वर्तनी में अंतर है।",
    isFixable: true,
    isAppealable: true,
    category: "document",
  },
  {
    code: "REJ_INC_CEILING",
    sentenceEn: "Annual family income exceeds the statutory ₹6,00,000 ceiling.",
    sentenceHi: "वार्षिक पारिवारिक आय ₹6,00,000 की वैधानिक सीमा से अधिक है।",
    isFixable: false,
    isAppealable: true,
    category: "eligibility",
  },
  {
    code: "REJ_INST_NOT_NOTIFIED",
    sentenceEn: "Enrolled institution is not listed on the Ministry's 265 notified institute schedule.",
    sentenceHi: "संस्थान मंत्रालय की 265 अधिसूचित संस्थानों की सूची में शामिल नहीं है।",
    isFixable: false,
    isAppealable: true,
    category: "institute",
  },
  {
    code: "REJ_TRIBE_NOT_IN_STATE",
    sentenceEn: "Declared tribe community is not identified under the Home State's ST Presidential Order.",
    sentenceHi: "घोषित जनजाति गृह राज्य के अनुसूचित जनजाति आदेश में शामिल नहीं है।",
    isFixable: false,
    isAppealable: true,
    category: "eligibility",
  },
  {
    code: "DEF_BANK_NOT_SEEDED",
    sentenceEn: "Bank account is not active on the NPCI Aadhaar DBT payment mapper.",
    sentenceHi: "बैंक खाता NPCI आधार डीबीटी मैपर में सक्रिय नहीं है।",
    isFixable: true,
    isAppealable: false,
    category: "bank",
  },
];

interface ReasonCodeSelectProps {
  selectedCode?: string;
  onSelect: (reason: ReasonCode) => void;
  lang?: "en" | "hi";
  className?: string;
}

export function ReasonCodeSelect({
  selectedCode,
  onSelect,
  lang = "en",
  className,
}: ReasonCodeSelectProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filtered = OFFICIAL_REASON_CODES.filter(
    (r) =>
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.sentenceEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.sentenceHi.includes(searchTerm)
  );

  return (
    <div className={cn("rounded-[var(--radius-sm)] border border-[var(--border)] bg-white p-3 space-y-2", className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Search by code or reason text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-white pl-8 pr-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
        />
      </div>

      <div className="max-h-56 overflow-y-auto space-y-1.5 divide-y divide-[var(--border)]">
        {filtered.map((reason) => {
          const isSelected = selectedCode === reason.code;
          return (
            <div
              key={reason.code}
              onClick={() => onSelect(reason)}
              className={cn(
                "pt-2 first:pt-0 p-2 rounded cursor-pointer transition-colors text-xs flex items-start justify-between gap-2",
                isSelected
                  ? "bg-[var(--primary-tint)] text-[var(--primary)] font-medium"
                  : "hover:bg-[var(--sunken)]"
              )}
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-semibold text-[11px] px-1 py-0.5 rounded bg-[var(--sunken)] text-[var(--foreground)]">
                    {reason.code}
                  </span>
                  {reason.isFixable && (
                    <span className="rounded-full bg-[var(--success-tint)] text-[var(--success)] px-1.5 py-0.2 text-[10px] font-medium">
                      Fixable by student
                    </span>
                  )}
                  {reason.isAppealable && (
                    <span className="rounded-full bg-[var(--primary-tint)] text-[var(--primary)] px-1.5 py-0.2 text-[10px] font-medium">
                      Appealable
                    </span>
                  )}
                </div>
                <p className="text-[var(--foreground)]">
                  {lang === "hi" ? reason.sentenceHi : reason.sentenceEn}
                </p>
              </div>

              {isSelected && (
                <Check className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
