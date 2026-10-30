/**
 * Failsafe Demo Store
 * Ensures 100% reliable live demonstrations on Vercel serverless environments
 * even when external DB or local SQLite is unavailable.
 */

export interface DemoStudent {
  id: string;
  mobile: string;
  fullName: string;
  fatherName: string;
  dob: string;
  gender: string;
  email: string;
  socialCategory: string;
  domicileState: string;
  district: string;
  currentClass: string;
  schoolName: string;
  isHosteller: boolean;
  hasDisability: boolean;
  aadhaarLast4: string;
  bankAccountMasked: string;
  ifsc: string;
  bankName: string;
  bankHolderName: string;
  language: string;
  hasConsent: boolean;
  guardianConsentAt: string;
}

export const PERMANENT_DEMO_STUDENTS: Record<string, DemoStudent> = {
  // 1. Eligible ST Student (Primary Demo Account)
  '9876543210': {
    id: 'demo-student-birsa',
    mobile: '9876543210',
    fullName: 'Birsa Munda',
    fatherName: 'Sugana Munda',
    dob: '2011-04-14',
    gender: 'male',
    email: 'birsa.munda@demo.local',
    socialCategory: 'ST',
    domicileState: 'Jharkhand',
    district: 'Ranchi',
    currentClass: 'Class IX',
    schoolName: 'Govt Tribal High School, Khunti',
    isHosteller: false,
    hasDisability: false,
    aadhaarLast4: '4321',
    bankAccountMasked: 'XXXXXXXX4321',
    ifsc: 'SBIN0001234',
    bankName: 'State Bank of India',
    bankHolderName: 'Birsa Munda',
    language: 'en',
    hasConsent: true,
    guardianConsentAt: '2026-07-01T10:00:00.000Z'
  },
  // 2. High-Income ST Student (Demo Income Limit Enforcement)
  '9876543211': {
    id: 'demo-student-ramesh',
    mobile: '9876543211',
    fullName: 'Ramesh Oraon',
    fatherName: 'Mangra Oraon',
    dob: '2010-08-20',
    gender: 'male',
    email: 'ramesh.oraon@demo.local',
    socialCategory: 'ST',
    domicileState: 'Jharkhand',
    district: 'Gumla',
    currentClass: 'Class IX',
    schoolName: 'Model Secondary School',
    isHosteller: true,
    hasDisability: false,
    aadhaarLast4: '7890',
    bankAccountMasked: 'XXXXXXXX7890',
    ifsc: 'PUNB0123400',
    bankName: 'Punjab National Bank',
    bankHolderName: 'Ramesh Oraon',
    language: 'hi',
    hasConsent: true,
    guardianConsentAt: '2026-07-01T10:00:00.000Z'
  },
  // 3. General Category Student (Demo ST-Category Gating)
  '9876543212': {
    id: 'demo-student-priya',
    mobile: '9876543212',
    fullName: 'Priya Sharma',
    fatherName: 'Rajesh Sharma',
    dob: '2011-01-10',
    gender: 'female',
    email: 'priya.sharma@demo.local',
    socialCategory: 'GENERAL',
    domicileState: 'Delhi',
    district: 'North West Delhi',
    currentClass: 'Class IX',
    schoolName: 'Delhi Public School',
    isHosteller: false,
    hasDisability: false,
    aadhaarLast4: '1122',
    bankAccountMasked: 'XXXXXXXX1122',
    ifsc: 'HDFC0001234',
    bankName: 'HDFC Bank',
    bankHolderName: 'Priya Sharma',
    language: 'en',
    hasConsent: true,
    guardianConsentAt: '2026-07-01T10:00:00.000Z'
  }
};

export const PERMANENT_DEMO_APPLICATIONS = [
  {
    id: 'app-demo-1001',
    applicationNumber: 'SCH-2026-JH-88391',
    scholarshipId: 'pre-matric-st',
    status: 'SUBMITTED',
    academicYear: '2026-27',
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    aiRiskScore: 12,
    aiSummaryJson: JSON.stringify({
      verdict: 'CLEAR',
      passedChecks: 5,
      totalChecks: 5,
      flags: []
    }),
    student: {
      fullName: 'Birsa Munda',
      mobile: '9876543210',
      socialCategory: 'ST',
      domicileState: 'Jharkhand',
      currentClass: 'Class IX',
      schoolName: 'Govt Tribal High School, Khunti'
    },
    documents: [
      { id: 'doc-1', docTypeId: 'caste_certificate' },
      { id: 'doc-2', docTypeId: 'income_certificate' },
      { id: 'doc-3', docTypeId: 'bank_passbook' }
    ],
    reviews: []
  },
  {
    id: 'app-demo-1002',
    applicationNumber: 'SCH-2026-JH-88392',
    scholarshipId: 'pre-matric-st',
    status: 'UNDER_REVIEW',
    academicYear: '2026-27',
    submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    aiRiskScore: 68,
    aiSummaryJson: JSON.stringify({
      verdict: 'FLAGGED',
      passedChecks: 3,
      totalChecks: 5,
      flags: ['INCOME_THRESHOLD_CLOSE', 'OCR_MISMATCH']
    }),
    student: {
      fullName: 'Ramesh Oraon',
      mobile: '9876543211',
      socialCategory: 'ST',
      domicileState: 'Jharkhand',
      currentClass: 'Class IX',
      schoolName: 'Model Secondary School'
    },
    documents: [
      { id: 'doc-4', docTypeId: 'caste_certificate' },
      { id: 'doc-5', docTypeId: 'income_certificate' }
    ],
    reviews: []
  }
];
