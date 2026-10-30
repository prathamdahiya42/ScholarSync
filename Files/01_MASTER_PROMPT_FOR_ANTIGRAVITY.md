# MASTER PROMPT (paste everything below into Antigravity)

Before you start: the folder `/spec` in this project contains these files. Read them completely first, they are the source of truth:
- `/spec/scholarship.pre-matric-st.json` (the first scholarship config)
- `/spec/scholarship.schema.json` (JSON Schema every scholarship config must satisfy)
- `/spec/02_WORKFLOW_AND_DATA_MODEL.md` (workflow, state machine, data model, permissions)
- `/spec/03_DOCUMENT_AI_OCR_AND_NOTIFICATION_SPEC.md` (OCR, AI checks, notification providers)

---

## 1. What to build

Build the **first complete working draft** of an **AI-assisted Scholarship Management and Verification Platform** for tribal (Scheduled Tribe) students in India. It must run locally with **no API keys** (mock providers) and become "real" by adding keys to `.env`.

The first scholarship, built end-to-end, is the **Pre-Matric Scholarship for ST students (Classes IX and X)**. But the platform must be **config-driven**: every detail page, question, document slot, AI rule, review checklist and notification comes from a scholarship JSON file. Adding a new scholarship = adding a new JSON file (validated against `scholarship.schema.json`), with **zero code changes**. Some scholarships are ST-only and some are open to everyone (General, OBC, SC, etc.): the engine must honour `categoryRule.mode` (`ST_ONLY`, `OPEN_TO_ALL`, `ALLOWED_LIST`).

Human officials make the final decision. AI only helps with eligibility guidance, document quality/consistency checks and notifications. Never present AI output as an approval or as proof that a document is genuine.

## 2. Tech stack (use exactly this unless something is impossible)

- Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Prisma ORM with SQLite for local dev (keep the schema Postgres-compatible so switching to Supabase/Postgres is a one-line `DATABASE_URL` + provider change)
- Auth.js (NextAuth) credentials: students log in with mobile OTP, staff log in with email + password
- `zod` for validation, `ajv` to validate scholarship JSON against the schema
- `sharp` for server-side image checks, `tesseract.js` for OCR (`eng+hin`), `pdf-lib`/`pdfjs` for PDFs
- i18n: English and Hindi (a simple dictionary-based `t()` is fine)
- Provider pattern for every external service (see spec file 03): OCR, document extractor (Gemini), storage, notifications (WhatsApp Cloud API / SMS), OTP. Default all of them to working mock/local implementations.

## 3. Roles and areas

- **Student area** (mobile-first, big buttons, low-bandwidth friendly): register/login, profile, catalog, scholarship details, eligibility questionnaire, document upload, AI results, review and submit, status tracker, notifications.
- **Management area** (desktop-first): login, review queue with filters, application review screen, decision actions.
- **Admin area**: scholarship configs (list, view, upload new JSON with schema validation errors shown clearly), users/roles, audit log, settings (`ALLOW_EXTERNAL_AI`, notification mode).

## 4. Student flow (implement exactly)

1. **Login/Register** with mobile OTP (mock OTP `123456` in dev). Profile fields: full name, father's name, date of birth, gender, social category (ST, SC, OBC, General, EWS, Other), domicile state, district, current class, school name, hostel yes/no, bank holder name, account number, IFSC, bank name, preferred language, and a **parent/guardian consent** checkbox (students are minors). Aadhaar: only collect/store the last 4 digits.
2. **Catalog**: list scholarships. Show those the student's category can apply for first; show the rest in a "Not for your category" section with the reason. Enforce the category rule again on the server when creating an application.
3. **Scholarship details page** (one clear format, all from JSON):
   - Name, status, academic year
   - **Who is giving it**: ministry/funder, who implements it, funding split, how money reaches the student
   - **Who is NOT giving it**: the `notProviders` list
   - **Eligibility**: category rule, class/education level, **maximum age**, **minimum marks** (display "No age limit"/"No minimum marks set by the Ministry; a State may add its own" when null), family income limit and how it is counted, bank, other-scholarship and repeat-class rules
   - Benefits (day scholar vs hosteller, books grant, disability allowance)
   - Documents required (mark conditional ones)
   - Button: "Check my eligibility"
4. **Eligibility questionnaire**: one yes/no question per screen from `questionnaire.questions` plus `profileQuestions`. Implement `skipIf`, `eligibleAnswer`, `knockout`. Result is ELIGIBLE or INELIGIBLE. If ineligible, show each failed question's `failMessage` in plain language and suggest other scholarships. Save all answers with timestamps. Determine `fresh` vs `renewal` from the answers.
5. **Document upload one by one**: only after ELIGIBLE. Show the required list (apply `required`, `requiredIf`, `requiredUnless`). One document per screen with the student tip, camera/gallery upload, client-side compression and progress bar. Keep every uploaded version.
6. **AI verification**: runs right after each upload (show a loading state), returns PASS / WARN / FAIL with friendly messages in the student's language and a Retake button on FAIL. After 2+ documents run the cross-document checks. **Submit is disabled** until every required document is PASS or a WARN the student explicitly acknowledged. Any FAIL blocks Submit.
7. **Review and Submit**: summary of answers, documents and AI results, then Submit. On submit: status `SUBMITTED`, create the queue item, send the `APPLICATION_SUBMITTED` notification.
8. **Status tracker**: DRAFT, DOCS_IN_PROGRESS, SUBMITTED, UNDER_REVIEW, DEFECTIVE (shows reasons and a "Fix documents" button), APPROVED, REJECTED. Notification centre inside the app.

## 5. Management flow (strict manual verification)

- Queue of SUBMITTED applications (oldest first, SLA highlight from `slaDays`).
- Review screen: document viewer with zoom/rotate, extracted values next to the student-entered values, AI WARN/FAIL flags beside the relevant document, cross-check results, and the checklist from `manualVerification.levels[].checklist`.
- **Approve is disabled** until every document is opened and every checklist item is ticked.
- **Mark Defective** and **Reject** require a written reason (shown to the student).
- On Approve: status `APPROVED`, student profile gets the scholarship under "My scholarships", send `APPLICATION_APPROVED` (WhatsApp, SMS fallback, plus in-app). On Defective/Reject send the matching notification.
- Every view and decision goes to the audit log.

## 6. Notifications

Use `notifications.events` from the JSON (English and Hindi). Channel priority WhatsApp then SMS, always also in-app. Default provider is `mock`: save to the DB, print to the server console, and show in a "Sent messages (demo)" panel for admins. Real providers (WhatsApp Cloud API with approved templates, an SMS provider with DLT) must be implemented behind the interface and enabled only by env vars. Retry failures up to 3 times. Never include Aadhaar, income or bank details in messages.

## 7. Eligibility engine rules

- Pure function: `evaluate(config, answers) -> { eligible, failedQuestions[], applicationType }`. Unit-test it.
- Cover these test cases for the Pre-Matric JSON: eligible ST Class IX student; non-ST student fails `q_st`; income "no" fails `q_income`; orphan skips income; receiving another scholarship fails; repeating class fails; renewal without passing Class IX fails; Class XI student fails `q_class`.
- Category gate (`categoryRule`) unit-tested for all three modes.

## 8. Document AI rules

Implement the pipeline in spec file 03 exactly: validate file, normalize, quality checks (resolution, blur, brightness, glare, crop, face count for photo), OCR (`eng+hin`), structured extraction using each document's `ocrFields`, per-document rules from `perDocumentRules`, cross-document checks from `crossDocumentChecks`.
- Default extractor: rule-based regex on OCR text. Optional Gemini extractor when `GEMINI_API_KEY` is set AND `ALLOW_EXTERNAL_AI=true`. Use the extraction prompt from spec 03. Validate the model's JSON with zod, retry once, then fall back to regex.
- Never FAIL a document just because OCR could not read regional-language text; WARN and send to a human.
- Thresholds come from the JSON, not from code constants.

## 9. Data model and APIs

Create the Prisma schema from `/spec/02_WORKFLOW_AND_DATA_MODEL.md` (Student, Scholarship, Application, EligibilityAnswer, Document, AiCheck, CrossCheck, Review, Notification, User, AuditLog). Enforce the application state machine on the server; reject illegal transitions.

API routes (App Router route handlers), all validated with zod and role-checked:
- `POST /api/auth/otp/request`, `POST /api/auth/otp/verify`
- `GET /api/scholarships`, `GET /api/scholarships/[id]`
- `POST /api/applications`, `POST /api/applications/[id]/eligibility`
- `POST /api/applications/[id]/documents` (one document), `POST /api/documents/[id]/check`
- `POST /api/applications/[id]/submit`
- `GET /api/admin/applications`, `GET /api/admin/applications/[id]`, `POST /api/admin/applications/[id]/review`
- `POST /api/admin/scholarships` (upload JSON, validate with ajv, return readable errors)
- `GET /api/files/[id]` (auth check, short-lived signed access)

## 10. Security and privacy (must-have)

- Files stored outside any public folder; served only after an auth check.
- Aadhaar: last 4 digits only. Bank account number encrypted at rest and masked in UI/logs.
- Parent/guardian consent stored with timestamp before any upload.
- Role-based access, audit log for every reviewer document view and decision.
- OTP and upload rate limiting. File type/size validation. No secrets in the client.
- No document goes to a third-party AI API unless `ALLOW_EXTERNAL_AI=true`.

## 11. UX requirements

- Mobile-first; large touch targets; one task per screen; clear progress indicators.
- English/Hindi toggle everywhere, persisted per student.
- Plain, kind language. Never show raw errors, OCR confidence numbers or stack traces to students.
- Accessible: labels, contrast, keyboard navigation in the admin area.
- Loading, empty and error states for every screen.

## 12. Seed data and demo

Seed with:
- Staff: `admin@demo.local` (admin) and `reviewer@demo.local` (management_reviewer), passwords in README.
- Students: (1) ST Class IX student who is eligible, (2) ST student with income above the limit (should fail), (3) a General-category student who should NOT see the ST-only scholarship as applicable.
- The Pre-Matric config loaded from `/spec`.
- A second **clearly labelled DEMO** scholarship, "Sample Merit Scholarship (Open to All)", written as a new JSON file that validates against the schema with `categoryRule.mode = OPEN_TO_ALL` and a few different questions/documents, to prove the engine is generic. Mark it fictional.
- A few sample document images/PDFs (generated placeholders are fine) so the OCR pipeline can be demoed.

## 13. Out of scope for this draft

Real NSP/State portal integration, payments/DBT, real production hosting, official ST-list lookup. Show an "Approved = verified inside this platform" note in the UI.

## 14. How to work

1. First produce an **implementation plan** (folder structure, Prisma schema, route list, milestones) and wait for my approval.
2. Then build in this order: config loader + schema validation, Prisma schema and seed, eligibility engine with tests, student pages (profile, catalog, details, questionnaire), document upload + AI pipeline with mocks, submit flow, management review, notifications, admin config upload, polish.
3. After each milestone, run the type check, lint and tests and fix failures.
4. Finish with a `README.md`: setup steps, `.env.example` (every variable in spec 03), seed credentials, a 5-minute demo script, and a short "how to add a new scholarship" section.

## 15. Acceptance checklist (verify before saying done)

- [ ] `npm run dev` works with an empty `.env` copied from `.env.example`.
- [ ] Pre-Matric details page shows provider, not-providers, age/marks (as "none"), income rule, benefits, documents.
- [ ] General-category student cannot apply for the ST-only scholarship (UI and server).
- [ ] Questionnaire correctly passes and fails the 8 test cases above.
- [ ] Documents upload one by one; AI check returns PASS/WARN/FAIL; Submit is gated correctly.
- [ ] Reviewer cannot approve until every document is opened and every checklist item ticked.
- [ ] Approve updates the student profile and creates a notification (visible in the demo panel).
- [ ] Defective sends the student back to fix only the listed documents.
- [ ] Uploading a second valid JSON adds a new scholarship with no code change.
- [ ] No full Aadhaar number or plain bank number appears anywhere in the DB, logs or UI.
