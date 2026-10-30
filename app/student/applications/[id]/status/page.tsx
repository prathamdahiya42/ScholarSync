'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/context';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Building,
  ShieldCheck,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function ApplicationStatusTrackerPage() {
  const { id } = useParams() as { id: string };
  const { t } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
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
      .catch((err) => toast.error('Failed to load status'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading || !appData) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-slate-500">
        Loading status tracker...
      </div>
    );
  }

  const { status, submittedAt, decidedAt, decisionReason, defectiveNotes, reviews } = appData;

  const steps = [
    { key: 'DRAFT', label: 'Draft Created' },
    { key: 'DOCS_IN_PROGRESS', label: 'Docs Verified' },
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'UNDER_REVIEW', label: 'Officer Review' },
    {
      key: status === 'DEFECTIVE' ? 'DEFECTIVE' : status === 'REJECTED' ? 'REJECTED' : 'APPROVED',
      label: status === 'DEFECTIVE' ? 'Defective' : status === 'REJECTED' ? 'Rejected' : 'Approved'
    }
  ];

  const getStepState = (stepKey: string) => {
    const order = ['DRAFT', 'DOCS_IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED'];
    const currentIdx = order.indexOf(status);
    const thisIdx = order.indexOf(stepKey);

    if (status === 'DEFECTIVE' && stepKey === 'DEFECTIVE') return 'defective';
    if (status === 'REJECTED' && stepKey === 'REJECTED') return 'rejected';
    if (status === 'APPROVED' && stepKey === 'APPROVED') return 'approved';

    if (currentIdx >= thisIdx && currentIdx !== -1) return 'completed';
    return 'pending';
  };

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Tracker Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm glow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-500">Application Status Tracker</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {appData.id}
            </h1>
            <span className="text-xs text-slate-600 mt-1 block">
              {config ? t(config.name) : appData.scholarshipId}
            </span>
          </div>

          <div className="shrink-0">
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
              status === 'APPROVED'
                ? 'bg-red-50 text-[#D62828] border border-red-200'
                : status === 'DEFECTIVE'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : status === 'REJECTED'
                ? 'bg-slate-100 text-slate-800 border border-slate-200'
                : 'bg-red-50 text-[#D62828] border border-red-100'
            }`}>
              {status === 'APPROVED' && <CheckCircle2 className="w-4 h-4 text-[#D62828]" />}
              {status === 'DEFECTIVE' && <AlertTriangle className="w-4 h-4" />}
              {status === 'REJECTED' && <XCircle className="w-4 h-4" />}
              {['SUBMITTED', 'UNDER_REVIEW'].includes(status) && <Clock className="w-4 h-4 text-[#D62828]" />}
              <span>{status.replace('_', ' ')}</span>
            </span>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="py-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0" />
            {steps.map((st, i) => {
              const state = getStepState(st.key);
              return (
                <div key={st.key} className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    state === 'approved' || state === 'completed'
                      ? 'bg-[#D62828] text-white shadow-md shadow-red-600/30'
                      : state === 'defective'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : state === 'rejected'
                      ? 'bg-slate-800 text-white shadow-md shadow-slate-800/30'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {state === 'completed' || state === 'approved' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-700 mt-2 text-center max-w-[70px]">
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decision & Notice Box */}
        {status === 'APPROVED' && (
          <div className="p-6 rounded-2xl bg-red-50/60 border border-red-200 text-slate-900 space-y-2 glow-card">
            <div className="flex items-center gap-2 font-bold text-base text-[#D62828]">
              <CheckCircle2 className="w-5 h-5 text-[#D62828]" />
              <span>Application Verified & Approved</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-700">
              Your application has been manually verified by the State/UT nodal officer. The scholarship grant will be disbursed via Direct Benefit Transfer (DBT) directly into your Aadhaar-linked bank account ({appData.student.bankAccountMasked}).
            </p>
            <div className="text-[11px] font-semibold text-[#D62828] pt-1">
              Decided by: {appData.decidedBy || 'Officer'} on {new Date(decidedAt).toLocaleDateString()}
            </div>
          </div>
        )}

        {status === 'DEFECTIVE' && (
          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3 glow-card">
            <div className="flex items-center gap-2 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Action Required: Application Marked Defective</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-amber-200 text-xs">
              <strong className="block mb-1 text-slate-800">Reviewer's Note:</strong>
              <p className="font-medium text-amber-900">{defectiveNotes}</p>
            </div>
            <p className="text-xs text-amber-800">
              Please click below to replace or correct the requested document(s).
            </p>
            <div className="pt-2">
              <button
                onClick={() => router.push(`/student/applications/${id}/documents`)}
                className="py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Fix & Re-upload Documents</span>
              </button>
            </div>
          </div>
        )}

        {status === 'REJECTED' && (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 space-y-2 glow-card">
            <div className="flex items-center gap-2 font-bold text-base text-slate-800">
              <XCircle className="w-5 h-5 text-slate-600" />
              <span>Application Rejected</span>
            </div>
            <p className="text-xs text-slate-700">
              Reason: <strong>{decisionReason || 'Eligibility criteria not met.'}</strong>
            </p>
          </div>
        )}

        {['SUBMITTED', 'UNDER_REVIEW'].includes(status) && (
          <div className="p-5 rounded-2xl bg-red-50/40 border border-red-100 text-xs text-slate-800 space-y-1 glow-card">
            <div className="font-bold flex items-center gap-2 text-[#D62828]">
              <Clock className="w-4 h-4 text-[#D62828]" />
              <span>In Queue for Verification</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              Your documents have passed automated quality checks and are currently awaiting review by the designated verification officer. You will receive an SMS and WhatsApp notification upon decision.
            </p>
          </div>
        )}
      </div>

      {/* Back to Catalog */}
      <div className="flex items-center justify-between text-xs">
        <Link
          href="/student/catalog"
          className="font-semibold text-[#D62828] hover:underline flex items-center gap-1"
        >
          <span>← Browse More Scholarships</span>
        </Link>
        <Link
          href="/student/notifications"
          className="font-semibold text-slate-500 hover:text-[#D62828] transition-colors"
        >
          View Notification History →
        </Link>
      </div>
    </div>
  );
}
