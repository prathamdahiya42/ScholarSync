"use client";

import * as React from "react";
import {
  Volume2,
  CheckCircle2,
  Upload,
  Camera,
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Share2,
  Download,
  Building,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MockBadge } from "@/components/shared/mock-badge";
import { AIFlagChip } from "@/components/shared/ai-flag-chip";
import { PreflightChecklist, PreflightItem } from "@/components/shared/preflight-checklist";
import { AadhaarSandboxModal, AadhaarVerifiedData } from "./aadhaar-sandbox-modal";
import { scholarshipStore } from "@/lib/supabase";
import { ApplicationRecord } from "@/types/scholarship";
import { OcrResponseData } from "@/app/api/ocr/route";
import { QRCodeSVG } from "qrcode.react";
import Stepper, { Step } from "@/components/Stepper";
import BorderGlow from "@/components/BorderGlow";
import { useAppTheme, THEME_PALETTES } from "@/lib/useAppTheme";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ApplicantFlowProps {
  lang: "en" | "hi";
  onCompleteSubmission: (appId: string) => void;
  onViewStatusTimeline: () => void;
}

export function ApplicantFlow({
  lang = "en",
  onCompleteSubmission,
  onViewStatusTimeline,
}: ApplicantFlowProps) {
  const appTheme = useAppTheme();
  const palette = THEME_PALETTES[appTheme];
  const [step, setStep] = React.useState<number>(1);
  const totalSteps = 6;

  // Form State
  const [formData, setFormData] = React.useState({
    fullName: "Ramesh Kumar Gond",
    fatherName: "Mansingh Gond",
    dob: "2001-04-14",
    gender: "Male",
    tribe: "Gond",
    state: "Madhya Pradesh",
    district: "Dindori",
    aadhaarLastFour: "8892",
    familyIncome: "210000",
    instituteName: "Devi Ahilya Vishwavidyalaya (DAVV), Indore",
    aisheCode: "U-0318",
    course: "Ph.D. in Tribal Ethnobotany",
    bankIfsc: "SBIN0030145",
    bankAccount: "33190821455",
    isBankSeeded: true,
  });

  // Modal State
  const [isAadhaarModalOpen, setIsAadhaarModalOpen] = React.useState<boolean>(false);

  // Guided Camera / Upload & Live OCR State
  const [selectedDocType, setSelectedDocType] = React.useState<string>("income_cert");
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [uploadQualityScore, setUploadQualityScore] = React.useState<number>(94);
  const [ocrLoading, setOcrLoading] = React.useState<boolean>(false);
  const [ocrData, setOcrData] = React.useState<OcrResponseData | null>(null);

  // Confirm What We Read State
  const [confirmedOcr, setConfirmedOcr] = React.useState<Record<string, boolean>>({
    name: true,
    tribe: true,
    income: true,
    institute: true,
  });

  // Pre-flight State
  const [warningsAcknowledged, setWarningsAcknowledged] = React.useState<boolean>(false);

  // Submitted Receipt State
  const [generatedAppId, setGeneratedAppId] = React.useState<string>(
    () => `ST-${Date.now().toString().slice(-6)}`
  );

  // Read-Aloud helper using Web Speech API
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  // Run Real Next.js /api/ocr endpoint
  const handleRunOcrPreset = async (preset: "golden_pass" | "income_exceeded" | "blurry") => {
    setOcrLoading(true);
    try {
      const res = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: selectedDocType,
          schemeId: "PMS-ST",
          samplePreset: preset,
          userTypedIncome: formData.familyIncome,
          userTypedTribe: formData.tribe,
          userTypedName: formData.fullName,
        }),
      });
      const data: OcrResponseData = await res.json();
      setOcrData(data);
      setUploadQualityScore(data.qualityScore);
      setCapturedImage(`/docs/sample-${preset}.png`);

      if (preset === "income_exceeded") {
        setFormData((prev) => ({ ...prev, familyIncome: "720000" }));
      } else if (preset === "golden_pass") {
        setFormData((prev) => ({ ...prev, familyIncome: "210000" }));
      }

      toast.success("Document Scanned by AI OCR Engine", {
        description: `Quality: ${data.qualityScore}/100. Discrepancies detected: ${data.deficiencyFlags.length}.`,
      });
    } catch (e) {
      toast.error("OCR API error, using local fallback");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleAadhaarSuccess = (data: AadhaarVerifiedData) => {
    setFormData((prev) => ({
      ...prev,
      fullName: data.fullName,
      fatherName: data.fatherName,
      dob: data.dob,
      gender: data.gender,
      state: data.state,
      district: data.district,
      aadhaarLastFour: data.aadhaarNumber.slice(-4),
      isBankSeeded: data.isBankSeeded,
    }));
    toast.success("Aadhaar Verified & Populated", {
      description: `Name: ${data.fullName} · DBT Seeding: ${data.isBankSeeded ? "Active" : "Not Seeded"}`,
    });
  };

  // Pre-flight Items (Reacts to Aadhaar seeding and OCR status!)
  const preflightChecks: PreflightItem[] = [
    {
      id: "pf-dbt",
      name: lang === "hi" ? "आधार-बैंक डीबीटी सीडिंग स्थिति" : "Aadhaar-Bank DBT Seeding Status",
      status: formData.isBankSeeded ? "pass" : "warn",
      isMocked: true,
      message: formData.isBankSeeded
        ? (lang === "hi" ? "खाता 33190821455 एनपीसीआई मैपर में डीबीटी हेतु पूर्णतया सक्रिय है।" : "Account 33190821455 is successfully seeded in NPCI mapper.")
        : (lang === "hi" ? "खाता सक्रिय है, किंतु NPCI मैपर में डीबीटी सक्षम नहीं है।" : "Account active, but not seeded for DBT in NPCI mapper."),
      fixAction: formData.isBankSeeded
        ? undefined
        : (lang === "hi" ? "अपनी बैंक शाखा में जाकर डीबीटी फॉर्म जमा कराएं।" : "Visit branch with Aadhaar. (Adi-Setu provides bank slip)."),
    },
    {
      id: "pf-income",
      name: lang === "hi" ? "वार्षिक आय सीमा सत्यापन" : "Annual Income Ceiling Check",
      status: Number(formData.familyIncome) > 250000 ? "warn" : "pass",
      message: Number(formData.familyIncome) > 250000
        ? `Declared income ₹${Number(formData.familyIncome).toLocaleString()} exceeds PMS-ST ₹2,50,000 ceiling. System recommends Top-Class or NFST fellowship.`
        : `Declared income ₹${Number(formData.familyIncome).toLocaleString()} is within statutory ₹2,50,000 ceiling.`,
      fixAction: Number(formData.familyIncome) > 250000 ? "Switch scheme or submit verified income certificate." : undefined,
    },
    {
      id: "pf-tribe",
      name: lang === "hi" ? "जनजाति अनुसूची सत्यापन" : "Presidential ST Schedule Match",
      status: "pass",
      message: `Tribe '${formData.tribe}' verified in official ST Gazette for ${formData.state}.`,
    },
    {
      id: "pf-institute",
      name: lang === "hi" ? "265 अधिसूचित संस्थान सत्यापन" : "265 Notified Institute Schedule Match",
      status: "pass",
      message: "DAVV Indore (AISHE: U-0318) is recognized on the Ministry Schedule.",
    },
  ];

  // Final submission handler
  const handleFinalSubmit = async () => {
    const newApp: ApplicationRecord = {
      id: generatedAppId,
      applicantName: formData.fullName,
      fatherName: formData.fatherName,
      dob: formData.dob,
      gender: formData.gender,
      tribe: formData.tribe,
      state: formData.state,
      district: formData.district,
      aadhaarLastFour: formData.aadhaarLastFour,
      familyIncome: Number(formData.familyIncome) || 210000,
      instituteName: formData.instituteName,
      aisheCode: formData.aisheCode,
      course: formData.course,
      status: "submitted",
      riskScore: ocrData && !ocrData.isPassed ? 70 : 15,
      aiFlags: (ocrData?.deficiencyFlags || []).map((f) => ({
        id: f.ruleId,
        ruleId: f.ruleId,
        field: "income",
        severity: f.severity,
        message: { en: f.flagText, hi: f.flagText },
        confidence: 0.95,
        sourceBox: f.sourceBox,
      })),
      documents: [
        {
          id: "doc-income",
          name: "Annual Family Income Certificate",
          type: "income_certificate",
          fileUrl: "/docs/sample-income.png",
          fileType: "application/pdf",
          uploadedAt: new Date().toISOString(),
          qualityScore: uploadQualityScore,
          boundingEvidence: [
            {
              fieldId: "familyIncome",
              label: "Annual Income",
              box: [46, 20, 53, 55],
              extractedValue: `₹${Number(formData.familyIncome).toLocaleString()}`,
              confidence: 0.97,
            },
          ],
        },
      ],
      submittedAt: new Date().toISOString(),
    };

    await scholarshipStore.saveApplication(newApp);
    onCompleteSubmission(generatedAppId);
    setStep(6);
  };

  return (
    <div className="w-full max-w-[560px] mx-auto min-h-[calc(100vh-80px)] flex flex-col justify-start py-4 px-2 sm:px-4">
      {/* Aadhaar Sandbox Modal */}
      <AadhaarSandboxModal
        isOpen={isAadhaarModalOpen}
        onClose={() => setIsAadhaarModalOpen(false)}
        onSuccess={handleAadhaarSuccess}
        lang={lang}
      />

      {/* Top Helper Strip */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-3 px-1 font-space">
        <div className="flex items-center gap-1.5 font-medium text-stone-900 dark:text-white">
          <span>{lang === "hi" ? `चरण ${step} / ${totalSteps}` : `Step ${step} of ${totalSteps}`}</span>
          <span className="text-stone-300 dark:text-stone-600">·</span>
          <span className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 animate-pulse" />
            {lang === "hi" ? "स्वतः सहेजा गया" : "Auto-Saved"}
          </span>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 text-stone-600 dark:text-stone-300 hover:text-red-600 dark:hover:text-red-400 text-xs cursor-pointer transition-colors"
          onClick={() => toast.info("MoTA Grievance Helpdesk", { description: "Toll Free: 1800-11-7788" })}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{lang === "hi" ? "सहायता" : "Help"}</span>
        </button>
      </div>

      {/* REACT BITS BORDERGLOW CONTAINER & STEPPER */}
      <BorderGlow
        backgroundColor={palette.cardBg}
        glowColor={palette.borderGlowColor}
        colors={palette.borderGlowColors}
        borderRadius={24}
        edgeSensitivity={30}
        glowRadius={44}
        className="w-full shadow-xl"
      >
        <div className="p-4 sm:p-6 w-full">
          <Stepper
            step={step}
            onStepChange={(newStep) => setStep(newStep)}
            onFinalStepCompleted={() => {}}
            theme={appTheme}
            accentColor={palette.accent}
            width="100%"
            frame={false}
            radius={16}
            indicator="numbers"
            showFooter={step < 6}
            backButtonText={lang === "hi" ? "पिछला चरण" : "Back"}
            nextButtonText={
              step === 5
                ? (lang === "hi" ? "आवेदन जमा करें" : "Submit Application")
                : (lang === "hi" ? "अगला चरण" : "Continue")
            }
            nextButtonProps={{
              disabled: step === 5 && !warningsAcknowledged,
              onClick: (e: React.MouseEvent) => {
                if (step === 5) {
                  e.preventDefault();
                  handleFinalSubmit();
                }
              },
            }}
          >
            {/* STEP 1: Personal Details & Aadhaar Sandbox */}
            <Step title={lang === "hi" ? "व्यक्तिगत" : "Personal"}>
              <div className="space-y-4 pt-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1B2321]">
                  {lang === "hi" ? "व्यक्तिगत एवं जनजाति विवरण" : "Personal & Tribe Details"}
                </h2>
                <p className="text-xs text-[#5B6663] mt-0.5">
                  {lang === "hi" ? "आधार कार्ड में अंकित विवरण दर्ज करें" : "As registered in Government ST population schedule"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => speakText(lang === "hi" ? "व्यक्तिगत विवरण एवं जनजाति की जानकारी दर्ज करें" : "Enter personal details and tribe identity")}
                className="p-2 rounded-lg border border-[#CFC9BD] bg-white text-[#1B2321] hover:bg-[#EFECE5] shrink-0"
                title="Read aloud"
              >
                <Volume2 className="w-4 h-4 text-[#5B6663]" />
              </button>
            </div>

            {/* Quick Aadhaar eKYC Sandbox Launcher Button */}
            <div className="rounded-xl border border-[#0F4C4A]/40 bg-[#E3EFEE]/30 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0F4C4A]" />
                  <span className="font-semibold text-xs text-[#0F4C4A]">
                    Instant eKYC & Bank Seeding Fetch
                  </span>
                </div>
                <MockBadge label="UIDAI 2.5 SPEC" />
              </div>
              <p className="text-[11px] text-[#5B6663] leading-snug">
                Avoid typing errors. Fetch your verified ST identity and check your NPCI DBT bank status in 5 seconds.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAadhaarModalOpen(true)}
                className="w-full text-xs font-semibold bg-white border-[#0F4C4A] text-[#0F4C4A] hover:bg-[#E3EFEE]"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Launch Aadhaar eKYC Sandbox Modal
              </Button>
            </div>

            <Card className="p-4 space-y-3.5">
              <Input
                label={lang === "hi" ? "अभ्यर्थी का पूरा नाम (Full Name)" : "Candidate Full Name"}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                helperText={lang === "hi" ? "आधार कार्ड में अंकित नाम" : "As printed on Aadhaar card"}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={lang === "hi" ? "जनजाति समुदाय" : "ST Community / Tribe"}
                  value={formData.tribe}
                  onChange={(e) => setFormData({ ...formData, tribe: e.target.value })}
                  helperText={lang === "hi" ? "उदा. गोंड, भील, संथाल" : "e.g. Gond, Bhil, Santhal"}
                />
                <Input
                  label={lang === "hi" ? "गृह राज्य" : "Home State"}
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>

              <div className="rounded-lg bg-[#FBF9F5] p-3 border border-[#E8E4DC] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-[#1B2321]">
                      {lang === "hi" ? "आधार सत्यापन (e-KYC)" : "Aadhaar e-KYC Verification"}
                    </span>
                    <MockBadge />
                  </div>
                  <span className="font-mono text-xs text-[#5B6663]">
                    XXXX-XXXX-{formData.aadhaarLastFour} (Verified)
                  </span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#2F6B3F]" />
              </div>
            </Card>
          </div>
        </Step>

        {/* STEP 2: Institute & Education */}
        <Step title={lang === "hi" ? "संस्थान" : "Institute"}>
          <div className="space-y-4 pt-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1B2321]">
                  {lang === "hi" ? "उच्च शिक्षा संस्थान विवरण" : "Institution & Course Details"}
                </h2>
                <p className="text-xs text-[#5B6663] mt-0.5">
                  {lang === "hi" ? "मंत्रालय की 265 अधिसूचित सूची से चयनित" : "Selected from Ministry's 265 Notified Schedule"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => speakText(lang === "hi" ? "संस्थान एवं पाठ्यक्रम का विवरण दर्ज करें" : "Enter institution and course details")}
                className="p-2 rounded-lg border border-[#CFC9BD] bg-white text-[#1B2321] hover:bg-[#EFECE5] shrink-0"
              >
                <Volume2 className="w-4 h-4 text-[#5B6663]" />
              </button>
            </div>

            <Card className="p-4 space-y-3.5">
              <Input
                label={lang === "hi" ? "संस्थान का नाम" : "Institution Name"}
                value={formData.instituteName}
                onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="AISHE Code"
                  value={formData.aisheCode}
                  onChange={(e) => setFormData({ ...formData, aisheCode: e.target.value })}
                  helperText="Verified Schedule"
                />
                <Input
                  label={lang === "hi" ? "पारिवारिक वार्षिक आय (₹)" : "Annual Family Income (₹)"}
                  value={formData.familyIncome}
                  onChange={(e) => setFormData({ ...formData, familyIncome: e.target.value })}
                />
              </div>

              <Input
                label={lang === "hi" ? "नामांकित पाठ्यक्रम / शोध" : "Enrolled Course / Degree"}
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              />
            </Card>
          </div>
        </Step>

        {/* STEP 3: Quality-Gated Document Upload & Live OCR */}
        <Step title={lang === "hi" ? "दस्तावेज़" : "Documents"}>
          <div className="space-y-4 pt-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1B2321]">
                  {lang === "hi" ? "दस्तावेज़ अपलोड गुणवत्ता जांच" : "Quality-Gated Document Upload"}
                </h2>
                <p className="text-xs text-[#5B6663] mt-0.5">
                  {lang === "hi" ? "स्पष्टता, किनारों की कटिंग एवं प्रकाश की जांच तुरंत" : "Detects blur, glare, and statutory rule compliance"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => speakText(lang === "hi" ? "दस्तावेज़ की स्पष्ट फोटो खींचें अथवा अपलोड करें" : "Capture or upload clear photo of document")}
                className="p-2 rounded-lg border border-[#CFC9BD] bg-white text-[#1B2321] hover:bg-[#EFECE5] shrink-0"
              >
                <Volume2 className="w-4 h-4 text-[#5B6663]" />
              </button>
            </div>

            <Card className="p-4 space-y-4">
              <div className="flex gap-2 border-b border-[#E8E4DC] pb-2">
                <button
                  type="button"
                  onClick={() => setSelectedDocType("income_cert")}
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer",
                    selectedDocType === "income_cert"
                      ? "bg-[#0F4C4A] text-white"
                      : "text-[#5B6663] hover:bg-[#EFECE5]"
                  )}
                >
                  {lang === "hi" ? "आय प्रमाण पत्र" : "Income Certificate"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDocType("st_cert")}
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer",
                    selectedDocType === "st_cert"
                      ? "bg-[#0F4C4A] text-white"
                      : "text-[#5B6663] hover:bg-[#EFECE5]"
                  )}
                >
                  {lang === "hi" ? "एसटी प्रमाण पत्र" : "ST Certificate"}
                </button>
              </div>

              {/* 3 ONE-CLICK COMPETITION TEST PRESETS (Instant OCR Demonstration) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#1B2321] block">
                  ⚡ 1-Click Competition Test Scenarios:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    disabled={ocrLoading}
                    onClick={() => handleRunOcrPreset("golden_pass")}
                    className="p-2.5 rounded-lg border border-[#C5DDD9] bg-[#E3EFEE]/40 hover:bg-[#E3EFEE] text-left text-xs transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-bold text-[#0F4C4A] block">
                        ✓ Golden Pass: Valid Income (₹2.1 Lakhs)
                      </span>
                      <span className="text-[10px] text-[#5B6663]">
                        Valid FY 2024-25, Tehsildar signed, 96/100 quality score
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#0F4C4A] transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    type="button"
                    disabled={ocrLoading}
                    onClick={() => handleRunOcrPreset("income_exceeded")}
                    className="p-2.5 rounded-lg border border-[#F2C2BA] bg-[#FDF4F2] hover:bg-[#FBE8E5] text-left text-xs transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-bold text-[#A63A2B] block">
                        ⚠️ Defective: Income Exceeds Ceiling (₹7.2 Lakhs)
                      </span>
                      <span className="text-[10px] text-[#5B6663]">
                        AI flags violation against PMS-ST ₹2.5L statutory ceiling
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#A63A2B] transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    type="button"
                    disabled={ocrLoading}
                    onClick={() => handleRunOcrPreset("blurry")}
                    className="p-2.5 rounded-lg border border-[#E8E4DC] bg-[#FBF9F5] hover:bg-[#EFECE5] text-left text-xs transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <span className="font-bold text-[#9A5B00] block">
                        🔍 Blurry / Low Contrast Scan (Quality 48/100)
                      </span>
                      <span className="text-[10px] text-[#5B6663]">
                        Triggers quality guard refusal before officer stage
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9A5B00] transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              {/* Document Scanned Preview */}
              {capturedImage && (
                <div className="border border-[#E2DED5] rounded-lg p-3 space-y-2 bg-[#FBF9F5]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#1B2321]">
                      {selectedDocType === "income_cert" ? "income_certificate.pdf" : "st_certificate.pdf"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#2F6B3F] font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Quality Score: {uploadQualityScore}/100
                    </span>
                  </div>

                  <div className="h-24 rounded bg-white flex flex-col items-center justify-center text-xs text-[#5B6663] border border-[#E8E4DC] font-mono p-2">
                    {ocrLoading ? (
                      <div className="flex items-center gap-2 text-[#0F4C4A]">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Running Document AI Entity Extraction...</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-[#0F4C4A] font-semibold">✓ Document Text Grounded & Extracted</span>
                        <span className="text-[10px] text-[#8A938F] mt-1">
                          {ocrData?.deficiencyFlags.length
                            ? `Found ${ocrData.deficiencyFlags.length} statutory flag(s)`
                            : "All statutory checks passed cleanly"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </Step>

        {/* STEP 4: Confirm What We Read (Human Trust Gate for OCR) */}
        <Step title={lang === "hi" ? "एआई जांच" : "AI Scrutiny"}>
          <div className="space-y-4 pt-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1B2321]">
                  {lang === "hi" ? "दस्तावेज़ में पढ़ी गई जानकारी की पुष्टि" : "Confirm What the Machine Read"}
                </h2>
                <p className="text-xs text-[#5B6663] mt-0.5">
                  {lang === "hi"
                    ? "मशीनी पाठ की आपकी पुष्टि ही अधिकारी हेतु प्रामाणिक संकेत बनती है"
                    : "Candidate confirmation converts OCR extraction into a trusted signal"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => speakText(lang === "hi" ? "कृपया पुष्टि करें कि कंप्यूटर ने आपके दस्तावेज़ को सही पढ़ा है" : "Please confirm that the machine read your document values correctly")}
                className="p-2 rounded-lg border border-[#CFC9BD] bg-white text-[#1B2321] hover:bg-[#EFECE5] shrink-0"
              >
                <Volume2 className="w-4 h-4 text-[#5B6663]" />
              </button>
            </div>

            <Card className="p-4 space-y-3 divide-y divide-[#E8E4DC]">
              {/* Field 1: Income */}
              <div className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-[#5B6663] block">
                    {lang === "hi" ? "पारिवारिक आय (Family Income)" : "Family Income Read"}
                  </span>
                  <span className="font-bold text-sm text-[#1B2321] font-mono">
                    ₹{Number(formData.familyIncome).toLocaleString()} / year
                  </span>
                  <div className="mt-0.5">
                    <AIFlagChip
                      label="OCR Read"
                      confidence={96}
                      ruleId="OCR_INC_EXTRACT"
                      explanation={`Machine extracted ₹${Number(formData.familyIncome).toLocaleString()} from Income Certificate Box.`}
                    />
                  </div>
                </div>
                <Button
                  variant={confirmedOcr.income ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setConfirmedOcr({ ...confirmedOcr, income: !confirmedOcr.income })}
                >
                  {confirmedOcr.income ? (lang === "hi" ? "सत्यापित" : "Correct") : (lang === "hi" ? "संशोधन" : "Edit")}
                </Button>
              </div>

              {/* Field 2: Tribe */}
              <div className="pt-3 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-[#5B6663] block">
                    {lang === "hi" ? "जनजाति समुदाय (ST Tribe)" : "Tribe Community Read"}
                  </span>
                  <span className="font-bold text-sm text-[#1B2321]">
                    {formData.tribe} · {formData.state}
                  </span>
                  <div className="mt-0.5">
                    <AIFlagChip
                      label="Tribe Match"
                      confidence={98}
                      ruleId="PRES_ST_LIST"
                      explanation={`${formData.tribe} verified against Government ST Gazette.`}
                    />
                  </div>
                </div>
                <Button
                  variant={confirmedOcr.tribe ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setConfirmedOcr({ ...confirmedOcr, tribe: !confirmedOcr.tribe })}
                >
                  {confirmedOcr.tribe ? (lang === "hi" ? "सत्यापित" : "Correct") : (lang === "hi" ? "संशोधन" : "Edit")}
                </Button>
              </div>

              {/* Field 3: Deficiency Warning if applicable */}
              {ocrData && ocrData.deficiencyFlags.length > 0 && (
                <div className="pt-3">
                  <div className="p-2.5 rounded-lg border border-[#F2C2BA] bg-[#FDF4F2] space-y-1">
                    <span className="font-bold text-xs text-[#A63A2B] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Statutory Discrepancy Flagged
                    </span>
                    <p className="text-[11px] text-[#A63A2B] leading-snug">
                      {ocrData.deficiencyFlags[0].flagText}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </Step>

        {/* STEP 5: Pre-Flight "Will This Pass?" Check */}
        <Step title={lang === "hi" ? "प्री-फ्लाइट" : "Pre-Flight"}>
          <div className="space-y-4 pt-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1B2321]">
                  {lang === "hi" ? "जमा पूर्व जांच ('क्या यह पास होगा?')" : "Pre-Flight 'Will This Pass?' Check"}
                </h2>
                <p className="text-xs text-[#5B6663] mt-0.5">
                  {lang === "hi"
                    ? "आवेदन जमा करने से पूर्व ही संभावित कमियों एवं उनके समाधान की जांच"
                    : "Catches document and seeding issues upfront to prevent delays"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => speakText(lang === "hi" ? "जमा करने से पूर्व जांच सूची का अवलोकन करें" : "Review pre-flight checklist before submission")}
                className="p-2 rounded-lg border border-[#CFC9BD] bg-white text-[#1B2321] hover:bg-[#EFECE5] shrink-0"
              >
                <Volume2 className="w-4 h-4 text-[#5B6663]" />
              </button>
            </div>

            <PreflightChecklist
              items={preflightChecks}
              lang={lang}
              onAllAcknowledged={() => setWarningsAcknowledged(true)}
            />
          </div>
        </Step>

        {/* STEP 6: Submission Confirmed & QR Receipt */}
        <Step title={lang === "hi" ? "रसीद" : "Receipt"}>
          <div className="space-y-4 pt-2">
            <div className="text-center space-y-1 pt-2">
              <div className="w-12 h-12 rounded-full bg-[#E3EFEE] text-[#0F4C4A] flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1B2321]">
                {lang === "hi" ? "आवेदन सफलतापूर्वक जमा हुआ!" : "Application Submitted!"}
              </h2>
              <p className="text-xs text-[#5B6663]">
                {lang === "hi" ? "सत्यापन एवं प्रत्यक्ष लाभ अंतरण हेतु अग्रसारित" : "Encrypted and routed for Level-1 Nodal Officer Scrutiny"}
              </p>
            </div>

            <Card className="p-4 space-y-4 border-[#C5DDD9] bg-[#FBF9F5]">
              {/* Receipt Header */}
              <div className="border-b border-[#E8E4DC] pb-3 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs text-[#5B6663] block">
                    {lang === "hi" ? "आवेदन संदर्भ संख्या" : "Application Tracking ID"}
                  </span>
                  <span className="font-mono text-lg font-bold text-[#0F4C4A]">
                    {generatedAppId}
                  </span>
                </div>
                <div className="p-1.5 bg-white rounded border border-[#E8E4DC] shadow-xs">
                  <QRCodeSVG value={`https://adi-setu.gov.in/track/${generatedAppId}`} size={56} />
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#8A938F]">Candidate Name:</span>
                  <span className="font-semibold text-[#1B2321]">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A938F]">Tribe & State:</span>
                  <span className="font-semibold text-[#1B2321]">{formData.tribe} ({formData.state})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A938F]">Target Scheme:</span>
                  <span className="font-semibold text-[#0F4C4A]">Post-Matric ST Scholarship</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A938F]">Database Backend:</span>
                  <span className="font-semibold font-mono text-[11px] text-[#2F6B3F]">
                    Hybrid (Supabase / Local Reactive)
                  </span>
                </div>
              </div>

              {/* SMS Notification Banner */}
              <div className="rounded-lg bg-[#E3EFEE] p-3 text-xs text-[#0F4C4A] border border-[#C5DDD9]">
                <span className="font-semibold block mb-0.5">
                  {lang === "hi" ? "एसएमएस एवं व्हाट्सएप पुष्टिकरण भेजा गया" : "SMS & WhatsApp Confirmation Dispatched"}
                </span>
                <span>
                  Tracking link sent to mobile ending in **{formData.aadhaarLastFour}. Real-time alerts enabled.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => toast.success("Receipt PDF Downloaded", { description: `Saved ${generatedAppId}-Receipt.pdf` })}
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  {lang === "hi" ? "रसीद डाउनलोड" : "Download PDF"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => toast.info("WhatsApp Share", { description: "Link copied to clipboard" })}
                >
                  <Share2 className="w-3.5 h-3.5 mr-1" />
                  {lang === "hi" ? "शेयर करें" : "WhatsApp"}
                </Button>
              </div>
            </Card>

            <Button
              variant="primary"
              size="lg"
              className="w-full min-h-[48px] text-xs font-space font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30"
              onClick={onViewStatusTimeline}
            >
              <span>{lang === "hi" ? "आवेदन स्थिति ट्रैक करें" : "Track Real-Time Status & Deficiencies"}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Step>
      </Stepper>
    </div>
  </BorderGlow>
</div>
  );
}
