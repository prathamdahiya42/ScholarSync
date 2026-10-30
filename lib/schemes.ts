import tribalSchemesRaw from "@/tribal_scholarship_schemes.json";

export interface MoTAScheme {
  id: string;
  name: string;
  ministry: string;
  type: string;
  level: string;
  portal: string;
  implementing_body?: string;
  eligibility: {
    category: string;
    income_ceiling_inr_per_year: number | null;
    income_note?: string;
    min_marks_pct?: number | string | null;
    admission?: string;
    must_have_passed?: string;
    bank?: string;
    exclusions: string[];
    slots?: any;
    institution_types?: string[];
  };
  benefit: any;
  documents: {
    id: string;
    name: string;
    required?: boolean;
    fresh?: boolean;
    renewal?: boolean;
    note?: string;
  }[];
  workflow: string[];
  renewal?: any;
  ocr_deficiency_flags: string[];
  suggested_timeline?: any;
}

export interface MoTASchemesDataset {
  meta: {
    prepared_on: string;
    purpose: string;
    caveats: string[];
    sources: string[];
  };
  shared_rules: {
    income_definition: string;
    income_computation: Record<string, string>;
    one_scholarship_at_a_time: boolean;
    false_statement_penalty: string;
    payment: string;
    cross_document_checks: string[];
  };
  schemes: MoTAScheme[];
  ai_assist_ideas_human_decides: string[];
}

export const TRIBAL_SCHEMES_DATA = tribalSchemesRaw as MoTASchemesDataset;

export const ALL_MOTA_SCHEMES: MoTAScheme[] = TRIBAL_SCHEMES_DATA.schemes;

export function getSchemeById(id: string): MoTAScheme | undefined {
  return ALL_MOTA_SCHEMES.find((s) => s.id === id);
}
