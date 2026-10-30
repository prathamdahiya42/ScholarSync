'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/context';
import { toast } from 'sonner';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle,
  Clock,
  Landmark,
  Banknote
} from 'lucide-react';

export default function ScholarshipCatalogPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    studentCategory: string;
    applicable: any[];
    notForCategory: any[];
  }>({
    studentCategory: '',
    applicable: [],
    notForCategory: []
  });

  useEffect(() => {
    fetch('/api/scholarships')
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
      .catch((err) => toast.error('Failed to load scholarships'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-500">
        Loading scholarship schemes...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#D62828] via-[#B91C1C] to-[#991B1B] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden glow-card border border-red-700/40">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3 border border-white/30 backdrop-blur-md">
            <GraduationCap className="w-4 h-4" />
            <span>ScholarSync • Academic Year 2026-27 Active Schemes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Central & State Tribal Scholarship Schemes
          </h1>
          <p className="text-red-100 text-sm mt-2 leading-relaxed">
            Government of India scholarships for tribal and eligible students. Verify eligibility with our transparent AI assistant and submit directly for manual officer verification.
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs">
            <span className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-md font-medium border border-white/20">
              Registered Category: <strong className="text-white underline">{data.studentCategory || 'ST'}</strong>
            </span>
          </div>
        </div>
        <div className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 items-center justify-center">
          <img
            src="/ScholarSync.png"
            alt="ScholarSync"
            className="h-24 w-auto object-contain rounded-2xl bg-white p-2 shadow-xl border border-white/20"
          />
        </div>
      </div>

      {/* 1. Applicable Scholarships for Current Category */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#D62828]" />
            Scholarships Open for Your Category ({data.studentCategory})
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-[#D62828] border border-red-200">
            {data.applicable.length} Scheme{data.applicable.length === 1 ? '' : 's'} Available
          </span>
        </div>

        {data.applicable.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-300 text-center text-slate-500 bg-white glow-card">
            No active scholarships match your current profile category. Check the section below.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.applicable.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between group glow-card transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-[#D62828] border border-red-100">
                      {scheme.provider?.schemeType || 'Central Scheme'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      AY {scheme.academicYear}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#D62828] transition-colors">
                    {t(scheme.name)}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {t(scheme.shortDescription)}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Landmark className="w-3.5 h-3.5 text-[#D62828]" />
                      <span>{scheme.provider?.ministry}</span>
                    </div>
                    {scheme.eligibility?.income?.limitInr && (
                      <div className="flex items-center gap-2">
                        <Banknote className="w-3.5 h-3.5 text-[#D62828]" />
                        <span>Income ceiling: &le; ₹{scheme.eligibility.income.limitInr.toLocaleString()}/yr</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Link
                    href={`/student/scholarships/${scheme.id}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#D62828] hover:bg-[#B91C1C] text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
                  >
                    <span>Check Details & Eligibility</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Transparent "Not for your category" Section */}
      {data.notForCategory.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Other Schemes (Not Applicable for Category: {data.studentCategory})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These schemes are restricted to other social categories as per central government statutory guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.notForCategory.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-[#F8F9FB] rounded-2xl border border-slate-200 p-5 glow-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    Category Gated ({scheme.categoryRule?.mode})
                  </span>
                  <span className="text-xs text-slate-400">{scheme.academicYear}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-800">
                  {t(scheme.name)}
                </h3>

                <div className="mt-3 p-3 rounded-xl bg-red-50/60 border border-red-100 text-xs text-[#B91C1C]">
                  <strong>Why not applicable:</strong> {t(scheme.categoryReason)}
                </div>

                <div className="mt-4">
                  <Link
                    href={`/student/scholarships/${scheme.id}`}
                    className="inline-block text-xs font-semibold text-[#D62828] hover:text-[#B91C1C] underline"
                  >
                    View scheme guidelines anyway →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
