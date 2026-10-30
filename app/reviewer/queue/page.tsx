'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/context';
import { toast } from 'sonner';
import {
  FileCheck,
  Clock,
  AlertCircle,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  ShieldCheck
} from 'lucide-react';

export default function ReviewerQueuePage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetch(`/api/reviewer/applications?status=${filter}`)
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.applications) {
          setApplications(data.applications);
        }
      })
      .catch((err) => toast.error('Failed to load review queue'))
      .finally(() => setLoading(false));
  }, [filter, router]);

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-50 text-[#D62828] border border-red-200">
              ScholarSync • Management Review Portal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-[#D62828]" />
            Verification Queue (Strict Manual Verification)
          </h1>
          <p className="text-xs text-slate-500">
            Ordered oldest first. Official SLA highlights remaining days before deadline.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'DEFECTIVE', 'APPROVED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === st
                  ? 'bg-[#D62828] text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-[#D62828]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">Loading queue...</div>
      ) : applications.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-slate-300 text-center text-slate-500 bg-white glow-card">
          No applications match the current filter.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden glow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FB] border-b border-slate-200 text-slate-700 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">State / District</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA Timeline</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {app.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {app.studentName}
                      <span className="block text-[11px] font-normal text-slate-500">
                        {app.mobile}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#D62828]">
                        {app.socialCategory}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {app.domicileState}, {app.schoolName}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {app.currentClass}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        app.status === 'APPROVED'
                          ? 'bg-red-50 text-[#D62828] border border-red-200'
                          : app.status === 'DEFECTIVE'
                          ? 'bg-amber-100 text-amber-800'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className={`w-3.5 h-3.5 ${app.isOverdue ? 'text-rose-600' : 'text-amber-600'}`} />
                        <span className={`font-semibold ${app.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                          {app.isOverdue ? 'Overdue!' : `${app.daysRemaining} days left`}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Submitted: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/reviewer/applications/${app.id}`}
                        className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg bg-[#D62828] hover:bg-[#B91C1C] text-white font-semibold text-xs transition-all shadow-xs active:scale-[0.98]"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
