'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/context';
import { toast } from 'sonner';
import { isDocumentRequired } from '@/lib/eligibility-engine/engine';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Check,
  Info,
  Layers
} from 'lucide-react';

export default function DocumentUploadPage() {
  const { id } = useParams() as { id: string };
  const { t } = useLanguage();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      .catch((err) => toast.error('Failed to load application'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading || !config || !appData) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-slate-500">
        Loading document verification interface...
      </div>
    );
  }

  // Answer map for conditional documents
  const answerMap: Record<string, string> = {};
  appData.answers?.forEach((a: any) => {
    answerMap[a.questionId] = a.answer;
  });

  // Filter only documents that are required for this student
  const requiredSlots = (config.documents || []).filter((doc: any) =>
    isDocumentRequired(doc, answerMap, {
      hasDisability: appData.student.hasDisability,
      isHosteller: appData.student.isHosteller
    })
  );

  const currentSlot = requiredSlots[currentSlotIndex];

  // Map of uploaded documents
  const uploadedDocsMap = new Map<string, any>();
  appData.documents?.forEach((d: any) => {
    uploadedDocsMap.set(d.docTypeId, d);
  });

  const currentUploadedDoc = currentSlot ? uploadedDocsMap.get(currentSlot.id) : null;
  const currentAiCheck = currentUploadedDoc?.aiChecks?.[0];

  // Submit gate check
  let canProceedToReview = true;
  for (const slot of requiredSlots) {
    const doc = uploadedDocsMap.get(slot.id);
    if (!doc) {
      canProceedToReview = false;
      break;
    }
    const check = doc.aiChecks?.[0];
    if (check?.status === 'FAIL') {
      canProceedToReview = false;
      break;
    }
    if (check?.status === 'WARN' && !doc.warnAcked) {
      canProceedToReview = false;
      break;
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSlot) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('docTypeId', currentSlot.id);

    try {
      const res = await fetch(`/api/applications/${id}/documents`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`${t(currentSlot.label)} uploaded and analyzed!`);

      // Refresh application data
      const refreshRes = await fetch(`/api/applications/${id}`);
      const refreshData = await refreshRes.json();
      setAppData(refreshData.application);

      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAcknowledgeWarning = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/warn-ack`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to acknowledge');

      toast.success('Inspection note acknowledged.');
      // Refresh
      const refreshRes = await fetch(`/api/applications/${id}`);
      const refreshData = await refreshRes.json();
      setAppData(refreshData.application);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-[#D62828] uppercase tracking-wider">
            Step 2 of 4: Document Verification
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Upload Identification Certificates
          </h1>
          <p className="text-xs text-slate-500">
            Upload one document at a time. The automated assistant verifies readability instantly.
          </p>
        </div>

        <button
          onClick={() => router.push(`/student/applications/${id}/review`)}
          disabled={!canProceedToReview}
          className="py-2.5 px-5 rounded-xl bg-[#D62828] hover:bg-[#B91C1C] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-sm shrink-0 active:scale-[0.98]"
        >
          <span>Review & Submit</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Document Slot Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {requiredSlots.map((slot: any, idx: number) => {
          const doc = uploadedDocsMap.get(slot.id);
          const check = doc?.aiChecks?.[0];
          const isCurrent = idx === currentSlotIndex;

          return (
            <button
              key={slot.id}
              onClick={() => setCurrentSlotIndex(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 border transition-all ${
                isCurrent
                  ? 'bg-[#D62828] text-white border-[#D62828] shadow-sm'
                  : doc
                  ? check?.status === 'PASS'
                    ? 'bg-red-50 text-[#D62828] border-red-200'
                    : check?.status === 'WARN'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{idx + 1}. {t(slot.label)}</span>
              {doc && check?.status === 'PASS' && <Check className="w-3.5 h-3.5 text-white" />}
              {doc && check?.status === 'WARN' && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
              {doc && check?.status === 'FAIL' && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
            </button>
          );
        })}
      </div>

      {/* Active Document Slot Workspace */}
      {currentSlot && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 glow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-[#D62828] border border-red-100">
                  Document {currentSlotIndex + 1} of {requiredSlots.length}
                </span>
                <span className="text-xs text-slate-400">Max size: {currentSlot.maxSizeMB || 5}MB</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {t(currentSlot.label)}
              </h2>
            </div>

            {currentUploadedDoc && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                currentAiCheck?.status === 'PASS'
                  ? 'bg-red-50 text-[#D62828] border border-red-200'
                  : currentAiCheck?.status === 'WARN'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {currentAiCheck?.status === 'PASS' && <CheckCircle2 className="w-4 h-4 text-[#D62828]" />}
                {currentAiCheck?.status === 'WARN' && <AlertTriangle className="w-4 h-4" />}
                {currentAiCheck?.status === 'FAIL' && <XCircle className="w-4 h-4" />}
                <span>AI Status: {currentAiCheck?.status || 'PENDING'}</span>
              </span>
            )}
          </div>

          {/* Student Tip Banner */}
          {currentSlot.studentTip && (
            <div className="p-4 rounded-2xl bg-red-50/60 border border-red-100 text-xs text-red-950 flex items-start gap-3">
              <Info className="w-4 h-4 text-[#D62828] mt-0.5 shrink-0" />
              <div>
                <strong className="block mb-0.5">Student Tip:</strong>
                <p className="leading-relaxed">{t(currentSlot.studentTip)}</p>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 sm:p-10 text-center hover:border-[#D62828] transition-colors bg-[#F8F9FB]">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="fileUpload"
            />

            {uploading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-[#D62828] animate-spin" />
                <span className="text-sm font-semibold text-slate-700">
                  Running automated quality & OCR readability checks...
                </span>
                <span className="text-xs text-slate-500">Takes approximately 3-5 seconds</span>
              </div>
            ) : currentUploadedDoc ? (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D62828] border border-red-100 mx-auto flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block">
                    {currentUploadedDoc.fileName} (Version {currentUploadedDoc.version})
                  </span>
                  <span className="text-xs text-slate-500">
                    Uploaded: {new Date(currentUploadedDoc.uploadedAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <a
                    href={`/api/files/${encodeURIComponent(currentUploadedDoc.storagePath)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-[#D62828] hover:text-[#B91C1C] underline"
                  >
                    View Uploaded File
                  </a>
                  <span>•</span>
                  <label
                    htmlFor="fileUpload"
                    className="text-xs font-semibold text-slate-700 hover:text-[#D62828] cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Replace / Retake
                  </label>
                </div>
              </div>
            ) : (
              <div className="py-4 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 text-slate-500 mx-auto flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block">
                    Upload or Capture Photo of {t(currentSlot.label)}
                  </span>
                  <span className="text-xs text-slate-500">
                    Supports JPG, PNG, or PDF up to {currentSlot.maxSizeMB || 5}MB
                  </span>
                </div>
                <div className="pt-2">
                  <label
                    htmlFor="fileUpload"
                    className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-[#D62828] hover:bg-[#B91C1C] text-white font-semibold text-xs sm:text-sm cursor-pointer shadow-sm transition-all active:scale-[0.98]"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Choose File or Take Photo</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* AI Check Feedback Panel */}
          {currentAiCheck && (
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              currentAiCheck.status === 'PASS'
                ? 'bg-red-50/40 border-red-200 text-red-950'
                : currentAiCheck.status === 'WARN'
                ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                : 'bg-rose-50/60 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center justify-between font-bold text-sm">
                <span>Verification Feedback:</span>
                <span className="text-[11px] font-normal opacity-80">
                  Readability score: {Math.round(currentAiCheck.confidence * 100)}%
                </span>
              </div>

              {/* Student Messages */}
              {(() => {
                let msgs = [];
                try {
                  msgs = JSON.parse(currentAiCheck.messagesJson);
                } catch (e) {}
                return (
                  <ul className="list-disc list-inside space-y-1">
                    {msgs.map((m: any, i: number) => (
                      <li key={i}>{t(m)}</li>
                    ))}
                  </ul>
                );
              })()}

              {/* WARN Acknowledgement Checkbox */}
              {currentAiCheck.status === 'WARN' && (
                <div className="pt-3 mt-2 border-t border-amber-200 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`ack_${currentUploadedDoc.id}`}
                    checked={currentUploadedDoc.warnAcked}
                    onChange={() => handleAcknowledgeWarning(currentUploadedDoc.id)}
                    className="w-4 h-4 accent-[#D62828] rounded"
                  />
                  <label htmlFor={`ack_${currentUploadedDoc.id}`} className="font-semibold cursor-pointer">
                    I have reviewed this inspection note and confirm this is my valid document.
                  </label>
                </div>
              )}

              {/* Retake Button on FAIL */}
              {currentAiCheck.status === 'FAIL' && (
                <div className="pt-2">
                  <label
                    htmlFor="fileUpload"
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#D62828] hover:bg-[#B91C1C] text-white font-semibold text-xs cursor-pointer shadow-xs transition-all active:scale-[0.98]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake & Replace Document</span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Cross-Document Checks summary if 2+ documents exist */}
          {appData.crossChecks && appData.crossChecks.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#D62828]" />
                Cross-Document Consistency Checks:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {appData.crossChecks.map((cc: any) => (
                  <div
                    key={cc.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-[#F8F9FB] flex items-center justify-between"
                  >
                    <span className="font-medium text-slate-700">
                      {cc.checkId === 'name_cross_match' ? 'Name Consistency' : "Father's Name Consistency"}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cc.status === 'PASS'
                        ? 'bg-red-50 text-[#D62828] border border-red-200'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {cc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slot Navigation Controls */}
          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentSlotIndex(Math.max(0, currentSlotIndex - 1))}
              disabled={currentSlotIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Previous Document
            </button>

            {currentSlotIndex < requiredSlots.length - 1 ? (
              <button
                onClick={() => setCurrentSlotIndex(currentSlotIndex + 1)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-black transition-colors"
              >
                <span>Next Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => router.push(`/student/applications/${id}/review`)}
                disabled={!canProceedToReview}
                className="px-5 py-2 rounded-xl bg-[#D62828] text-white text-xs font-semibold hover:bg-[#B91C1C] disabled:opacity-40 flex items-center gap-1.5 transition-all shadow-md shadow-red-600/20 active:scale-[0.98]"
              >
                <span>Proceed to Review</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
