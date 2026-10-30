'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/context';
import { toast } from 'sonner';
import {
  FileCode2,
  Upload,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Building,
  RefreshCw
} from 'lucide-react';

export default function AdminScholarshipsConfigPage() {
  const { t } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [scholarships, setScholarships] = useState<any[]>([]);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  const loadScholarships = () => {
    setLoading(true);
    fetch('/api/admin/scholarships')
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.scholarships) {
          setScholarships(data.scholarships);
        }
      })
      .catch((err) => toast.error('Failed to load scholarships'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadScholarships();
  }, [router]);

  const handleUploadSubmit = async () => {
    setValidating(true);
    setValidationErrors([]);

    try {
      const res = await fetch('/api/admin/scholarships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonText
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.validationErrors) {
          setValidationErrors(data.validationErrors);
          toast.error('JSON Schema validation failed');
        } else {
          toast.error(data.error || 'Upload failed');
        }
        return;
      }

      toast.success(data.message || 'Scholarship created successfully with zero code changes!');
      setShowUploadModal(false);
      setJsonText('');
      loadScholarships();
    } catch (err: any) {
      toast.error(err.message || 'Network error');
    } finally {
      setValidating(false);
    }
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setJsonText(String(event.target?.result || ''));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-50 text-[#D62828] border border-red-200">
            ScholarSync • Admin Portal
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <FileCode2 className="w-6 h-6 text-[#D62828]" />
            Config-Driven Scholarship Manager
          </h1>
          <p className="text-xs text-slate-500">
            Add or update any scholarship scheme dynamically via JSON. Validated against scholarship.schema.json.
          </p>
        </div>

        <button
          onClick={() => {
            setShowUploadModal(true);
            setValidationErrors([]);
          }}
          className="py-2.5 px-4 rounded-xl bg-[#D62828] hover:bg-[#B91C1C] text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md shadow-red-600/20 active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Scholarship JSON</span>
        </button>
      </div>

      {/* Scholarships List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">Loading configs...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scholarships.map((s) => {
            const config = s.config;
            return (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 glow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#D62828]">
                    {s.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-[#D62828] border border-red-100 uppercase">
                    v{s.version} • {s.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">
                  {t(s.name)}
                </h3>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>Ministry: {config?.provider?.ministry}</div>
                  <div>Category Mode: <strong>{config?.categoryRule?.mode}</strong></div>
                  <div>Questions: {config?.questionnaire?.questions?.length || 0} questions</div>
                  <div>Required Documents: {config?.documents?.length || 0} slots</div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>AY: {s.academicYear}</span>
                  <span>Registered: {new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload JSON Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto glow-card">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Upload Scholarship JSON Configuration
                </h2>
                <p className="text-xs text-slate-500">
                  Must conform to scholarship.schema.json (validated automatically via AJV)
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* File drop or paste */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-semibold text-slate-700">
                <span>Paste JSON or Select File:</span>
                <label className="text-[#D62828] hover:underline cursor-pointer">
                  <span>Browse .json file</span>
                  <input type="file" accept=".json" onChange={handleFileDrop} className="hidden" />
                </label>
              </div>
              <textarea
                rows={12}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{\n  "schemaVersion": "1.0",\n  "id": "new-scholarship-slug",\n  "name": { "en": "..." },\n  "categoryRule": { "mode": "OPEN_TO_ALL" },\n  ...\n}'
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 bg-[#F8F9FB] text-slate-900 focus:ring-2 focus:ring-[#D62828]/20 focus:border-[#D62828] outline-none"
              />
            </div>

            {/* Validation Errors Box */}
            {validationErrors.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-900 space-y-1">
                <strong className="block mb-1 flex items-center gap-1.5 text-rose-700 font-bold">
                  <XCircle className="w-4 h-4" />
                  Schema Validation Errors ({validationErrors.length}):
                </strong>
                <ul className="list-disc list-inside space-y-0.5">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>
                      Field <code className="font-mono bg-white/60 px-1 rounded">{err.field}</code>: {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={validating || !jsonText.trim()}
                className="px-5 py-2 rounded-xl bg-[#D62828] hover:bg-[#B91C1C] text-white font-semibold text-xs transition-all disabled:opacity-40 flex items-center gap-1.5 shadow-md shadow-red-600/20 active:scale-[0.98]"
              >
                {validating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Validate & Activate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
