'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/context';
import { toast } from 'sonner';
import {
  GraduationCap,
  Building2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Banknote,
  Calendar,
  Users,
  Info,
  ArrowRight,
  ShieldCheck,
  XCircle
} from 'lucide-react';

export default function ScholarshipDetailsPage() {
  const { id } = useParams() as { id: string };
  const { t } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<{
    config: any;
    isCategoryEligible: boolean;
    categoryNote?: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/scholarships/${id}`)
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((resData) => {
        if (resData) setData(resData);
      })
      .catch((err) => toast.error('Failed to load scholarship details'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleStartEligibility = async () => {
    if (!data?.isCategoryEligible) {
      toast.error(data?.categoryNote || 'You are not eligible under the category rule.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scholarshipId: id })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);

      router.push(`/student/applications/${resData.applicationId}/questionnaire`);
    } catch (err: any) {
      toast.error(err.message || 'Could not start application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !data?.config) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        Loading scholarship details...
      </div>
    );
  }

  const { config, isCategoryEligible, categoryNote } = data;

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Category Ineligibility Warning Banner if applicable */}
      {!isCategoryEligible && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 glow-card">
          <XCircle className="w-5 h-5 text-[#D62828] mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-bold">Category Restriction</h3>
            <p className="text-xs mt-1 leading-relaxed">{categoryNote}</p>
          </div>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm glow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-red-50 text-[#D62828] border border-red-100">
            {config.provider?.schemeType || 'Scholarship Scheme'}
          </span>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Academic Year: <strong>{config.academicYear}</strong></span>
            <span>•</span>
            <span className="capitalize">Status: <strong className="text-[#D62828]">{config.status}</strong></span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          {t(config.name)}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
          {t(config.shortDescription)}
        </p>

        {/* Start Button */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 block">Step 1 of 4: Eligibility Check</span>
            <span className="text-xs font-semibold text-slate-800">
              Interactive Yes/No Questionnaire
            </span>
          </div>
          <button
            onClick={handleStartEligibility}
            disabled={!isCategoryEligible || submitting}
            className="py-3 px-6 rounded-xl bg-[#D62828] hover:bg-[#B91C1C] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-md shadow-red-600/20 active:scale-[0.98]"
          >
            <span>{submitting ? 'Starting...' : 'Check My Eligibility'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Who is Giving It & Funding Split */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm glow-card">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#D62828]" />
          Who Provides This Scholarship
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#F8F9FB] border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Funder / Ministry:</span>
            <p className="text-slate-600">{config.provider?.ministry}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8F9FB] border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Implementing Authority:</span>
            <p className="text-slate-600">{config.provider?.implementedBy}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8F9FB] border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Disbursal Mode:</span>
            <p className="text-slate-600">{config.provider?.disbursal}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8F9FB] border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Centre / State Funding Pattern:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
              {config.provider?.fundingPattern?.map((fp: any, idx: number) => (
                <li key={idx}>
                  {fp.appliesTo}: {fp.centrePercent}% Centre, {fp.statePercent}% State
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Who is NOT Giving It (Important clarification) */}
      {config.notProviders && config.notProviders.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6 shadow-sm glow-card">
          <h2 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Who is NOT Giving This (Common Confusion Points)
          </h2>
          <p className="text-xs text-amber-800/80 mb-3">
            To prevent confusion, students should note that the following entities do NOT fund this scheme:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {config.notProviders.map((np: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-white/70 border border-amber-200/60">
                <span className="font-bold text-slate-900 block">{np.name}</span>
                <p className="text-slate-600 text-[11px] mt-0.5">{np.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Eligibility Criteria */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm glow-card">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#D62828]" />
          Official Eligibility Criteria
        </h2>
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Age Rule */}
            <div className="p-3.5 rounded-xl bg-[#F8F9FB] border border-slate-100">
              <span className="font-bold text-slate-800 block mb-0.5">Maximum / Minimum Age Limit:</span>
              <p className="text-[#D62828] font-semibold">
                {config.eligibility?.age?.max === null && config.eligibility?.age?.min === null
                  ? 'No age limit set by the Ministry (a State may add its own rule)'
                  : `Min: ${config.eligibility?.age?.min || 'None'}, Max: ${config.eligibility?.age?.max || 'None'}`}
              </p>
              <span className="text-[10px] text-slate-500 block mt-1">{config.eligibility?.age?.note}</span>
            </div>

            {/* Minimum Marks */}
            <div className="p-3.5 rounded-xl bg-[#F8F9FB] border border-slate-100">
              <span className="font-bold text-slate-800 block mb-0.5">Minimum Marks Requirement:</span>
              <p className="text-[#D62828] font-semibold">
                {config.eligibility?.minimumMarks?.freshApplicants === null
                  ? 'No minimum marks requirement for fresh applicants'
                  : config.eligibility?.minimumMarks?.freshApplicants || 'Passing grades'}
              </p>
              <span className="text-[10px] text-slate-500 block mt-1">
                {config.eligibility?.minimumMarks?.renewal || config.eligibility?.minimumMarks?.note}
              </span>
            </div>
          </div>

          {/* Income Rule */}
          {config.eligibility?.income && (
            <div className="p-4 rounded-xl bg-red-50/50 border border-red-200">
              <span className="font-bold text-slate-900 text-sm block mb-1">
                Family Income Ceiling: &le; ₹{config.eligibility.income.limitInr?.toLocaleString()} per year
              </span>
              <p className="text-slate-700 text-xs mb-2">
                {config.eligibility.income.definition}
              </p>
              <span className="text-[11px] font-bold text-slate-600 block mb-1">How Income is Counted:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-xs">
                {config.eligibility.income.howCounted?.map((rule: string, idx: number) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 4. Benefits */}
      {config.benefits && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm glow-card">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-[#D62828]" />
            Scholarship Entitlements & Benefits (Rates)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="font-bold text-slate-800 text-sm block mb-2">
                Day Scholar Rates:
              </span>
              <div className="space-y-1 text-slate-600">
                {config.benefits.rates?.dayScholar?.monthly && (
                  <div>Monthly Allowance: <strong>₹{config.benefits.rates.dayScholar.monthly}</strong> (for 10 months)</div>
                )}
                <div>Annual Scholarship: <strong>₹{config.benefits.rates?.dayScholar?.annual}</strong></div>
                <div>Books & Ad-hoc Grant: <strong>₹{config.benefits.rates?.dayScholar?.booksAndAdhocGrant}</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-red-100 bg-red-50/30">
              <span className="font-bold text-[#D62828] text-sm block mb-2">
                Hosteller Rates:
              </span>
              <div className="space-y-1 text-slate-600">
                {config.benefits.rates?.hosteller?.monthly && (
                  <div>Monthly Allowance: <strong>₹{config.benefits.rates.hosteller.monthly}</strong> (for 10 months)</div>
                )}
                <div>Annual Scholarship: <strong>₹{config.benefits.rates?.hosteller?.annual}</strong></div>
                <div>Books & Ad-hoc Grant: <strong>₹{config.benefits.rates?.hosteller?.booksAndAdhocGrant}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Required Documents Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm glow-card">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#D62828]" />
          Required Documents Checklist
        </h2>
        <div className="divide-y divide-slate-100 text-xs">
          {config.documents?.map((doc: any) => (
            <div key={doc.id} className="py-2.5 flex items-start justify-between gap-3">
              <div>
                <span className="font-semibold text-slate-900 block">
                  {t(doc.label)}
                </span>
                <span className="text-[11px] text-slate-500">
                  {t(doc.studentTip) || 'Official document copy in PDF or Image format.'}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                doc.requiredUnless || doc.requiredIf
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-50 text-[#D62828] border border-red-200'
              }`}>
                {doc.requiredUnless || doc.requiredIf ? 'Conditional' : 'Mandatory'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
