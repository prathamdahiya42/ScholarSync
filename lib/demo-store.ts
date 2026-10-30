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
  decryptedAccountNumber?: string;
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
    district: 'Khunti',
    currentClass: 'Class IX',
    schoolName: 'Govt Tribal High School, Khunti',
    isHosteller: false,
    hasDisability: false,
    aadhaarLast4: '4321',
    bankAccountMasked: 'XXXXXXXX4321',
    decryptedAccountNumber: '409823194821',
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
    decryptedAccountNumber: '301982736192',
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
    decryptedAccountNumber: '501928374619',
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
    type: 'NEW',
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    aiRiskScore: 12,
    aiSummaryJson: JSON.stringify({
      verdict: 'CLEAR',
      passedChecks: 5,
      totalChecks: 5,
      flags: []
    }),
    student: {
      id: 'demo-student-birsa',
      fullName: 'Birsa Munda',
      mobile: '9876543210',
      socialCategory: 'ST',
      domicileState: 'Jharkhand',
      district: 'Khunti',
      currentClass: 'Class IX',
      schoolName: 'Govt Tribal High School, Khunti',
      bankName: 'State Bank of India',
      bankAccountMasked: 'XXXXXXXX4321',
      decryptedAccountNumber: '409823194821',
      ifsc: 'SBIN0001234'
    },
    documents: [
      { id: 'doc-st-1', docTypeId: 'st_certificate', fileName: 'jharkhand_st_caste_cert.pdf', version: 1, mime: 'text/plain' },
      { id: 'doc-inc-2', docTypeId: 'income_certificate', fileName: 'income_cert_2026_27.pdf', version: 1, mime: 'text/plain' },
      { id: 'doc-bnk-3', docTypeId: 'bank_proof', fileName: 'sbi_passbook_frontpage.pdf', version: 1, mime: 'text/plain' }
    ],
    reviews: []
  },
  {
    id: 'app-demo-1002',
    applicationNumber: 'SCH-2026-JH-88392',
    scholarshipId: 'pre-matric-st',
    status: 'UNDER_REVIEW',
    academicYear: '2026-27',
    type: 'NEW',
    submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    aiRiskScore: 68,
    aiSummaryJson: JSON.stringify({
      verdict: 'FLAGGED',
      passedChecks: 3,
      totalChecks: 5,
      flags: ['INCOME_THRESHOLD_CLOSE', 'OCR_MISMATCH']
    }),
    student: {
      id: 'demo-student-ramesh',
      fullName: 'Ramesh Oraon',
      mobile: '9876543211',
      socialCategory: 'ST',
      domicileState: 'Jharkhand',
      district: 'Gumla',
      currentClass: 'Class IX',
      schoolName: 'Model Secondary School',
      bankName: 'Punjab National Bank',
      bankAccountMasked: 'XXXXXXXX7890',
      decryptedAccountNumber: '301982736192',
      ifsc: 'PUNB0123400'
    },
    documents: [
      { id: 'doc-st-4', docTypeId: 'st_certificate', fileName: 'jharkhand_st_oraon_cert.pdf', version: 1, mime: 'text/plain' },
      { id: 'doc-inc-5', docTypeId: 'income_certificate', fileName: 'income_cert_gumla.pdf', version: 1, mime: 'text/plain' }
    ],
    reviews: []
  }
];

export function getDemoApplicationDetail(id: string) {
  const isRamesh = id === 'app-demo-1002' || id.includes('ramesh') || id.includes('1002');
  const targetStudent = isRamesh ? PERMANENT_DEMO_STUDENTS['9876543211'] : PERMANENT_DEMO_STUDENTS['9876543210'];
  const baseApp = PERMANENT_DEMO_APPLICATIONS.find((a) => a.id === id) || PERMANENT_DEMO_APPLICATIONS[isRamesh ? 1 : 0];

  return {
    id: id || baseApp.id,
    applicationNumber: baseApp.applicationNumber,
    scholarshipId: baseApp.scholarshipId,
    status: baseApp.status,
    academicYear: baseApp.academicYear,
    type: 'NEW',
    submittedAt: baseApp.submittedAt,
    aiRiskScore: baseApp.aiRiskScore,
    aiSummaryJson: baseApp.aiSummaryJson,
    student: {
      ...targetStudent,
      decryptedAccountNumber: targetStudent.decryptedAccountNumber || '409823194821'
    },
    answers: [
      { id: 'ans-1', questionId: 'current_class', answerText: targetStudent.currentClass },
      { id: 'ans-2', questionId: 'family_income', answerText: isRamesh ? '240000' : '84000' },
      { id: 'ans-3', questionId: 'is_hosteller', answerText: targetStudent.isHosteller ? 'YES' : 'NO' }
    ],
    documents: isRamesh
      ? [
          {
            id: 'doc-st-4',
            docTypeId: 'st_certificate',
            fileName: 'jharkhand_st_oraon_cert.pdf',
            version: 1,
            mime: 'text/plain',
            storagePath: 'mock/jharkhand_st_oraon_cert.pdf',
            uploadedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            aiChecks: [
              {
                id: 'ai-chk-4',
                status: 'PASS',
                confidence: 0.98,
                ocrText: `========================================================================\n                 GOVERNMENT OF JHARKHAND\n         OFFICE OF THE SUB-DIVISIONAL OFFICER, GUMLA\n              SCHEDULED TRIBE CASTE CERTIFICATE\n========================================================================\n\nCertificate No: JH/ST/2024/071923\nDate of Issue : 11-03-2024\n\nThis is to certify that Shri RAMESH ORAON, Son of Shri MANGRA ORAON,\nresiding at Village: BISHUNPUR, District: GUMLA, JHARKHAND,\nbelongs to the ORAON community which is recognized as a SCHEDULED TRIBE (ST)\nunder the Constitution (Scheduled Tribes) Order, 1950.\n\nIssuing Authority : Sub-Divisional Magistrate, Gumla\nDigital PKI Hash  : 9C12-88EF-7A01-331B\nStatus            : VERIFIED`,
                extractedJson: JSON.stringify({
                  "Certificate No": "JH/ST/2024/071923",
                  "Candidate Name": "Ramesh Oraon",
                  "Father Name": "Mangra Oraon",
                  "Community": "Oraon (ST)",
                  "State": "Jharkhand",
                  "District": "Gumla",
                  "Authenticity": "VERIFIED (e-District)"
                }),
                flagsJson: JSON.stringify([
                  "Valid Oraon ST community recognized in Jharkhand",
                  "Digital signature authenticated"
                ])
              }
            ]
          },
          {
            id: 'doc-inc-5',
            docTypeId: 'income_certificate',
            fileName: 'income_cert_gumla.pdf',
            version: 1,
            mime: 'text/plain',
            storagePath: 'mock/income_cert_gumla.pdf',
            uploadedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
            aiChecks: [
              {
                id: 'ai-chk-5',
                status: 'WARN',
                confidence: 0.91,
                ocrText: `========================================================================\n                 GOVERNMENT OF JHARKHAND\n        REVENUE DEPARTMENT - CIRCLE OFFICE, BISHUNPUR\n                     ANNUAL INCOME CERTIFICATE\n========================================================================\n\nCertificate No: JH/INC/2026/088190\nDate of Issue : 22-04-2026\n\nThis is to certify that the total annual family income of Shri MANGRA ORAON\n(Father of RAMESH ORAON), resident of Bishunpur, Gumla from all sources is:\nTotal Family Income: ₹2,40,000/- per annum\n(Two Lakh Forty Thousand Rupees Only)\n\nScheme Ceiling Limit: ₹2,50,000/- per annum\nReviewer Notice     : Borderline income (96% of upper scheme limit).\n\nIssuing Officer : Circle Officer, Bishunpur`,
                extractedJson: JSON.stringify({
                  "Certificate No": "JH/INC/2026/088190",
                  "Guardian Name": "Mangra Oraon",
                  "Student": "Ramesh Oraon",
                  "Annual Income": "₹2,40,000",
                  "Scheme Ceiling": "₹2,50,000",
                  "Margin to Limit": "₹10,000 (Close to ceiling)"
                }),
                flagsJson: JSON.stringify([
                  "WARNING: Declared income is 96% of maximum allowable ceiling (₹2.5L)",
                  "Reviewer secondary inspection advised"
                ])
              }
            ]
          }
        ]
      : [
          {
            id: 'doc-st-1',
            docTypeId: 'st_certificate',
            fileName: 'jharkhand_st_caste_cert.pdf',
            version: 1,
            mime: 'text/plain',
            storagePath: 'mock/jharkhand_st_caste_cert.pdf',
            uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            aiChecks: [
              {
                id: 'ai-chk-1',
                status: 'PASS',
                confidence: 0.99,
                ocrText: `========================================================================\n                 GOVERNMENT OF JHARKHAND\n         OFFICE OF THE SUB-DIVISIONAL OFFICER, KHUNTI\n              SCHEDULED TRIBE CASTE CERTIFICATE\n========================================================================\n\nCertificate No: JH/ST/2024/098231\nDate of Issue : 14-04-2024\nApplication ID: JH-CAST-882910\n\nThis is to certify that Shri BIRSA MUNDA, Son of Shri SUGANA MUNDA\nand Smt. KARMI HATU, residing at Village: ULIHATU, Post: KHUNTI,\nPolice Station: KHUNTI, District: KHUNTI, in the State of JHARKHAND,\nbelongs to the MUNDA community which is recognized as a SCHEDULED TRIBE (ST)\nunder the Constitution (Scheduled Tribes) Order, 1950 as amended.\n\nShri BIRSA MUNDA and his family ordinarily reside in Village ULIHATU of\nDistrict KHUNTI of the State of JHARKHAND.\n\nIssuing Authority    : Sub-Divisional Magistrate (SDM), Khunti\nDigital Signature    : VALID (Verified via JharSewa PKI Infrastructure)\nVerification Hash    : A7F4-982E-C10B-7742\nGovernment Seal      : EMBOSSED & REGISTERED`,
                extractedJson: JSON.stringify({
                  "Certificate No": "JH/ST/2024/098231",
                  "Candidate Name": "Birsa Munda",
                  "Father Name": "Sugana Munda",
                  "Tribe / Community": "Munda (Scheduled Tribe)",
                  "State of Domicile": "Jharkhand",
                  "District": "Khunti",
                  "Issuing Authority": "Sub-Divisional Magistrate, Khunti",
                  "JharSewa Verification": "VERIFIED & AUTHENTIC"
                }),
                flagsJson: JSON.stringify([
                  "Name matched student profile with 100% confidence",
                  "Valid ST caste community listed under State Gazette",
                  "Digital signature confirmed through state trust chain"
                ])
              }
            ]
          },
          {
            id: 'doc-inc-2',
            docTypeId: 'income_certificate',
            fileName: 'income_cert_2026_27.pdf',
            version: 1,
            mime: 'text/plain',
            storagePath: 'mock/income_cert_2026_27.pdf',
            uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            aiChecks: [
              {
                id: 'ai-chk-2',
                status: 'PASS',
                confidence: 0.98,
                ocrText: `========================================================================\n                 GOVERNMENT OF JHARKHAND\n        REVENUE & LAND REFORMS DEPARTMENT - CIRCLE KHUNTI\n                     ANNUAL INCOME CERTIFICATE\n========================================================================\n\nCertificate No: JH/INC/2026/044192\nDate of Issue : 18-05-2026\nFinancial Year: 2026 - 2027\n\nThis is to certify that upon due enquiry and field verification by the\nRevenue Inspector, the total annual income of the family of Shri SUGANA MUNDA\n(Father / Legal Guardian of BIRSA MUNDA), resident of Village ULIHATU,\nCircle KHUNTI, District KHUNTI, JHARKHAND from all sources (Agriculture,\nDaily Wage Labour, and Allied Activities) is assessed as under:\n\n   Total Family Income: ₹84,000/- per annum\n   (In Words: Eighty-Four Thousand Rupees Only)\n\nPre-Matric ST Scheme Income Ceiling: ₹2,50,000/- per annum\nIncome Compliance Status           : WITHIN SCHEME LIMIT (PASS)\n\nIssuing Officer  : Circle Officer (CO), Khunti Circle\nDigital Stamp    : JharSewa e-District Portal Verified\nTamper Check     : PASSED (QR verification confirmed)`,
                extractedJson: JSON.stringify({
                  "Certificate No": "JH/INC/2026/044192",
                  "Guardian Name": "Sugana Munda",
                  "Student Beneficiary": "Birsa Munda",
                  "Annual Income": "₹84,000",
                  "Scheme Ceiling": "₹2,50,000",
                  "Financial Year": "2026-2027",
                  "Circle Office": "Khunti, Jharkhand",
                  "Compliance Verdict": "ELIGIBLE (Income <= 2.5L)"
                }),
                flagsJson: JSON.stringify([
                  "Income ₹84,000 is safely below ₹2.5 Lakh threshold",
                  "Issued within valid financial year 2026-27",
                  "Guardian name matches student profile"
                ])
              }
            ]
          },
          {
            id: 'doc-bnk-3',
            docTypeId: 'bank_proof',
            fileName: 'sbi_passbook_frontpage.pdf',
            version: 1,
            mime: 'text/plain',
            storagePath: 'mock/sbi_passbook_frontpage.pdf',
            uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
            aiChecks: [
              {
                id: 'ai-chk-3',
                status: 'PASS',
                confidence: 0.99,
                ocrText: `========================================================================\n                    STATE BANK OF INDIA\n               KHUNTI MAIN BRANCH (CODE: 01234)\n             SAVINGS BANK PASSBOOK / ACCOUNT PROOF\n========================================================================\n\nAccount Holder Name : BIRSA MUNDA\nAccount Number      : 409823194821 (Masked: XXXXXXXX4321)\nCIF Number          : 8849102931\nAccount Type        : Savings Bank - Basic (BSBDA)\nIFSC Code           : SBIN0001234\nMICR Code           : 834002015\nBranch Address      : Main Road, Khunti, Jharkhand - 835210\n\nAadhaar Seeding     : YES (NPCI Aadhaar Payment Bridge Active)\nDirect Benefit (DBT): ENABLED & VERIFIED\nAccount Status      : ACTIVE & OPERATIVE\nNominee Registered  : YES (Sugana Munda - Father)`,
                extractedJson: JSON.stringify({
                  "Bank Name": "State Bank of India",
                  "Account Holder": "Birsa Munda",
                  "Account Number": "409823194821",
                  "Masked Account": "XXXXXXXX4321",
                  "IFSC Code": "SBIN0001234",
                  "Branch": "Khunti Main Branch",
                  "Aadhaar DBT Link": "ACTIVE / ENABLED",
                  "PFMS Validation": "SUCCESS"
                }),
                flagsJson: JSON.stringify([
                  "Account holder name matches candidate profile exactly",
                  "NPCI DBT mapper verified active for direct scholarship transfer",
                  "IFSC code resolved to valid SBI branch"
                ])
              }
            ]
          }
        ],
    crossChecks: isRamesh
      ? [
          {
            id: 'cc-1',
            checkId: 'name_identity_cross_check',
            status: 'PASS',
            detailJson: JSON.stringify({
              comparisonNotes: 'Aadhaar, Caste Certificate, and School Record match Ramesh Oraon.'
            })
          },
          {
            id: 'cc-2',
            checkId: 'income_ceiling_compliance',
            status: 'WARN',
            detailJson: JSON.stringify({
              comparisonNotes: 'Family income ₹2,40,000 approaches threshold limit ₹2,50,000.'
            })
          }
        ]
      : [
          {
            id: 'cc-1',
            checkId: 'name_identity_cross_check',
            status: 'PASS',
            detailJson: JSON.stringify({
              comparisonNotes: '100% token & phonetic match across Aadhaar, Caste Certificate, and Bank Account (Birsa Munda).'
            })
          },
          {
            id: 'cc-2',
            checkId: 'caste_validity_cross_check',
            status: 'PASS',
            detailJson: JSON.stringify({
              comparisonNotes: 'Munda (ST) officially notified in Jharkhand State Scheduled Tribe Schedule (Order 1950).'
            })
          },
          {
            id: 'cc-3',
            checkId: 'income_ceiling_compliance',
            status: 'PASS',
            detailJson: JSON.stringify({
              comparisonNotes: 'Verified annual family income ₹84,000 is well below the scheme maximum ceiling of ₹2,50,000.'
            })
          },
          {
            id: 'cc-4',
            checkId: 'bank_dbt_seeding_check',
            status: 'PASS',
            detailJson: JSON.stringify({
              comparisonNotes: 'Bank account is active and seeded with Aadhaar on NPCI mapper for Direct Benefit Transfer.'
            })
          }
        ],
    reviews: []
  };
}

export function updateDemoApplicationStatus(id: string, newStatus: string, reason?: string) {
  const app = PERMANENT_DEMO_APPLICATIONS.find((a) => a.id === id);
  if (app) {
    app.status = newStatus;
  }
}
