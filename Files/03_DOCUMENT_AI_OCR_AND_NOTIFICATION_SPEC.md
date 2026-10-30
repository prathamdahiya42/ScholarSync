# Document Scanning, OCR, AI Verification and Notification Spec

Goal: the first draft must RUN with zero API keys (mock providers), and become real by only adding keys to `.env`. Every external service sits behind an interface.

---

## 1. Provider interfaces (build these first)

```ts
interface OcrProvider {
  extractText(file: Buffer, mime: string, langs: string[]): Promise<{ text: string; avgConfidence: number; words?: any[] }>;
}
interface DocumentExtractor {            // structured fields from the document
  extract(file: Buffer, mime: string, docTypeId: string, fields: string[]): Promise<{ fields: Record<string, string | number | null>; confidence: number; notes?: string[] }>;
}
interface StorageProvider { put(path: string, data: Buffer): Promise<void>; get(path: string): Promise<Buffer>; signedUrl(path: string, ttlSec: number): Promise<string>; }
interface NotificationProvider { send(msg: { to: string; channel: 'whatsapp' | 'sms'; templateId: string; vars: Record<string,string>; text: string }): Promise<{ ok: boolean; providerMessageId?: string; error?: string }>; }
interface OtpProvider { sendOtp(mobile: string): Promise<void>; verifyOtp(mobile: string, code: string): Promise<boolean>; }
```

Select implementations from env:

| Env var | Values | Default |
|---|---|---|
| `OCR_PROVIDER` | `tesseract` \| `gemini` \| `google_vision` \| `mock` | `tesseract` |
| `EXTRACTOR_PROVIDER` | `gemini` \| `regex` \| `mock` | `regex` (rule-based on OCR text) |
| `STORAGE_PROVIDER` | `local` \| `supabase` | `local` (folder outside `public/`) |
| `NOTIFY_PROVIDER` | `mock` \| `whatsapp_cloud` \| `sms_msg91` \| `sms_twilio` | `mock` |
| `OTP_PROVIDER` | `mock` \| `sms_msg91` \| `sms_twilio` | `mock` (accept `123456`, dev only) |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | key, model id | empty |

Mock mode: notifications are written to the DB and shown in an in-app "Sent messages (demo)" panel and the server console, so the full flow is demoable offline.

## 2. Options for OCR / document intelligence

| Option | Cost | Good for | Notes |
|---|---|---|---|
| Tesseract (tesseract.js, `eng+hin`) | Free, runs on your server | Default OCR text, works offline | Weaker on phone photos and handwriting. Always run preprocessing first. |
| Gemini (vision) API | Free tier exists, then paid | Structured field extraction into JSON, Hindi and regional text, reading stamps/tables | Best demo quality. Check current free-tier limits and model names in Google AI Studio before relying on them. |
| Google Cloud Vision (OCR) | Small free monthly quota, then paid | High-accuracy OCR | Needs a Google Cloud project with billing enabled. Check current quota. |
| Sarvam / other Indic services | Check pricing | Indian-language text | Optional later swap behind `OcrProvider`. |

Recommended for the hackathon: **Tesseract for raw OCR + Gemini for structured extraction**, with regex fallback so the demo never dies if the API is down.

Do not hard-code model names. Read `GEMINI_MODEL` from env.

## 3. Pipeline per uploaded document

```
upload
 -> 1. validate file: mime, size, not password-protected PDF, PDF pages <= max
 -> 2. normalize: PDFs -> first N pages to images; auto-rotate (EXIF); resize to max 2000px long edge
 -> 3. quality checks (sharp / canvas):
        resolution, blur (Laplacian variance), brightness, glare ratio, cropped edges, face count (photo only)
 -> 4. preprocess for OCR: grayscale, contrast normalize, denoise, deskew
 -> 5. OCR text (eng+hin) with confidence
 -> 6. structured extraction using ocrFields from the scholarship JSON
 -> 7. per-document rules from aiVerification.perDocumentRules
 -> 8. cross-document checks (after each upload, when 2+ docs exist)
 -> 9. save AiCheck: status, student messages, reviewer flags
```

Quality check defaults come from `aiVerification.imageQuality` in the JSON. Treat them as starting values and tune with real phone photos taken in poor light.

Status logic:
- `FAIL`: unreadable, too blurry/dark, wrong document type, required field missing, income above limit, self-declaration/affidavit, hard name mismatch.
- `WARN`: borderline quality, low OCR confidence, soft name mismatch, issue date outside admission year, anything that needs a human eye.
- `PASS`: all checks fine.

Important behaviours:
- Never FAIL a document only because OCR could not read regional-language text. WARN and let management look.
- Student messages are plain and actionable, in the student's language. Reviewer flags are technical and shown only in the admin view.
- Do not use AI to decide that a certificate is genuine. Show it as "needs reviewer's eyes" where relevant (for example, community name vs the official ST list).

## 4. Extraction prompt (use for the Gemini extractor)

System prompt:
```
You extract fields from an Indian government document image for a scholarship application.
Return ONLY valid JSON. No explanations, no markdown.
If a field is not clearly visible, use null. Never guess or invent values.
Names may be in Hindi or English: return the text exactly as printed, and also add the field "<name>_en" with an English transliteration if the original is Hindi.
Dates: return as YYYY-MM-DD when possible, else the raw text.
Amounts: return numbers only (no commas or currency symbols).
Also return:
  "document_type_guess": one of ["aadhaar","domicile","st_certificate","income_certificate","disability_certificate","bank_proof","school_proof","photo","other"],
  "is_self_declaration_or_affidavit": true/false,
  "has_stamp_or_seal_region": true/false,
  "has_signature_region": true/false,
  "legibility": number from 0 to 1,
  "notes": short list of anything unusual
```

User message template:
```
Document slot: {{docTypeId}}
Fields wanted: {{ocrFields}}
Extract the fields from the attached image.
```

Aadhaar rule: ask only for the last 4 digits. Never request or store the full number.

Validate the model's JSON against a schema. If invalid, retry once, then fall back to the regex extractor.

## 5. Per-document checks (implementation hints)

| Doc | Hints |
|---|---|
| aadhaar | Look for a 12-digit pattern grouped 4-4-4; keep only the last 4. DOB format `DD/MM/YYYY`. |
| st_certificate | Keywords: "Scheduled Tribe", "अनुसूचित जनजाति", community name, issuing authority, certificate number, seal. Flag `community` for manual check against the State ST list. |
| income_certificate | Extract annual income. If text says "monthly" flag it. If it is an affidavit or self-declaration, FAIL with a clear message. Compare issue date to the admission year. |
| domicile | State and district must match the profile's domicile state. |
| bank_proof | IFSC regex `^[A-Z]{4}0[A-Z0-9]{6}$`; account number 9-18 digits; holder name must match the student or parent. |
| photo | Exactly one face, not blurry, reasonable size. Face detection via a small client/server library; if unavailable, skip with WARN. |
| school_proof | Class IX or X, school name, academic year. |

Fuzzy name match: lowercase, strip titles and punctuation, handle initials and word order, compare with Jaro-Winkler or token-set ratio. Thresholds are in the JSON (`similarity.warnBelow`, `failBelow`).

## 6. Privacy and security for documents

- Class IX-X students are minors. Collect parent/guardian consent before upload and store `guardianConsentAt`.
- Store files outside any public folder. Serve only through short-lived signed URLs after an auth check.
- Encrypt at rest where the provider allows. Keep Aadhaar to last 4 digits only. Mask bank numbers in UI and logs.
- Log every reviewer view of a document (who, when).
- Add a data-retention setting and a "delete my data" request path (admin-handled in the first draft).
- Do not send documents to a third-party AI API unless the env flag `ALLOW_EXTERNAL_AI=true`. When false, use Tesseract + regex only. Show this clearly in the admin settings.
- Rate-limit OTP requests and uploads.

## 7. Notifications

### Events and templates
Use the four events and the English/Hindi texts in `notifications.events` in the scholarship JSON. Variables: `studentName`, `applicationId`, `scholarshipName`, `reason`.

Rules:
- Send to the student's registered, OTP-verified mobile number.
- Preferred channel WhatsApp, fall back to SMS, always also create an in-app notification.
- Never put Aadhaar, income or bank details in a message.
- Retry failed sends up to 3 times with backoff, then mark `failed` and show it in the admin panel.

### WhatsApp (Meta WhatsApp Business Cloud API)
- Business-initiated messages must use **pre-approved message templates**. Create templates matching the four event texts and submit them for approval in Meta Business Manager.
- Needs a Meta business account, a phone number, a permanent access token and a phone-number ID.
- Env: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_API_VERSION`.
- Check Meta's current pricing and policy for the message category you use before launch.

### SMS (India)
- Indian SMS requires **DLT registration** (sender ID and registered templates) before messages are delivered. Use a provider that supports it (for example MSG91 or Fast2SMS, or Twilio with DLT setup).
- Keep the SMS text short. Hindi SMS needs Unicode mode, which lowers the characters per segment.
- Env (example): `SMS_API_KEY`, `SMS_SENDER_ID`, `SMS_DLT_ENTITY_ID`, `SMS_TEMPLATE_IDS_JSON`.

### For the demo
Run with `NOTIFY_PROVIDER=mock`. The "Sent messages (demo)" panel shows exactly what would be sent. Add real keys later without code changes.

## 8. Costs and limits warning
Free tiers, quotas, prices and model names change often. Before the demo, confirm current limits for Gemini, Google Vision, WhatsApp Cloud API and your SMS provider, and keep the mock/Tesseract fallback ready.
