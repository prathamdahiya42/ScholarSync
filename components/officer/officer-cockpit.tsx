"use client";

import * as React from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  RotateCcw,
  Download,
  Shield,
  Clock,
  ExternalLink,
  HelpCircle,
  Undo2,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIFlagChip } from "@/components/shared/ai-flag-chip";
import { HumanGateTag } from "@/components/shared/human-gate-tag";
import { EvidenceBox } from "@/components/shared/evidence-box";
import { RiskMeter } from "@/components/shared/risk-meter";
import { ReasonCodeSelect, ReasonCode, OFFICIAL_REASON_CODES } from "@/components/shared/reason-code-select";
import { ApplicationRecord } from "@/types/scholarship";
import { INITIAL_APPLICATIONS } from "@/lib/mock-data";
import { scholarshipStore } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OfficerCockpitProps {
  lang?: "en" | "hi";
}

export function OfficerCockpit({ lang = "en" }: OfficerCockpitProps) {
  const [applications, setApplications] = React.useState<ApplicationRecord[]>(INITIAL_APPLICATIONS);
  const [selectedAppId, setSelectedAppId] = React.useState<string>("NFS-26-MP-88391");
  const [filterType, setFilterType] = React.useState<string>("all");
  const [activeTab, setActiveTab] = React.useState<"fields" | "flags" | "summary">("fields");
  const [selectedDocIndex, setSelectedDocIndex] = React.useState<number>(1); // 1 = income cert
  const [hoveredFieldId, setHoveredFieldId] = React.useState<string | null>(null);

  // Evidence opened flag (required to approve high-risk files)
  const [evidenceOpened, setEvidenceOpened] = React.useState<boolean>(false);

  // Blind review mode for audit sampling
  const [blindReviewMode, setBlindReviewMode] = React.useState<boolean>(false);

  // Decision Modal State
  const [decisionModal, setDecisionModal] = React.useState<{
    isOpen: boolean;
    type: "RETURN" | "REJECT" | null;
  }>({ isOpen: false, type: null });
  const [selectedReason, setSelectedReason] = React.useState<ReasonCode | null>(null);

  // Decision Sheet Preview Modal
  const [showDecisionSheet, setShowDecisionSheet] = React.useState<boolean>(false);

  const selectedApp = applications.find((a) => a.id === selectedAppId) || applications[0];

  // Subscribe to Hybrid Database Store
  React.useEffect(() => {
    scholarshipStore.getApplications().then((apps) => {
      if (apps && apps.length > 0) setApplications(apps);
    });
    const unsubscribe = scholarshipStore.subscribe(async () => {
      const freshApps = await scholarshipStore.getApplications();
      setApplications(freshApps);
    });
    return () => unsubscribe();
  }, []);

  // Keyboard shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        handleApprove();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        setDecisionModal({ isOpen: true, type: "RETURN" });
      } else if (e.key === "x" || e.key === "X") {
        e.preventDefault();
        setDecisionModal({ isOpen: true, type: "REJECT" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const handleApprove = () => {
    if (selectedApp.riskScore > 50 && !evidenceOpened) {
      toast.error("Evidence Inspection Required", {
        description: "You must click and inspect the highlighted document evidence before approving a high-risk file.",
      });
      return;
    }

    const previousStatus = selectedApp.status;
    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedApp.id
          ? {
              ...app,
              status: "VERIFIED",
              decisions: [
                ...app.decisions,
                {
                  officerId: "INST-OFF-03",
                  officerName: "Dr. S. Sharma",
                  stage: "Institute Nodal Verification",
                  outcome: "APPROVED",
                  timestamp: new Date().toLocaleString(),
                  hash: "8fbc923a1024bd901c89fe",
                },
              ],
            }
          : app
      )
    );

    scholarshipStore.updateStatus(selectedApp.id, "verified", "Approved by Institute Nodal Officer");

    toast("File Approved & Signed Off", {
      description: `Application ${selectedApp.id} verified. Decision logged to hash-chain.`,
      action: {
        label: "Undo (8s)",
        onClick: () => {
          setApplications((prev) =>
            prev.map((app) =>
              app.id === selectedApp.id ? { ...app, status: previousStatus } : app
            )
          );
          toast.info("Decision Undone");
        },
      },
      duration: 8000,
    });
  };

  const handleConfirmDecision = () => {
    if (!selectedReason || !decisionModal.type) return;

    const previousStatus = selectedApp.status;
    const isReturn = decisionModal.type === "RETURN";

    setApplications((prev) =>
      prev.map((app) =>
        app.id === selectedApp.id
          ? {
              ...app,
              status: isReturn ? "DEFICIENCY" : "REJECTED",
              decisions: [
                ...app.decisions,
                {
                  officerId: "INST-OFF-03",
                  officerName: "Dr. S. Sharma",
                  stage: "Institute Nodal Verification",
                  outcome: isReturn ? "RETURNED" : "REJECTED",
                  reasonCode: selectedReason.code,
                  timestamp: new Date().toLocaleString(),
                  hash: "7bc310ef9213ab9001da88",
                },
              ],
            }
          : app
      )
    );

    setDecisionModal({ isOpen: false, type: null });

    scholarshipStore.updateStatus(
      selectedApp.id,
      isReturn ? "defective" : "rejected",
      `[${selectedReason.code}] ${selectedReason.descriptionEn}`
    );

    toast(isReturn ? "Returned for Deficiency" : "Application Rejected", {
      description: `Reason code [${selectedReason.code}] issued to candidate with exact fix card.`,
      action: {
        label: "Undo (8s)",
        onClick: () => {
          setApplications((prev) =>
            prev.map((app) =>
              app.id === selectedApp.id ? { ...app, status: previousStatus } : app
            )
          );
        },
      },
      duration: 8000,
    });
  };

  const currentDoc = selectedApp.documents[selectedDocIndex] || selectedApp.documents[0];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[var(--background)] overflow-hidden">
      {/* Cockpit Top Bar */}
      <div className="h-12 border-b border-[var(--border)] bg-white px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm text-[var(--foreground)]">
            Institute Verification Cockpit
          </span>
          <span className="text-[var(--subtle)]">·</span>
          <span className="text-xs text-[var(--muted-foreground)]">
            Devi Ahilya Vishwavidyalaya (AISHE: U-0318)
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-[var(--primary-tint)] px-2 py-0.5 text-[11px] font-mono text-[var(--primary)] font-medium">
            <Clock className="w-3 h-3" /> SLA: 4 days remaining
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audit Sample Blind Mode Toggle */}
          <label className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] cursor-pointer select-none border border-[var(--border)] rounded px-2 py-1 bg-white hover:bg-[var(--sunken)]">
            <input
              type="checkbox"
              checked={blindReviewMode}
              onChange={(e) => setBlindReviewMode(e.target.checked)}
              className="rounded border-[var(--border-strong)] text-[var(--primary)] focus:ring-0"
            />
            <span>Blind Review (Hide AI)</span>
          </label>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDecisionSheet(true)}
            className="text-xs h-7"
          >
            <FileText className="w-3.5 h-3.5 mr-1" />
            Decision Sheet
          </Button>
        </div>
      </div>

      {/* 3-Pane Desktop Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* PANE 1: Queue (320px) */}
        <div className="w-80 border-r border-[var(--border)] bg-white flex flex-col shrink-0">
          <div className="p-3 border-b border-[var(--border)] space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search candidates or IDs..."
                className="h-8 w-full rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-white pl-8 pr-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
              />
            </div>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={cn(
                  "text-[11px] font-medium px-2 py-0.5 rounded transition-colors",
                  filterType === "all" ? "bg-[var(--primary)] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--sunken)]"
                )}
              >
                All (3)
              </button>
              <button
                type="button"
                onClick={() => setFilterType("high-risk")}
                className={cn(
                  "text-[11px] font-medium px-2 py-0.5 rounded transition-colors",
                  filterType === "high-risk" ? "bg-[var(--primary)] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--sunken)]"
                )}
              >
                High Risk (1)
              </button>
              <button
                type="button"
                onClick={() => setFilterType("audit")}
                className={cn(
                  "text-[11px] font-medium px-2 py-0.5 rounded transition-colors",
                  filterType === "audit" ? "bg-[var(--primary)] text-white" : "text-[var(--muted-foreground)] hover:bg-[var(--sunken)]"
                )}
              >
                Audit Sample (1)
              </button>
            </div>
          </div>

          {/* Queue Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
            {applications.map((app) => {
              const isSelected = app.id === selectedApp.id;
              const isRiskHigh = app.riskScore > 50;

              return (
                <div
                  key={app.id}
                  onClick={() => {
                    setSelectedAppId(app.id);
                    setEvidenceOpened(false);
                  }}
                  className={cn(
                    "h-14 p-2.5 cursor-pointer flex items-center justify-between text-xs transition-colors select-none",
                    isSelected
                      ? "bg-[var(--primary-tint)] border-l-[3px] border-l-[var(--primary)] font-medium"
                      : "hover:bg-[var(--sunken)]"
                  )}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-[12px] text-[var(--foreground)]">
                        {app.id}
                      </span>
                      {app.isAuditSample && (
                        <span className="rounded bg-[var(--sunken)] px-1 py-0.2 text-[9px] font-mono font-semibold uppercase text-[var(--muted-foreground)] border border-[var(--border)]">
                          Audit Sample
                        </span>
                      )}
                    </div>
                    <div className="text-[var(--muted-foreground)] truncate max-w-[190px]">
                      {app.applicantName} · {app.tribe}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {!blindReviewMode ? (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.2 text-[10px] font-mono font-semibold tabular-nums",
                          isRiskHigh
                            ? "bg-[var(--danger-tint)] text-[var(--danger)]"
                            : "bg-[var(--success-tint)] text-[var(--success)]"
                        )}
                      >
                        Risk: {app.riskScore}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[var(--subtle)]">Blind Mode</span>
                    )}

                    <span
                      className={cn(
                        "text-[10px] uppercase font-semibold",
                        app.status === "VERIFIED" && "text-[var(--success)]",
                        app.status === "DEFICIENCY" && "text-[var(--warn)]",
                        app.status === "REJECTED" && "text-[var(--danger)]",
                        app.status === "SUBMITTED" && "text-[var(--primary)]"
                      )}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANE 2: Center Document Viewer (Flexible) */}
        <div className="flex-1 bg-[#EBE7DF] flex flex-col overflow-hidden relative">
          {/* Document Tabs */}
          <div className="h-10 bg-white border-b border-[var(--border)] px-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1 overflow-x-auto">
              {selectedApp.documents.map((doc, idx) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDocIndex(idx)}
                  className={cn(
                    "h-8 px-3 rounded-t text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer",
                    selectedDocIndex === idx
                      ? "bg-[#EBE7DF] text-[var(--foreground)] border-t-2 border-t-[var(--primary)] font-semibold"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--sunken)]"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{doc.title}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              <span className="text-[11px] font-mono">Zoom: 100%</span>
            </div>
          </div>

          {/* Interactive Document Canvas */}
          <div className="flex-1 p-6 overflow-auto flex items-center justify-center">
            <div
              className="relative w-[500px] h-[680px] bg-white rounded shadow-md border border-[var(--border-strong)] p-6 select-none"
              onClick={() => {
                setEvidenceOpened(true);
                toast.info("Evidence Opened & Logged", {
                  description: "Officer viewed highlighted field regions on original document.",
                });
              }}
            >
              {/* Document Header Representation */}
              <div className="text-center border-b border-black/20 pb-4 mb-4">
                <span className="text-[10px] uppercase font-mono tracking-widest text-black/60 block">
                  GOVERNMENT OF MADHYA PRADESH
                </span>
                <h4 className="font-serif text-base font-bold text-black mt-1">
                  OFFICE OF THE TEHSILDAR, DINDORI
                </h4>
                <p className="text-[11px] text-black/70">
                  ANNUAL FAMILY INCOME CERTIFICATE (A.Y. 2024-25)
                </p>
                <span className="text-[10px] font-mono text-black/60 block mt-1">
                  Ref No: MP/DND/INC/2024/09881
                </span>
              </div>

              {/* Document Text Body */}
              <div className="text-[12px] leading-relaxed text-black/90 space-y-3 font-serif">
                <p>
                  This is to certify that <strong>Shri Ramesh Kumar Gond</strong>, son of Shri Mansingh Gond, resident of Village Samnapur, Tehsil Dindori, District Dindori (Madhya Pradesh), belongs to the <strong>Gond</strong> Scheduled Tribe.
                </p>
                <p>
                  As per village Patwari verification, the total annual income of the family from all agricultural and professional sources is assessed at <strong>₹4,80,000 (Rupees Four Lakhs Eighty Thousand only)</strong>.
                </p>
                <p className="pt-4 text-[11px] text-black/70">
                  This certificate is issued on <strong>12-Aug-2024</strong> for official educational concessions and scholarship applications.
                </p>
              </div>

              {/* Tehsildar Official Seal */}
              <div className="absolute bottom-10 right-10 text-center">
                <div className="w-20 h-20 rounded-full border-2 border-blue-900/40 border-dashed flex items-center justify-center text-[9px] text-blue-900 font-bold uppercase rotate-[-12deg] p-1">
                  Tehsildar Seal Dindori (MP)
                </div>
                <span className="text-[10px] font-sans block mt-1 text-black/70 font-semibold">
                  (Executive Magistrate)
                </span>
              </div>

              {/* EvidenceBoxes Overlaid (Drawn if not in blind mode) */}
              {!blindReviewMode &&
                currentDoc?.extractedFields.map((field) => (
                  <EvidenceBox
                    key={field.fieldId}
                    id={field.fieldId}
                    fieldId={field.fieldId}
                    label={`${field.label}: ${field.value}`}
                    x={field.box.x}
                    y={field.box.y}
                    width={field.box.width}
                    height={field.box.height}
                    isHovered={hoveredFieldId === field.fieldId}
                    onHover={setHoveredFieldId}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* PANE 3: Right Inspector (400px) */}
        <div className="w-[400px] border-l border-[var(--border)] bg-white flex flex-col justify-between shrink-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[var(--muted-foreground)]">
                  {selectedApp.id}
                </span>
                <HumanGateTag officerInitials="SS" stageName="Institute Verifier" />
              </div>
              <h3 className="font-h3 text-base text-[var(--foreground)] mt-0.5">
                {selectedApp.applicantName}
              </h3>
              <p className="font-small text-xs text-[var(--muted-foreground)]">
                {selectedApp.course}
              </p>
            </div>

            {/* Risk Meter (Hidden in blind mode) */}
            {!blindReviewMode ? (
              <RiskMeter
                score={selectedApp.riskScore}
                components={selectedApp.riskBreakdown}
              />
            ) : (
              <div className="p-2.5 rounded bg-[var(--sunken)] text-xs text-[var(--muted-foreground)]">
                Blind review mode active: AI flags hidden for independent audit verification.
              </div>
            )}

            {/* Inspector Tabs */}
            <div className="border-b border-[var(--border)] flex gap-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab("fields")}
                className={cn(
                  "pb-2 border-b-2 transition-colors cursor-pointer",
                  activeTab === "fields"
                    ? "border-[var(--primary)] text-[var(--primary)] font-semibold"
                    : "border-transparent text-[var(--muted-foreground)]"
                )}
              >
                Extracted Fields
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("flags")}
                className={cn(
                  "pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1",
                  activeTab === "flags"
                    ? "border-[var(--primary)] text-[var(--primary)] font-semibold"
                    : "border-transparent text-[var(--muted-foreground)]"
                )}
              >
                <span>AI Flags</span>
                <span className="rounded-full bg-[var(--warn-tint)] text-[var(--warn)] px-1.5 text-[10px]">
                  {selectedApp.flags.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("summary")}
                className={cn(
                  "pb-2 border-b-2 transition-colors cursor-pointer",
                  activeTab === "summary"
                    ? "border-[var(--primary)] text-[var(--primary)] font-semibold"
                    : "border-transparent text-[var(--muted-foreground)]"
                )}
              >
                File Summary
              </button>
            </div>

            {/* TAB CONTENT: Fields */}
            {activeTab === "fields" && (
              <div className="space-y-2.5 text-xs">
                {currentDoc?.extractedFields.map((field) => {
                  const isHovered = hoveredFieldId === field.fieldId;
                  return (
                    <div
                      key={field.fieldId}
                      onMouseEnter={() => setHoveredFieldId(field.fieldId)}
                      onMouseLeave={() => setHoveredFieldId(null)}
                      className={cn(
                        "p-2.5 rounded-[var(--radius-sm)] border transition-all cursor-pointer",
                        isHovered
                          ? "border-[var(--ai)] bg-[var(--ai-tint)] shadow-xs"
                          : "border-[var(--border)] bg-white hover:bg-[var(--sunken)]"
                      )}
                    >
                      <div className="flex items-center justify-between text-[var(--muted-foreground)] mb-0.5">
                        <span className="font-medium text-[var(--foreground)]">{field.label}</span>
                        {!blindReviewMode && (
                          <span className="font-mono text-[10px] text-[var(--ai)]">
                            {field.confidence}% conf
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-sm font-semibold text-[var(--foreground)]">
                        {field.value}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT: Flags */}
            {activeTab === "flags" && (
              <div className="space-y-2.5">
                {selectedApp.flags.map((flag) => (
                  <div
                    key={flag.id}
                    className="p-3 rounded-[var(--radius-sm)] border border-dashed border-[var(--ai-border)] bg-[var(--ai-tint)]/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-[11px] text-[var(--ai)]">
                        {flag.ruleId}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                        {flag.confidence}% confidence
                      </span>
                    </div>
                    <h5 className="font-semibold text-xs text-[var(--foreground)]">{flag.label}</h5>
                    <p className="text-xs text-[var(--muted-foreground)] leading-snug">
                      {lang === "hi" ? flag.explanationHi : flag.explanationEn}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: Summary */}
            {activeTab === "summary" && (
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="p-3 rounded-[var(--radius-sm)] border border-dashed border-[var(--ai-border)] bg-[var(--ai-tint)] space-y-2">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[var(--ai)] uppercase">
                    <span>AI Scrutiny Brief</span>
                  </div>
                  <p className="text-[var(--foreground)]">
                    Applicant is a verified Gond Ph.D. scholar enrolled at DAVV Indore. Academic and caste eligibility criteria met. <strong>Action needed:</strong> Current income certificate has expired (dated Aug 2024) and bank account requires DBT seeding.
                  </p>
                  <span className="text-[10px] text-[var(--muted-foreground)] block border-t border-[var(--ai-border)] pt-1">
                    Grounded strictly on uploaded documents. Officer retains decision authority.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* STICKY DECISION BAR (Section 7 of UI.md) */}
          <div className="p-3 border-t border-[var(--border)] bg-white space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
              <span>Decision Authority: Institute Nodal</span>
              <span>Keyboard: [R] [X] [A]</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Return Button */}
              <Button
                variant="return"
                size="md"
                onClick={() => setDecisionModal({ isOpen: true, type: "RETURN" })}
                className="text-xs flex items-center justify-center gap-1"
              >
                <span>Return</span>
                <kbd className="font-mono text-[10px] bg-[var(--sunken)] border border-[var(--border)] px-1 rounded">
                  R
                </kbd>
              </Button>

              {/* Reject Button */}
              <Button
                variant="reject"
                size="md"
                onClick={() => setDecisionModal({ isOpen: true, type: "REJECT" })}
                className="text-xs flex items-center justify-center gap-1"
              >
                <span>Reject</span>
                <kbd className="font-mono text-[10px] bg-[var(--sunken)] border border-[var(--border)] px-1 rounded">
                  X
                </kbd>
              </Button>

              {/* Approve Button */}
              <Button
                variant="primary"
                size="md"
                onClick={handleApprove}
                disabled={selectedApp.riskScore > 50 && !evidenceOpened}
                title={
                  selectedApp.riskScore > 50 && !evidenceOpened
                    ? "Click document evidence before approving high-risk file"
                    : undefined
                }
                className="text-xs flex items-center justify-center gap-1"
              >
                <span>Approve</span>
                <kbd className="font-mono text-[10px] bg-black/20 text-white border border-white/30 px-1 rounded">
                  A
                </kbd>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* REASON MODAL (Mandatory for Return or Reject) */}
      {decisionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-md)] space-y-4 animate-in fade-in-0 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <h3 className="font-h3 text-base text-[var(--foreground)]">
                {decisionModal.type === "RETURN"
                  ? "Select Deficiency Reason for Candidate"
                  : "Mandatory Rejection Justification"}
              </h3>
              <button
                type="button"
                onClick={() => setDecisionModal({ isOpen: false, type: null })}
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-[var(--muted-foreground)]">
              {decisionModal.type === "RETURN"
                ? "The selected reason will be converted into an exact-fix card and sent to the student on WhatsApp/SMS."
                : "Rejections require a coded statutory justification and second-officer sign-off under Section 8 rules."}
            </p>

            <ReasonCodeSelect
              selectedCode={selectedReason?.code}
              onSelect={setSelectedReason}
              lang={lang}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDecisionModal({ isOpen: false, type: null })}
              >
                Cancel
              </Button>
              <Button
                variant={decisionModal.type === "RETURN" ? "return" : "reject"}
                size="sm"
                disabled={!selectedReason}
                onClick={handleConfirmDecision}
              >
                Confirm {decisionModal.type === "RETURN" ? "Deficiency Notice" : "Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* A4 DECISION SHEET PREVIEW MODAL */}
      {showDecisionSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-md)] space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <div>
                <span className="font-mono text-xs text-[var(--muted-foreground)] uppercase">
                  Statutory Audit Record · Form VIII
                </span>
                <h3 className="font-display text-xl text-[var(--foreground)]">
                  Verification Decision Sheet
                </h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDecisionSheet(false)}
              >
                Close
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[var(--muted-foreground)]">Application Reference:</span>
                <p className="font-mono font-bold text-sm text-[var(--foreground)]">{selectedApp.id}</p>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Applicant Name:</span>
                <p className="font-semibold text-sm text-[var(--foreground)]">{selectedApp.applicantName}</p>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">Institution:</span>
                <p className="font-semibold text-[var(--foreground)]">{selectedApp.instituteName}</p>
              </div>
              <div>
                <span className="text-[var(--muted-foreground)]">AISHE Code:</span>
                <p className="font-mono font-semibold text-[var(--foreground)]">{selectedApp.aisheCode}</p>
              </div>
            </div>

            <div className="rounded-[var(--radius-sm)] bg-[var(--sunken)] p-3 border border-[var(--border)] text-xs space-y-1">
              <span className="font-semibold text-[var(--foreground)] block">
                Signals Displayed at Decision Time:
              </span>
              <ul className="list-disc pl-4 text-[var(--muted-foreground)] space-y-0.5">
                <li>AI Scrutiny Index: {selectedApp.riskScore}/100</li>
                <li>Extracted Family Income: ₹{selectedApp.familyIncome.toLocaleString()}</li>
                <li>Active Flags: {selectedApp.flags.map((f) => f.ruleId).join(", ") || "None"}</li>
              </ul>
            </div>

            <div className="border-t border-[var(--border)] pt-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[var(--muted-foreground)] block">Verifying Authority</span>
                  <span className="font-semibold text-[var(--foreground)]">Dr. S. Sharma (Nodal Officer)</span>
                </div>
                <div className="text-right">
                  <span className="text-[var(--muted-foreground)] block">Cryptographic Hash</span>
                  <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                    e3b0c44298fc1c149afbf4c8996fb92427ae41e4
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => toast.success("Decision Sheet Exported", { description: "Saved official audit record as PDF." })}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Official Audit PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
