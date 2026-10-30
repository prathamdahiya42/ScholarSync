-- =========================================================================
-- Adi-Setu: Ministry of Tribal Affairs (MoTA) Scholarship & Fellowship Database
-- Compatible with Supabase Free Tier (PostgreSQL 15+)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SCHEMES TABLE (Configurable statutory rules)
CREATE TABLE IF NOT EXISTS public.schemes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    ministry TEXT NOT NULL DEFAULT 'Ministry of Tribal Affairs',
    academic_year TEXT NOT NULL,
    income_ceiling_inr BIGINT,
    slots INTEGER,
    notified_institutes_count INTEGER,
    rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    ocr_deficiency_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. APPLICATIONS TABLE (Student submissions & states)
CREATE TABLE IF NOT EXISTS public.applications (
    id TEXT PRIMARY KEY,
    scheme_id TEXT REFERENCES public.schemes(id),
    applicant_name TEXT NOT NULL,
    father_name TEXT,
    dob DATE NOT NULL,
    gender TEXT NOT NULL,
    tribe TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    aadhaar_last_four TEXT NOT NULL,
    family_income BIGINT NOT NULL,
    institute_name TEXT NOT NULL,
    aishe_code TEXT NOT NULL,
    course TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('submitted', 'in_review', 'defective', 'verified', 'rejected', 'selected', 'disbursed')),
    risk_score INTEGER DEFAULT 0,
    ai_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
    documents JSONB NOT NULL DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AUDIT LOGS (Immutable hash-chained ledger for CAG compliance)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT,
    sha256_hash TEXT NOT NULL
);

-- 4. ROW LEVEL SECURITY (RLS Policies)
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can read active schemes
CREATE POLICY "Allow public read on schemes"
    ON public.schemes FOR SELECT
    USING (true);

-- Anyone can submit / read applications in demo mode
CREATE POLICY "Allow read application by ID"
    ON public.applications FOR SELECT
    USING (true);

CREATE POLICY "Allow insert new application"
    ON public.applications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow update application status"
    ON public.applications FOR UPDATE
    USING (true);

-- Audit logs are insert-only (tamper-evident)
CREATE POLICY "Allow read audit logs"
    ON public.audit_logs FOR SELECT
    USING (true);

CREATE POLICY "Allow append audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);
