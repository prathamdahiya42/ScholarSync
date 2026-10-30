"use client";

import * as React from "react";
import { Check, ArrowRight, Sparkles, BookOpen, FileCheck, Globe, GraduationCap, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ALL_MOTA_SCHEMES, MoTAScheme } from "@/lib/schemes";
import { cn } from "@/lib/utils";

interface EligibilityCheckerProps {
  onStartApplication: (schemeId: string) => void;
  lang?: "en" | "hi";
}

const QUESTIONS = [
  {
    id: "category",
    titleEn: "Do you belong to a Scheduled Tribe (ST) or PVTG community?",
    titleHi: "क्या आप अनुसूचित जनजाति (ST) अथवा PVTG समुदाय से संबंधित हैं?",
    options: [
      { id: "st", labelEn: "Yes, I hold an official ST Certificate", labelHi: "हाँ, मेरे पास आधिकारिक एसटी प्रमाण पत्र है" },
      { id: "pvtg", labelEn: "Yes, Particularly Vulnerable Tribal Group (PVTG)", labelHi: "हाँ, विशेष रूप से कमजोर जनजातीय समूह (PVTG)" },
      { id: "no", labelEn: "No / General / Other Category", labelHi: "नहीं / अन्य श्रेणी" },
    ],
  },
  {
    id: "level",
    titleEn: "What level of education are you pursuing or admitted to?",
    titleHi: "आप शिक्षा के किस स्तर में अध्ययनरत या प्रवेशित हैं?",
    options: [
      { id: "overseas", labelEn: "Master's / Ph.D. Abroad (Top 1000 QS Universities)", labelHi: "विदेश में स्नातकोत्तर / पीएचडी (शीर्ष 1000 QS रैंकिंग संस्थान)" },
      { id: "phd_india", labelEn: "Regular M.Phil / Ph.D in India (National Fellowship)", labelHi: "भारत में नियमित एम.फिल / पीएचडी (राष्ट्रीय फैलोशिप)" },
      { id: "top_class", labelEn: "UG / PG Degree in Premier Notified Institutes (IITs, NITs, IIMs, etc.)", labelHi: "265 अधिसूचित शीर्ष संस्थानों में स्नातक / स्नातकोत्तर (Top Class)" },
      { id: "post_matric", labelEn: "Class 11, 12, Polytechnic Diploma, or State University Degree", labelHi: "कक्षा 11, 12, डिप्लोमा अथवा राज्य विश्वविद्यालय (Post-Matric)" },
    ],
  },
  {
    id: "income",
    titleEn: "What is your gross annual family income from all sources?",
    titleHi: "सभी स्रोतों से आपकी कुल वार्षिक पारिवारिक आय कितनी है?",
    options: [
      { id: "under_250k", labelEn: "Up to ₹2,50,000 / year", labelHi: "₹2,50,000 प्रति वर्ष तक" },
      { id: "under_600k", labelEn: "Between ₹2,50,001 and ₹6,00,000 / year", labelHi: "₹2,50,001 से ₹6,00,000 प्रति वर्ष" },
      { id: "above_600k", labelEn: "Above ₹6,00,000 / year", labelHi: "₹6,00,000 प्रति वर्ष से अधिक" },
    ],
  },
  {
    id: "marks",
    titleEn: "What percentage did you score in your qualifying final examination?",
    titleHi: "आपकी अंतिम उत्तीर्ण परीक्षा में कितने प्रतिशत अंक हैं?",
    options: [
      { id: "above_55", labelEn: "55% or higher (or equivalent CGPA)", labelHi: "55% या उससे अधिक" },
      { id: "below_55", labelEn: "Below 55% / Passed Matriculation", labelHi: "55% से कम / उत्तीर्ण" },
    ],
  },
];

export function PublicEligibilityChecker({
  onStartApplication,
  lang = "en",
}: EligibilityCheckerProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [completed, setCompleted] = React.useState(false);

  const question = QUESTIONS[currentStep];

  const handleSelectOption = (optId: string) => {
    const updated = { ...answers, [question.id]: optId };
    setAnswers(updated);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  // Determine matched scheme from the 4 official MoTA schemes:
  let matchedSchemeId = "PMS-ST";
  if (answers.category === "st" || answers.category === "pvtg") {
    if (answers.level === "overseas") {
      matchedSchemeId = "NOS-ST";
    } else if (answers.level === "phd_india") {
      matchedSchemeId = "NFST";
    } else if (answers.level === "top_class") {
      matchedSchemeId = "NS-TOPCLASS-ST";
    } else {
      matchedSchemeId = "PMS-ST";
    }
  }

  const matchedScheme: MoTAScheme =
    ALL_MOTA_SCHEMES.find((s) => s.id === matchedSchemeId) || ALL_MOTA_SCHEMES[0];

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-4">
      <div className="mb-6 text-center space-y-1.5">
        <span className="font-space text-xs uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-900/60 px-3.5 py-1 rounded-full font-bold">
          {lang === "hi" ? "सार्वजनिक पात्रता जांच" : "Public Eligibility Checker"}
        </span>
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
          {lang === "hi" ? "जानिए आप किस योजना के पात्र हैं" : "Discover Your Matched Tribal Scheme"}
        </h2>
        <p className="font-sans text-xs sm:text-sm text-stone-600 dark:text-stone-300">
          {lang === "hi"
            ? "बिना लॉगिन 4 सरल प्रश्नों में 4 केंद्रीय एवं राज्य योजनाओं में से अपनी पात्रता जांचें"
            : "No login needed. Answer 4 questions to match across all 4 official MoTA schemes."}
        </p>
      </div>

      {!completed ? (
        <Card className="p-5 md:p-6 shadow-xs border-red-100 dark:border-red-950 bg-white/95 dark:bg-[#160F14]/95">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-4 pb-2 border-b border-red-100 dark:border-red-950 font-space">
            <span>
              {lang === "hi"
                ? `प्रश्न ${currentStep + 1} / ${QUESTIONS.length}`
                : `Question ${currentStep + 1} of ${QUESTIONS.length}`}
            </span>
            <div className="flex gap-1.5">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 w-7 rounded-full transition-colors",
                    i <= currentStep ? "bg-red-600" : "bg-red-100 dark:bg-red-950"
                  )}
                />
              ))}
            </div>
          </div>

          <h3 className="font-space text-lg font-bold text-stone-900 dark:text-white mb-5 leading-snug">
            {lang === "hi" ? question.titleHi : question.titleEn}
          </h3>

          <div className="space-y-3">
            {question.options.map((opt) => {
              const isSelected = answers[question.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer font-sans",
                    isSelected
                      ? "border-red-600 bg-red-50/90 dark:bg-red-950/70 text-red-700 dark:text-red-200 font-bold shadow-xs"
                      : "border-red-100 dark:border-red-950 bg-white dark:bg-[#160F14] text-stone-800 dark:text-stone-200 hover:bg-red-50/40 dark:hover:bg-red-950/30"
                  )}
                >
                  <span>{lang === "hi" ? opt.labelHi : opt.labelEn}</span>
                  {isSelected && <Check className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>

          {currentStep > 0 && (
            <div className="mt-5 pt-3 border-t border-red-100 dark:border-red-950 flex justify-between font-space">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-xs text-stone-600 hover:text-red-600"
              >
                {lang === "hi" ? "पिछला प्रश्न" : "Previous Question"}
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-6 border-t-4 border-t-red-600 border-red-200 dark:border-red-900/80 bg-white/95 dark:bg-[#160F14]/95 shadow-md space-y-5">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wide font-space">
            <Check className="w-4 h-4 bg-emerald-100 dark:bg-emerald-950 p-0.5 rounded-full stroke-[3]" />
            <span>Eligibility Verified · 100% Match Found</span>
          </div>

          <div>
            <span className="font-code text-xs font-bold text-red-600 dark:text-red-400 uppercase bg-red-50 dark:bg-red-950 px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-900">
              {matchedScheme.id} · {matchedScheme.type}
            </span>
            <h3 className="font-editorial text-2xl font-bold text-stone-900 dark:text-white mt-1.5">
              {matchedScheme.name}
            </h3>
            <p className="text-xs font-space text-stone-500 dark:text-stone-400 mt-1">
              Target Level: {matchedScheme.level}
            </p>
          </div>

          {/* Scheme Specific Rules Preview */}
          <div className="rounded-xl bg-red-50/30 dark:bg-[#1E1218] p-4 border border-red-100 dark:border-red-950 text-xs space-y-2 font-sans">
            <div className="flex justify-between border-b border-red-100 dark:border-red-950 pb-1.5">
              <span className="text-stone-500 font-space">Income Criterion:</span>
              <span className="font-bold text-stone-900 dark:text-white font-code">
                {matchedScheme.eligibility.income_ceiling_inr_per_year
                  ? `₹${matchedScheme.eligibility.income_ceiling_inr_per_year.toLocaleString()} Ceiling`
                  : "No Income Limit"}
              </span>
            </div>
            <div className="flex justify-between border-b border-red-100 dark:border-red-950 pb-1.5">
              <span className="text-stone-500 font-space">Portal Rail:</span>
              <span className="font-code font-bold text-red-600 dark:text-red-400">
                {matchedScheme.portal}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block mb-1 font-space">Key Documents Required:</span>
              <ul className="grid grid-cols-2 gap-1.5 text-[11px] text-stone-800 dark:text-stone-200">
                {matchedScheme.documents.slice(0, 4).map((d) => (
                  <li key={d.id} className="flex items-center gap-1.5 font-sans">
                    <FileCheck className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                    <span className="truncate">{d.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 font-space">
            <Button
              variant="primary"
              size="lg"
              className="flex-1 min-h-[48px] bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/30"
              onClick={() => onStartApplication(matchedScheme.id)}
            >
              <span>{lang === "hi" ? "इस योजना में आवेदन करें" : "Apply for This Scheme"}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="font-bold border-red-200 dark:border-red-900 text-stone-700 dark:text-stone-200 hover:bg-red-50 dark:hover:bg-red-950/40"
              onClick={() => {
                setCompleted(false);
                setCurrentStep(0);
                setAnswers({});
              }}
            >
              {lang === "hi" ? "पुनः जांचें" : "Re-Check"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
