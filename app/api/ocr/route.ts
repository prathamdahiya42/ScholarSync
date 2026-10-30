import { NextRequest, NextResponse } from "next/server";
import { ALL_MOTA_SCHEMES, MoTAScheme } from "@/lib/schemes";

export interface OcrResultField {
  label: string;
  value: string;
  confidence: number;
  boundingBox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in percentages 0-100
  isValid: boolean;
  issue?: string;
}

export interface OcrResponseData {
  documentType: string;
  schemeId: string;
  qualityScore: number; // 0 to 100
  extractedFields: Record<string, OcrResultField>;
  deficiencyFlags: {
    ruleId: string;
    flagText: string;
    severity: "hard" | "soft";
    sourceBox?: [number, number, number, number];
  }[];
  isPassed: boolean;
  processedInMs: number;
  mockBadge: boolean;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const {
      docType = "income_cert",
      schemeId = "PMS-ST",
      samplePreset = "golden_pass",
      userTypedIncome,
      userTypedTribe,
      userTypedName,
    } = body;

    const scheme: MoTAScheme =
      ALL_MOTA_SCHEMES.find((s) => s.id === schemeId) || ALL_MOTA_SCHEMES[0];

    const deficiencyFlags: OcrResponseData["deficiencyFlags"] = [];
    let extractedFields: Record<string, OcrResultField> = {};
    let qualityScore = 92;

    // Simulate realistic OCR extraction based on document type and test presets
    if (samplePreset === "income_exceeded") {
      qualityScore = 89;
      extractedFields = {
        name: {
          label: "Applicant Name",
          value: userTypedName || "Ramesh Kumar Gond",
          confidence: 0.98,
          boundingBox: [22, 15, 27, 50],
          isValid: true,
        },
        fatherName: {
          label: "Father's Name",
          value: "Mansingh Gond",
          confidence: 0.97,
          boundingBox: [29, 15, 34, 45],
          isValid: true,
        },
        annualIncome: {
          label: "Annual Family Income",
          value: "₹7,20,000",
          confidence: 0.96,
          boundingBox: [44, 25, 52, 60],
          isValid: false,
          issue: `Annual income ₹7,20,000 exceeds ceiling of ₹${(scheme.eligibility.income_ceiling_inr_per_year || 250000).toLocaleString()}`,
        },
        financialYear: {
          label: "Financial Year",
          value: "2024-2025",
          confidence: 0.94,
          boundingBox: [58, 20, 63, 40],
          isValid: true,
        },
        issuingAuthority: {
          label: "Competent Authority",
          value: "Tehsildar & Executive Magistrate, Dindori (M.P.)",
          confidence: 0.99,
          boundingBox: [78, 45, 88, 90],
          isValid: true,
        },
      };

      if (scheme.eligibility.income_ceiling_inr_per_year && 720000 > scheme.eligibility.income_ceiling_inr_per_year) {
        deficiencyFlags.push({
          ruleId: "OCR_INC_CEIL",
          flagText: `Extracted family income ₹7,20,000 violates ${scheme.id} statutory ceiling of ₹${scheme.eligibility.income_ceiling_inr_per_year.toLocaleString()}/yr.`,
          severity: "hard",
          sourceBox: [44, 25, 52, 60],
        });
      }
    } else if (samplePreset === "st_mismatch") {
      qualityScore = 85;
      extractedFields = {
        name: {
          label: "Applicant Name",
          value: "Ramesh K. Gond",
          confidence: 0.92,
          boundingBox: [20, 15, 26, 45],
          isValid: false,
          issue: "Spelling variant compared to Aadhaar record 'Ramesh Kumar Gond'",
        },
        community: {
          label: "ST Sub-Caste Declared",
          value: "Gond (Scheduled Tribe)",
          confidence: 0.95,
          boundingBox: [35, 18, 41, 55],
          isValid: true,
        },
        certificateNo: {
          label: "Certificate Barcode / Ref",
          value: "MP/DND/ST/2023/108922",
          confidence: 0.98,
          boundingBox: [10, 60, 16, 92],
          isValid: true,
        },
        issuingState: {
          label: "Domicile State",
          value: "Madhya Pradesh",
          confidence: 0.97,
          boundingBox: [48, 18, 54, 45],
          isValid: true,
        },
      };

      deficiencyFlags.push({
        ruleId: "OCR_NAME_MISMATCH",
        flagText: "Applicant name 'Ramesh K. Gond' differs from official Aadhaar eKYC name 'Ramesh Kumar Gond'.",
        severity: "soft",
        sourceBox: [20, 15, 26, 45],
      });
    } else if (samplePreset === "blurry") {
      qualityScore = 48; // Below quality threshold
      extractedFields = {
        documentState: {
          label: "Image Quality Assessment",
          value: "Blurry / Low Contrast / Watermark Obscured",
          confidence: 0.48,
          boundingBox: [10, 10, 90, 90],
          isValid: false,
          issue: "Document resolution or lighting is insufficient for automated legal scrutiny",
        },
      };

      deficiencyFlags.push({
        ruleId: "OCR_LOW_QUALITY",
        flagText: "Camera scan resolution score (48/100) below acceptable 75 threshold. Officer cannot verify government seal.",
        severity: "hard",
        sourceBox: [10, 10, 90, 90],
      });
    } else {
      // Golden Passing Case (Default)
      qualityScore = 96;
      const parsedIncome = userTypedIncome ? Number(userTypedIncome) : 210000;
      const ceiling = scheme.eligibility.income_ceiling_inr_per_year;
      const isIncomeValid = !ceiling || parsedIncome <= ceiling;

      extractedFields = {
        name: {
          label: "Applicant Name",
          value: userTypedName || "Ramesh Kumar Gond",
          confidence: 0.99,
          boundingBox: [22, 15, 28, 52],
          isValid: true,
        },
        fatherName: {
          label: "Father's Name",
          value: "Mansingh Gond",
          confidence: 0.98,
          boundingBox: [30, 15, 36, 48],
          isValid: true,
        },
        community: {
          label: "Scheduled Tribe (ST)",
          value: userTypedTribe || "Gond",
          confidence: 0.99,
          boundingBox: [38, 15, 44, 40],
          isValid: true,
        },
        annualIncome: {
          label: "Gross Annual Family Income",
          value: `₹${parsedIncome.toLocaleString()}`,
          confidence: 0.97,
          boundingBox: [46, 20, 53, 55],
          isValid: isIncomeValid,
          issue: isIncomeValid
            ? undefined
            : `Exceeds ${scheme.id} ceiling of ₹${ceiling?.toLocaleString()}`,
        },
        financialYear: {
          label: "Financial Year Validity",
          value: "2024-2025 (Valid for 2025-26 Admissions)",
          confidence: 0.96,
          boundingBox: [55, 15, 61, 45],
          isValid: true,
        },
        issuingAuthority: {
          label: "Competent Authority",
          value: "Sub-Divisional Officer (Revenue), Dindori",
          confidence: 0.98,
          boundingBox: [75, 45, 85, 90],
          isValid: true,
        },
      };

      if (!isIncomeValid) {
        deficiencyFlags.push({
          ruleId: "OCR_INC_CEIL",
          flagText: `Extracted income ₹${parsedIncome.toLocaleString()} exceeds statutory ceiling for ${scheme.id}.`,
          severity: "hard",
          sourceBox: [46, 20, 53, 55],
        });
      }
    }

    const responsePayload: OcrResponseData = {
      documentType: docType,
      schemeId: scheme.id,
      qualityScore,
      extractedFields,
      deficiencyFlags,
      isPassed: deficiencyFlags.length === 0 && qualityScore >= 70,
      processedInMs: Date.now() - startTime + 380, // Simulated fast Vision response time
      mockBadge: true,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "OCR processing failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
