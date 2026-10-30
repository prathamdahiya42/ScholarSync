'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShieldCheck, Clock, User, FileText, RefreshCw } from 'lucide-react';

export default function AdminAuditLogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = () => {
    setLoading(true);
    fetch('/api/admin/audit-log')
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.logs) {
          setLogs(data.logs);
        }
      })
      .catch((err) => toast.error('Failed to load audit logs'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [router]);

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-50 text-[#D62828] border border-red-200">
            ScholarSync • Security & Accountability
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#D62828]" />
            Platform Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Every document inspection, eligibility evaluation, and manual verification decision is permanently logged.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2 rounded-xl border border-slate-300 hover:bg-slate-100 hover:border-[#D62828] flex items-center gap-1.5 text-xs font-semibold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#D62828]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">Loading audit entries...</div>
      ) : logs.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-slate-300 text-center text-slate-500 text-xs bg-white glow-card">
          No audit entries recorded yet.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden glow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FB] border-b border-slate-200 text-slate-700 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 capitalize">
                        {log.actorType}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono truncate max-w-[100px]">
                        {log.actorId}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#D62828]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {log.entity}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {log.entityId}
                    </td>
                    <td className="py-3 px-4 text-[10px] font-mono text-slate-500 max-w-[200px] truncate">
                      {log.metaJson || '-'}
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
