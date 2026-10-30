'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  ZoomIn,
  RotateCw,
  Download,
  ShieldCheck,
  Building2,
  CheckSquare,
  Square,
  ArrowLeft,
  Send,
  Layers
} from 'lucide-react';

export default function ReviewerInspectionWorkspacePage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Verification state
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [viewedDocIds, setViewedDocIds] = useState<string[]>([]);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  // Action dialogs
  const [actionType, setActionType] = useState<'approve' | 'mark_defective' | 'reject' | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Document viewer transform state
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    fetch(`/api/reviewer/applications/${id}`)
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return null;
        }
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}`);
        }
        return res.json();
      })
      .then((resData) => {
        if (resData && !resData.error && resData.application) {
          setData(resData);
          if (resData.application.documents?.length > 0) {
            const firstId = resData.application.documents[0].id;
            setSelectedDocId(firstId);
            setViewedDocIds([firstId]);
          }
        } else if (resData?.error) {
          toast.error(resData.error);
        }
      })
      .catch((err) => toast.error(err.message || 'Failed to load application'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center text-slate-500">
        Loading reviewer inspection workspace...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Application Unavailable</h2>
        <p className="text-xs text-slate-500">Unable to load the requested application records.</p>
        <button
          onClick={() => router.push('/reviewer/queue')}
          className="px-4 py-2 bg-[#D62828] text-white text-xs font-semibold rounded-xl hover:bg-[#B91C1C] transition-colors"
        >
          Back to Verification Queue
        </button>
      </div>
    );
  }

  const { application, config, checklist } = data;
  const { student, documents, crossChecks } = application;

  const currentDoc = documents.find((d: any) => d.id === selectedDocId) || documents[0];
  const currentAiCheck = currentDoc?.aiChecks?.[0];

  let currentExtracted: Record<string, any> = {};
  let currentFlags: string[] = [];
  try {
    if (currentAiCheck?.extractedJson) currentExtracted = JSON.parse(currentAiCheck.extractedJson);
    if (currentAiCheck?.flagsJson) currentFlags = JSON.parse(currentAiCheck.flagsJson);
  } catch (e) {}

  const handleSelectDoc = (docId: string) => {
    setSelectedDocId(docId);
    if (!viewedDocIds.includes(docId)) {
      setViewedDocIds([...viewedDocIds, docId]);
    }
    setZoom(1);
    setRotation(0);
  };

  const toggleChecklistItem = (item: string) => {
    if (checkedItems.includes(item)) {
      setCheckedItems(checkedItems.filter((i) => i !== item));
    } else {
      setCheckedItems([...checkedItems, item]);
    }
  };

  const allDocsViewed = documents.length > 0 && documents.every((d: any) => viewedDocIds.includes(d.id));
  const allChecklistTicked = checklist.length > 0 && checklist.every((item: string) => checkedItems.includes(item));
  const canApprove = allDocsViewed && allChecklistTicked;

  const handleDecision = async (action: 'approve' | 'mark_defective' | 'reject') => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviewer/applications/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reason: decisionReason,
          viewedDocIds,
          checkedItems
        })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);

      toast.success(resData.message || 'Decision recorded successfully.');
      setActionType(null);
      router.push('/reviewer/queue');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4 space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/reviewer/queue')}
            className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 hover:border-[#D62828] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                Review: {application.id} — {student.fullName}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#D62828] border border-red-200 uppercase">
                {application.status}
              </span>
            </div>
            <span className="text-xs text-slate-500">
              Category: <strong>{student.socialCategory}</strong> | Domicile: <strong>{student.domicileState}</strong> | School: <strong>{student.schoolName}</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActionType('mark_defective');
              setDecisionReason('');
            }}
            className="px-3.5 py-1.5 rounded-xl border border-amber-300 text-amber-700 hover:bg-amber-50 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            Mark Defective
          </button>
          <button
            onClick={() => {
              setActionType('reject');
              setDecisionReason('');
            }}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-all active:scale-[0.98]"
          >
            Reject
          </button>
          <button
            onClick={() => {
              setActionType('approve');
              setDecisionReason('All certificates verified and matched.');
            }}
            disabled={!canApprove}
            className="px-4 py-1.5 rounded-xl bg-[#D62828] hover:bg-[#B91C1C] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 active:scale-[0.98]"
          >
            Approve Application
          </button>
        </div>
      </div>

      {/* Main Split-View Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Document Viewer & Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Document Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {documents.map((doc: any, i: number) => {
              const isViewed = viewedDocIds.includes(doc.id);
              const isSelected = doc.id === currentDoc?.id;
              const status = doc.aiChecks?.[0]?.status || 'PASS';

              return (
                <button
                  key={doc.id}
                  onClick={() => handleSelectDoc(doc.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 border transition-all ${
                    isSelected
                      ? 'bg-[#D62828] text-white border-[#D62828]'
                      : isViewed
                      ? 'bg-white border-red-200 text-[#D62828]'
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  <Eye className={`w-3 h-3 ${isViewed ? 'text-[#D62828]' : 'text-slate-400'}`} />
                  <span className="capitalize">{doc.docTypeId.replace('_', ' ')}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    status === 'PASS' ? 'bg-[#D62828]' : status === 'WARN' ? 'bg-amber-500' : 'bg-slate-400'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Document Viewer Frame */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-inner flex flex-col h-[520px]">
            {/* Viewer Controls */}
            <div className="bg-slate-950 px-4 py-2 flex items-center justify-between text-xs text-slate-300 border-b border-slate-800">
              <span className="font-mono text-[11px] truncate max-w-[200px]">
                {currentDoc?.fileName} (v{currentDoc?.version})
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.25))}
                  className="hover:text-white p-1"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="hover:text-white p-1"
                  title="Rotate"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`/api/files/${encodeURIComponent(currentDoc?.storagePath || '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white p-1"
                  title="Open in new window"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Document Content Display */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/60">
              {currentDoc ? (
                currentDoc.mime === 'application/pdf' ? (
                  <iframe
                    src={`/api/files/${encodeURIComponent(currentDoc.storagePath)}`}
                    className="w-full h-full rounded border-0"
                    title="PDF Document Viewer"
                  />
                ) : currentDoc.mime.startsWith('image/') ? (
                  <img
                    src={`/api/files/${encodeURIComponent(currentDoc.storagePath)}`}
                    alt="Document"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease'
                    }}
                    className="max-h-full max-w-full object-contain rounded shadow-lg"
                  />
                ) : (
                  <pre className="p-4 bg-slate-900 text-red-400 font-mono text-xs rounded-xl w-full h-full overflow-auto whitespace-pre-wrap">
                    {currentAiCheck?.ocrText || 'Document text content'}
                  </pre>
                )
              ) : (
                <span className="text-slate-500 text-xs">No document selected</span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Field Cross-Verification, AI Flags & Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Side-by-Side: Student Entered vs OCR Extracted */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-xs space-y-3 glow-card">
            <h3 className="font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between text-[11px]">
              <span>Field Comparison: {currentDoc?.docTypeId}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentAiCheck?.status === 'PASS'
                  ? 'bg-red-50 text-[#D62828] border border-red-200'
                  : currentAiCheck?.status === 'WARN'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                AI: {currentAiCheck?.status || 'PASS'}
              </span>
            </h3>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-[#F8F9FB] border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Student Profile Value</span>
                <span className="font-bold text-slate-900">
                  {currentDoc?.docTypeId === 'income_certificate'
                    ? 'Income <= 2.5 Lakhs (Self-Declared)'
                    : currentDoc?.docTypeId === 'bank_proof'
                    ? `${student.bankName} - ${student.bankAccountMasked} (IFSC: ${student.ifsc})`
                    : currentDoc?.docTypeId === 'st_certificate'
                    ? `Category: ${student.socialCategory} | State: ${student.domicileState}`
                    : student.fullName}
                </span>
                {currentDoc?.docTypeId === 'bank_proof' && student.decryptedAccountNumber && (
                  <span className="block text-[11px] font-mono text-[#D62828] mt-0.5">
                    Decrypted Plain Account: {student.decryptedAccountNumber}
                  </span>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-red-50/50 border border-red-200">
                <span className="text-[10px] text-[#D62828] uppercase font-semibold block">
                  OCR Extracted Value
                </span>
                <div className="space-y-0.5 pt-0.5 font-medium text-slate-800">
                  {Object.keys(currentExtracted).length > 0 ? (
                    Object.entries(currentExtracted).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-500 capitalize">{k}:</span>
                        <strong className="text-slate-900">{String(v)}</strong>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No structured fields parsed by OCR.</span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Reviewer Flags */}
            {currentFlags.length > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <strong className="block">Inspection Alerts:</strong>
                <ul className="list-disc list-inside space-y-0.5">
                  {currentFlags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Cross Checks */}
          {crossChecks.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-xs space-y-2 glow-card">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#D62828]" />
                Cross-Document Consistency
              </h3>
              <div className="space-y-1.5">
                {crossChecks.map((cc: any) => {
                  let detail: any = {};
                  try {
                    detail = JSON.parse(cc.detailJson);
                  } catch (e) {}
                  return (
                    <div
                      key={cc.id}
                      className="p-2 rounded-lg bg-[#F8F9FB] border border-slate-100 flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 capitalize">
                          {cc.checkId.replace(/_/g, ' ')}
                        </span>
                        <span className="text-slate-500 block text-[10px]">{detail.comparisonNotes}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                        cc.status === 'PASS' ? 'bg-red-50 text-[#D62828] border border-red-200' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {cc.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mandatory Verification Checklist */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-xs space-y-3 glow-card">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D62828]" />
                Official Verification Checklist
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">
                {checkedItems.length}/{checklist.length} Verified
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              Official gate: Every checklist item must be verified before approval can be granted.
            </p>

            <div className="space-y-2">
              {checklist.map((item: string, i: number) => {
                const isChecked = checkedItems.includes(item);
                return (
                  <button
                    key={i}
                    onClick={() => toggleChecklistItem(item)}
                    className={`w-full text-left p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                      isChecked
                        ? 'bg-red-50/50 border-red-200 text-slate-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-[#D62828] shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <span className="text-xs leading-snug">{item}</span>
                  </button>
                );
              })}
            </div>

            {/* Document viewing gate alert */}
            {!allDocsViewed && (
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Please open all {documents.length} documents above to unlock the approval button ({viewedDocIds.length}/{documents.length} inspected).
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Decision Modal Dialog */}
      {actionType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 glow-card">
            <div className="flex items-center gap-3">
              {actionType === 'approve' && (
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#D62828] border border-red-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              {actionType === 'mark_defective' && (
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              )}
              {actionType === 'reject' && (
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <h2 className="text-base font-bold text-slate-900 capitalize">
                  Confirm {actionType.replace('_', ' ')}
                </h2>
                <span className="text-xs text-slate-500">Application: {application.id}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {actionType === 'approve'
                  ? 'Verification Remark (Optional)'
                  : 'Official Reason (Mandatory, shown to student)'}
              </label>
              <textarea
                rows={3}
                required={actionType !== 'approve'}
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder={
                  actionType === 'mark_defective'
                    ? 'Explain which certificate is unclear or defective so the student can fix it...'
                    : actionType === 'reject'
                    ? 'State statutory reason for rejection...'
                    : 'All criteria verified against original records.'
                }
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-[#D62828]/20 focus:border-[#D62828] outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActionType(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDecision(actionType)}
                disabled={submitting || (actionType !== 'approve' && decisionReason.trim().length < 5)}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition-all ${
                  actionType === 'approve'
                    ? 'bg-[#D62828] hover:bg-[#B91C1C]'
                    : actionType === 'mark_defective'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                } disabled:opacity-50 active:scale-[0.98]`}
              >
                {submitting ? 'Recording...' : `Confirm ${actionType.replace('_', ' ')}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
