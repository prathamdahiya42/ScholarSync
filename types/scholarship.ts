export type SchemeType = "central_sector" | "centrally_sponsored";

export interface SchemeRule {
  id: string;
  field: string;
  operator: "<=" | ">=" | "==" | "in" | "not_in";
  value: any;
  appliesTo: "fresh" | "renewal" | "both";
  severity: "hard" | "soft" | "advisory";
  message: {
    en: string;
    hi: string;
  };
}

export interface SchemeConfig {
  id: string;
  name: string;
  nameHi: string;
  type: SchemeType;
  academicYear: string;
  version: string;
  effectiveFrom: string;
  effectiveTo: string;
  incomeCeiling: number | null; // null for fellowship
  slots: number | null;
  notifiedInstitutesCount: number;
  rules: SchemeRule[];
  requiredDocuments: string[];
  verificationChain: string[];
  isConfigOnly?: boolean;
}

export interface DocumentEvidence {
  id: string;
  type: "st_certificate" | "income_certificate" | "marksheet" | "admission_letter" | "bank_passbook";
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  uploadedAt: string;
  qualityScore: number; // 0 - 100
  extractedFields: {
    fieldId: string;
    label: string;
    value: string;
    confidence: number;
    box: { x: number; y: number; width: number; height: number }; // Percentage coords
  }[];
}

export interface AIFlag {
  id: string;
  ruleId: string;
  severity: "hard" | "soft" | "advisory";
  label: string;
  confidence: number;
  explanationEn: string;
  explanationHi: string;
  evidenceSnippet?: string;
  fieldId: string;
  status: "active" | "resolved" | "overridden";
}

export interface ApplicationRecord {
  id: string; // e.g. NFS-26-MP-88391
  applicantName: string;
  fatherName: string;
  dob: string;
  gender: string;
  tribe: string;
  state: string;
  district: string;
  aadhaarLastFour: string;
  familyIncome: number;
  instituteName: string;
  aisheCode: string;
  course: string;
  schemeId: string;
  schemeVersion?: string;
  status: "DRAFT" | "SUBMITTED" | "DEFICIENCY" | "VERIFIED" | "SELECTED" | "SANCTIONED" | "REJECTED" | "in_review" | "defective" | "submitted" | "verified" | "rejected";
  riskScore: number;
  riskBreakdown?: { factor: string; points: number }[];
  isAuditSample?: boolean;
  dbtSeedingStatus?: "SEEDED" | "NOT_SEEDED";
  flags?: AIFlag[];
  aiFlags?: any[];
  documents: any[];
  decisions?: {
    officerId: string;
    officerName: string;
    stage: string;
    outcome: "APPROVED" | "RETURNED" | "REJECTED";
    reasonCode?: string;
    timestamp: string;
    hash: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  entityId: string;
  details: string;
  sha256Hash: string;
}
