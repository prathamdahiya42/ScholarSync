# AI-Assisted Scholarship Management & Verification Platform for ST Students

Official config-driven scholarship management and verification platform for Scheduled Tribe (ST) students in Classes IX & X (Pre-Matric Scholarship, Ministry of Tribal Affairs, Government of India).

---

## 🚀 Key Features

1. **Config-Driven Core**:
   - Any scholarship is defined via a single validated JSON file (`config/scholarships/*.json`).
   - Adding a new scholarship requires **zero code changes**: schemas, questionnaires, conditional documents, AI quality rules, reviewer checklists, and notification templates are loaded dynamically.
   - Strictly validates new configurations against `scholarship.schema.json` using **AJV**.
2. **Category Gate**:
   - Enforces `categoryRule.mode` (`ST_ONLY`, `OPEN_TO_ALL`, `ALLOWED_LIST`) on both the client catalog and the server API.
   - Non-ST students are transparently informed why a scheme is not applicable.
3. **Privacy & Security**:
   - **Aadhaar Privacy**: Collects and stores strictly the last 4 digits (`aadhaarLast4`).
   - **Bank Account Encryption**: Encrypted at rest via **AES-256-GCM**; displayed masked (`XXXXXX1234`) across UI and logs.
   - **Minor Consent**: Captures and timestamps parent/guardian consent before any certificate upload.
   - **Private Document Storage**: Files are stored outside `public/` and served only through authenticated routes with access auditing.
4. **Offline-Ready Provider Architecture**:
   - Runs out-of-the-box with **zero API keys** via mock and local providers (`tesseract.js`, Sharp image analysis, local storage, regex extractor, console/DB notification simulator).
   - Easily switched to real providers (Gemini Vision API, WhatsApp Business Cloud API, SMS DLT) via `.env`.
5. **Strict Human-in-the-Loop Verification**:
   - AI serves as a readability/consistency assistant—it **never makes approval decisions**.
   - Reviewer approval is gated until **every document is inspected** and **every checklist item is ticked**.

---

## 🛠️ Quick Start & Setup

### 1. Requirements
- Node.js 18+ (tested on Node 24)
- pnpm 10+ / npm

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
*(The defaults in `.env` are configured for instant offline/mock operation with no external API keys).*

### 3. Database Initialization & Seeding
Push the schema to SQLite and seed initial users, scholarships, and demo applications:
```bash
node ./node_modules/prisma/build/index.js db push
node --experimental-strip-types prisma/seed.ts
```

### 4. Run Development Server
```bash
pnpm dev
# or
node ./node_modules/next/dist/bin/next dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Credentials

| Role | Identifier / Email | Credential / Password | Details |
|---|---|---|---|
| **ST Student (Eligible)** | `9876543210` | OTP `123456` | Birsa Munda (Class IX, ST, Income ₹1.45L) — Eligible for Pre-Matric |
| **ST Student (High Income)**| `9876543211` | OTP `123456` | Ramesh Oraon (Class IX, ST, Income > ₹2.5L) — Fails income question |
| **General Category Student**| `9876543212` | OTP `123456` | Priya Sharma (Class IX, General) — Blocked from ST-only schemes |
| **Management Reviewer** | `reviewer@demo.local` | `Reviewer@123` | Verification Officer — Inspects submitted applications |
| **Platform Administrator**| `admin@demo.local` | `Admin@123` | Uploads scholarship JSON configs, inspects audit logs |

---

## 🧪 5-Minute Walkthrough Demo Script

1. **Student Login & Category Gating**:
   - Go to `http://localhost:3000/login`.
   - Click the 1-click test button for **Priya Sharma (General Category)**.
   - Visit the Catalog: Notice the Pre-Matric ST scholarship is located under *"Not Applicable for Your Category"* with the reason explained.
   - Log out, and 1-click login as **Birsa Munda (ST Category)**: Pre-Matric ST is prominently listed under *"Open for Your Category"*.
2. **Details Page & Eligibility Questionnaire**:
   - Click *Check Details & Eligibility* on Pre-Matric ST.
   - Notice: Funder (*Ministry of Tribal Affairs*), "Who is NOT giving this" (NSP, Schools), Age/Marks (shows *"No age limit set by Ministry"*), and Benefits breakdown.
   - Click *Check My Eligibility*.
   - Answer the Yes/No questions (all Yes, orphan No, other scholarships No, repeat class No).
   - Instant result: **"You are Eligible!"**
3. **Sequential Document Upload & AI Verification**:
   - Click *Proceed to Document Upload*.
   - Upload sample certificate files.
   - Sharp + OCR checks run immediately, returning **PASS** or **WARN** with humanized explanations.
   - Submit gate verifies all required documents have passed or been acknowledged before unlocking the final submit button.
4. **Final Submit & Status Tracking**:
   - Click *Review & Submit*, verify entered vs computed rates, and click *Confirm & Submit Application*.
   - Live state machine timeline displays status as **SUBMITTED**.
5. **Management Review (Strict Verification)**:
   - Go to `/login` and sign in as **Reviewer** (`reviewer@demo.local`).
   - Click *Review Queue*: application appears at top with SLA countdown.
   - Click *Inspect*:
     - Left pane: Document viewer with Zoom and Rotate controls.
     - Right pane: Student entered values vs OCR extracted fields, AI inspection flags, and official checklist.
     - Notice: **Approve button is disabled** until you view every document and tick every checklist box.
   - Tick all checklist items and click **Approve Application**.
6. **Notification Simulator & Audit Trail**:
   - In the top navigation, click *Sent Messages*:
   - View the simulated WhatsApp message: *"Congratulations Birsa Munda! Your application SCH-... has been approved."*
   - Check *Audit*: Notice every document view, status change, and login was permanently logged with timestamps.

---

## ➕ How to Add a New Scholarship (Zero Code Changes)

1. Create a JSON file that conforms to `scholarship.schema.json`. (See `config/scholarships/sample-merit-demo.json` for a reference implementation).
2. Go to the Admin Portal (`/admin/scholarships`) while logged in as `admin@demo.local`.
3. Click **Upload New Scholarship JSON**, paste your JSON content (or upload the file), and click **Validate & Activate**.
4. The system validates the JSON with AJV:
   - If invalid, field-by-field errors are displayed with schema paths.
   - If valid, the new scholarship immediately appears in the catalog, renders its details page, builds its questionnaire, and handles document slots with **zero code modifications**.

---

## ⚙️ Environment Variables Reference

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | SQLite database connection string (Postgres/Supabase compatible) |
| `BANK_ENCRYPTION_KEY` | *(32-byte hex)* | AES-256-GCM encryption key for bank account numbers |
| `SESSION_SECRET` | *(secret)* | Secret token for signed session cookies |
| `OCR_PROVIDER` | `tesseract` | OCR engine (`tesseract` \| `gemini` \| `mock`) |
| `EXTRACTOR_PROVIDER` | `regex` | Document field extraction (`regex` \| `gemini` \| `mock`) |
| `STORAGE_PROVIDER` | `local` | Private file storage (`local` \| `supabase`) |
| `NOTIFY_PROVIDER` | `mock` | Dispatches WhatsApp/SMS alerts (`mock` \| `whatsapp_cloud` \| `sms_msg91`) |
| `OTP_PROVIDER` | `mock` | Mobile OTP provider (`mock` accepts `123456`) |
| `ALLOW_EXTERNAL_AI` | `false` | Security gate: must be `true` to transmit documents to third-party AI APIs |
| `GEMINI_API_KEY` | `""` | Optional Google AI Studio key for Gemini Vision structured extraction |
| `GEMINI_MODEL` | `gemini-2.5-flash`| Gemini model ID |

---

## 🧪 Running Unit Tests

Run the pure-function eligibility engine test suite (covering all 8 specified edge cases + 3 category gate modes):
```bash
node --experimental-strip-types lib/eligibility-engine/engine.test.ts
```
Expected output: **17/17 tests passed**.
