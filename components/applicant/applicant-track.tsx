"use client";

import * as React from "react";
import { ArrowLeft, Clock, ShieldCheck, HelpCircle, FileText, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusTimeline, TimelineStep } from "@/components/shared/status-timeline";
import { DeficiencyCard } from "@/components/shared/deficiency-card";
import { HumanGateTag } from "@/components/shared/human-gate-tag";
import { scholarshipStore } from "@/lib/supabase";
import { ApplicationRecord } from "@/types/scholarship";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ApplicantTrackProps {
  appId?: string;
  lang?: "en" | "hi";
  onBackToApply: () => void;
}

export function ApplicantTrack({
  appId = "NFS-26-MP-88391",
  lang = "en",
  onBackToApply,
}: ApplicantTrackProps) {
  const [currentApp, setCurrentApp] = React.useState<ApplicationRecord | null>(null);
  const [hasFixedDeficiency, setHasFixedDeficiency] = React.useState<boolean>(false);

  // Subscribe to live updates from Supabase / Hybrid Store
  React.useEffect(() => {
    scholarshipStore.getApplicationById(appId).then((app) => {
      if (app) setCurrentApp(app);
    });

    const unsubscribe = scholarshipStore.subscribe(async () => {
      const updated = await scholarshipStore.getApplicationById(appId);
      if (updated) setCurrentApp(updated);
    });

    return () => unsubscribe();
  }, [appId]);

  const isDefective = currentApp?.status === "defective" && !hasFixedDeficiency;
  const isVerified = currentApp?.status === "verified";
  const isSelected = currentApp?.status === "selected";

  const timelineSteps: TimelineStep[] = [
    {
      id: "step-sub",
      title: lang === "hi" ? "आवेदन जमा किया गया" : "Application Submitted",
      status: "completed",
      completedAt: "24 Oct 2026, 10:20 AM",
      description: lang === "hi" ? "आधार सत्यापन एवं पूर्व-जांच पूर्ण" : "Pre-flight checks passed; encrypted packet signed.",
    },
    {
      id: "step-inst",
      title: lang === "hi" ? "संस्थान नोडल अधिकारी सत्यापन" : "Institute Nodal Verification",
      status: isVerified ? "completed" : isDefective ? "current" : "current",
      completedAt: isVerified ? "Today, 11:45 AM" : undefined,
      description: isVerified
        ? (lang === "hi" ? "नोडल अधिकारी द्वारा सत्यापित एवं अनुशंसित" : "Verified & approved by Institute Nodal Officer Dr. S. Sharma.")
        : isDefective
        ? (lang === "hi" ? "दस्तावेज़ में कमी पाई गई — नया आय प्रमाण पत्र अपेक्षित" : "Document deficiency raised: Fresh income certificate requested.")
        : (lang === "hi" ? "समीक्षा प्रक्रियाधीन" : "Document under verification."),
      expectedWait: isVerified ? undefined : "1–2 days",
      hasDeficiency: isDefective,
      deficiencyDeadline: isDefective ? "7 days" : undefined,
    },
    {
      id: "step-min",
      title: lang === "hi" ? "मंत्रालय स्तर अंतिम समीक्षा" : "Ministry Central Verification",
      status: isVerified ? "current" : "upcoming",
      description: lang === "hi" ? "केंद्रीय क्षेत्र छात्रवृत्ति पात्रता अनुमोदन" : "Final scrutiny for Central Sector fellowship grant.",
    },
    {
      id: "step-sel",
      title: lang === "hi" ? "चयन समिति मेरिट रैंकिंग" : "Selection Committee Ranking",
      status: isSelected ? "completed" : "upcoming",
      description: lang === "hi" ? "750 फैलोशिप सीटों हेतु मेरिट सूची" : "Slot allocation and reservation allotment.",
    },
    {
      id: "step-pay",
      title: lang === "hi" ? "डीबीटी प्रत्यक्ष लाभ अंतरण" : "DBT Direct Benefit Transfer",
      status: "upcoming",
      description: lang === "hi" ? "पीएफएमएस के माध्यम से बैंक खाते में राशि" : "PFMS credit via Aadhaar Payment Bridge.",
    },
  ];

  const handleResolveDeficiency = async (file: File) => {
    setHasFixedDeficiency(true);
    await scholarshipStore.updateStatus(
      appId,
      "in_review",
      "Candidate uploaded corrected income certificate"
    );
    toast.success("Corrected Certificate Transmitted", {
      description: "Institute Nodal Officer notified. Realtime status updated.",
    });
  };

  return (
    <div className="w-full max-w-[480px] mx-auto py-4 px-3 sm:px-4 space-y-5 animate-in fade-in-0 duration-180">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBackToApply} className="gap-1 p-0 h-auto text-xs text-[#5B6663] hover:text-[#1B2321]">
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === "hi" ? "मुख्य पृष्ठ" : "Back"}</span>
        </Button>

        <div className="flex items-center gap-2">
          <HumanGateTag officerInitials="SS" stageName="Institute Officer" />
        </div>
      </div>

      {/* Application Snapshot Header */}
      <Card className="p-4 space-y-2.5 bg-white border-[#E2DED5]">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-mono text-xs text-[#5B6663] block">
              Application ID
            </span>
            <span className="font-mono text-base font-bold text-[#0F4C4A]">
              {appId}
            </span>
          </div>

          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold border",
              isVerified
                ? "bg-[#E3EFEE] text-[#0F4C4A] border-[#C5DDD9]"
                : isDefective
                ? "bg-[#FDF4F2] text-[#A63A2B] border-[#F2C2BA]"
                : "bg-[#FBF9F5] text-[#5B6663] border-[#E8E4DC]"
            )}
          >
            {isVerified
              ? (lang === "hi" ? "सत्यापित (Verified)" : "Verified & Passed")
              : isDefective
              ? (lang === "hi" ? "कमी निवारण अपेक्षित" : "Action Required")
              : (lang === "hi" ? "समीक्षा जारी" : "Under Scrutiny")}
          </span>
        </div>

        <div className="text-xs text-[#5B6663] space-y-1 pt-1 border-t border-[#EFECE5]">
          <div className="flex justify-between">
            <span>Scholar Name:</span>
            <span className="font-semibold text-[#1B2321]">
              {currentApp?.applicantName || "Ramesh Kumar Gond"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Scheme:</span>
            <span className="font-semibold text-[#1B2321]">
              {currentApp?.schemeId || "National Fellowship for ST Students (NFST)"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Realtime State:</span>
            <span className="font-mono text-[#0F4C4A] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#2F6B3F] animate-pulse" />
              Connected to Store
            </span>
          </div>
        </div>
      </Card>

      {/* Live Deficiency Resolution Card */}
      {isDefective && (
        <DeficiencyCard
          deficiencyCode="DEF_INC_EXPIRED"
          fieldName="Annual Family Income Certificate"
          deadlineDays={7}
          originalValue="₹4,80,000 (Dated 12-Aug-2024)"
          officerRemarks="Certificate must be from FY preceding selection year from Tehsildar or higher authority."
          whatIsNeeded={
            lang === "hi"
              ? "सत्र 2026-27 हेतु जारी आय प्रमाण पत्र अपलोड करें। तहसीलदार स्तर से कम का प्रमाण पत्र मान्य नहीं है।"
              : "Upload fresh income certificate issued by Tehsildar or Sub-Divisional Magistrate for A.Y. 2026-27."
          }
          onUploadNewDoc={handleResolveDeficiency}
          lang={lang}
        />
      )}

      {/* Status Timeline */}
      <Card className="p-4 bg-white border-[#E2DED5]">
        <div className="mb-3">
          <h3 className="font-serif text-sm font-bold text-[#1B2321]">
            {lang === "hi" ? "प्रसंस्करण समय-सीमा (Live Tracker)" : "Processing Timeline & Human Gates"}
          </h3>
          <p className="text-[11px] text-[#5B6663]">
            {lang === "hi"
              ? "पारदर्शी 5-चरणीय सत्यापन चक्र"
              : "End-to-end transparent scrutiny cycle with human decision records"}
          </p>
        </div>

        <StatusTimeline steps={timelineSteps} lang={lang} />
      </Card>
    </div>
  );
}
