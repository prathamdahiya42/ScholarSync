'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/context';
import { toast } from 'sonner';
import {
  FileCheck,
  User,
  CheckCircle2,
  FileText,
  Banknote,
  Send,
  AlertCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';

export default function ApplicationReviewPage() {
  const { id } = useParams() as { id: string };
  const { t } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [appData, setAppData] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/applications/${id}`)
      .then((res) => {
        if (res.status === 401) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && !data.error) {
          setAppData(data.application);
          setConfig(data.config);
        }
      })
      .catch((err) => toast.error('Failed to load application summary'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${id}/submit`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success('Application submitted successfully to management review queue!');
      router.push(`/student/applications/${id}/status`);
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !appData || !config) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-slate-500">
        Loading summary review...
      </div>
    );
  }

  const { student, documents, benefitRate } = appData;
  let parsedBenefit = null;
  try {
    parsedBenefit = JSON.parse(benefitRate || '{}');
  } catch (e) {}

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-[#D62828] uppercase tracking-wider">
            Step 3 of 4: Final Review & Submit
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Application Summary ({appData.id})
          </h1>
          <p className="text-xs text-slate-500">
            Please review your self-declaration and uploaded certificates before final submission.
          </p>
        </div>

        <button
          onClick={() => router.push(`/student/applications/${id}/documents`)}
          className="text-xs font-semibold text-slate-600 hover:text-[#D62828] flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Documents</span>
        </button>
      </div>

      {/* 1. Student Profile Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm glow-card">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-[#D62828]" />
          Student Information
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Full Name</span>
            <strong className="text-slate-900">{student.fullName}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Father's Name</span>
            <strong className="text-slate-900">{student.fatherName}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Social Category</span>
            <strong className="text-[#D62828] font-bold">{student.socialCategory}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Domicile State / District</span>
            <strong className="text-slate-900">{student.domicileState}, {student.district}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Class & School</span>
            <strong className="text-slate-900">{student.currentClass} - {student.schoolName}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Disbursal Account (Masked)</span>
            <strong className="text-slate-900 font-mono">{student.bankAccountMasked} ({student.ifsc})</strong>
          </div>
        </div>
      </div>

      {/* 2. Calculated Benefit Entitlement */}
      {parsedBenefit && (
        <div className="bg-red-50/50 border border-red-200 rounded-2xl p-6 glow-card">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-[#D62828]" />
            Estimated Scholarship Entitlement
          </h2>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div>
              <span className="text-xs text-slate-700">
                Rate category: <strong className="capitalize">{parsedBenefit.category}</strong> (10 Months)
              </span>
              <div className="text-2xl font-black text-[#D62828] mt-0.5">
                ₹{parsedBenefit.total?.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500">/ academic year</span>
              </div>
            </div>
            <div className="text-xs text-slate-700 space-y-0.5">
              <div>Maintenance Allowance: ₹{parsedBenefit.annual}</div>
              <div>Books & Ad-hoc Grant: ₹{parsedBenefit.booksGrant}</div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Uploaded Certificates Verification Status */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm glow-card">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[#D62828]" />
          Verified Documents ({documents.length})
        </h2>
        <div className="divide-y divide-slate-100 text-xs">
          {documents.map((doc: any) => {
            const check = doc.aiChecks?.[0];
            return (
              <div key={doc.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="font-bold text-slate-900 capitalize block">
                      {doc.docTypeId.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {doc.fileName} (v{doc.version})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    check?.status === 'PASS'
                      ? 'bg-red-50 text-[#D62828] border border-red-200'
                      : check?.status === 'WARN'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {check?.status || 'PENDING'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit Action Box */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg glow-card border border-slate-800">
        <div>
          <h3 className="text-base font-bold">Ready to Submit for Official Review</h3>
          <p className="text-xs text-slate-400 mt-1">
            Once submitted, your application will enter the management queue for manual verification.
          </p>
        </div>

        <button
          onClick={handleFinalSubmit}
          disabled={submitting}
          className="py-3 px-6 rounded-xl bg-[#D62828] hover:bg-[#B91C1C] disabled:opacity-50 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-red-600/30 shrink-0 active:scale-[0.98]"
        >
          <Send className="w-4 h-4" />
          <span>{submitting ? 'Submitting...' : 'Confirm & Submit Application'}</span>
        </button>
      </div>
    </div>
  );
}
