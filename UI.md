# UI.md — Design System for the Scholarship & Fellowship Platform

> Read this file fully before writing any UI code. It overrides your default style choices.
> Product name placeholder: `{{PRODUCT_NAME}}` (replace once decided).

---

## 0. Rules for the coding agent

1. Follow this file over your own taste. If something is not specified, choose the quieter option.
2. Build tokens and the core components (Section 7–8) FIRST, then screens. Never hardcode colors, radii or durations; use tokens.
3. Use shadcn/ui as the component base. Do not install more than the libraries listed in Section 12.
4. No gradients on backgrounds, no glow, no glassmorphism, no neon, no emoji as icons, no purple-to-blue hero gradients. If it looks like a template, delete it.
5. Every screen must pass: keyboard-only use, visible focus, 4.5:1 text contrast, Hindi text rendering without clipping.
6. Light theme only. Do not build dark mode.
7. Every mocked service (Aadhaar, DigiLocker, bank seeding, payment, SMS/WhatsApp) shows the `MockBadge` wherever it answers.

---

## 1. Product context (what this UI serves)

A national-level scholarship platform (primary scheme: National Fellowship & Scholarship for ST students; second scheme runs by config only). Core principle: **AI prepares the file, two humans decide it.**

Surfaces:
| Surface | User | Device | Density |
|---|---|---|---|
| Applicant PWA | Student / helper (CSC, hostel warden) | Low-end phone, Hindi first | Low, large touch targets |
| Public eligibility checker | Anyone, no login | Phone | Low |
| Officer cockpit | Institute / Ministry officer | Desktop | High |
| Rule Studio + what-if simulator | Scheme owner | Desktop | Medium |
| Committee view | Selection committee | Desktop | Medium |
| Admin dashboard | Ministry / State | Desktop / projector | Medium |

Tone: calm, official, trustworthy, plain language. Never playful, never "startup".

---

## 2. Design direction: "Calm civic clarity"

Reference feel: a well-run public-sector product designed by a good studio. Think GOV.UK clarity + Linear's precision + Stripe's restraint. Warm paper background, deep teal as the single brand color, ochre used only to draw attention to time and risk. Generous whitespace, thin borders instead of heavy shadows, type does most of the work.

Do not use tribal patterns, motifs, feathers, or stereotyped imagery anywhere (plan requirement). Use neutral line illustrations only, and sparingly.

---

## 3. Signature idea: AI and human look different

This is the visual proof of "AI flags, officer decides". Apply it everywhere, consistently.

| Actor | Visual language |
|---|---|
| **AI signal** (flag, OCR read, summary, risk score) | Indigo tint, **dashed** border, small `sparkle`-free "AI" tag (text only, no sparkle icon), always shows confidence + rule id |
| **Human decision** (approve, return, reject, sign-off) | Teal, **solid** border/fill, officer name + timestamp |
| **Mocked service** | Ochre **dashed** badge reading `MOCK` |
| **Human gate** (workflow) | Solid teal outline node with a small "Human decision" caption |

Rule: an AI element can never use a solid primary-colored fill, and a decision button can never use the indigo AI palette. A judge should be able to tell who acted from color and border style alone.

---

## 4. Color tokens

Paste into `globals.css` (Tailwind v4 + shadcn variable names).

```css
:root {
  /* Surfaces */
  --background: #F7F5F0;        /* warm paper */
  --card: #FFFFFF;
  --sunken: #EFECE5;            /* table headers, wells */
  --border: #E2DED5;
  --border-strong: #CFC9BD;

  /* Text */
  --foreground: #1B2321;
  --muted-foreground: #5B6663;  /* >= 5:1 on paper */
  --subtle: #8A938F;            /* decorative / disabled only, never body text */

  /* Brand = human action */
  --primary: #0F4C4A;
  --primary-hover: #0B3D3B;
  --primary-foreground: #FFFFFF;
  --primary-tint: #E3EFEE;

  /* AI signal */
  --ai: #4B4FA3;
  --ai-tint: #ECECF8;
  --ai-border: #C9CAEA;

  /* Attention (deadlines, mock, warnings) */
  --warn: #9A5B00;
  --warn-tint: #FBF0DA;
  --warn-border: #E8CF9B;

  /* Status */
  --success: #2F6B3F;
  --success-tint: #E4F1E7;
  --danger: #A63A2B;
  --danger-tint: #F8E6E2;

  --ring: #0F4C4A;

  /* Charts, max 4 series per chart */
  --chart-1: #0F4C4A;
  --chart-2: #4B4FA3;
  --chart-3: #B7791F;
  --chart-4: #7A9A8E;
  --chart-5: #B5654A;
  --chart-6: #6B7A89;

  --radius-sm: 6px;   /* buttons, inputs */
  --radius-md: 10px;  /* cards */
  --radius-full: 999px; /* chips */

  --shadow-sm: 0 1px 2px rgba(27,35,33,.06);
  --shadow-md: 0 4px 12px rgba(27,35,33,.08);
}
```

Color usage ratio per screen: ~85% neutrals, ~10% teal, ~3% indigo (only where AI output appears), ~2% ochre/red/green (status). If a screen has more color than that, remove some.

---

## 5. Typography

- Display / page titles: **Newsreader** (Latin) → fallback **Noto Serif Devanagari**
- UI and body: **Inter** → fallback **Noto Sans Devanagari**
- IDs, rule ids, application numbers, hashes: **JetBrains Mono**
- Load with `next/font/google`, `display: swap`, subsets `latin` + `devanagari`.

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| display | 32 / 40 | 500 (serif) | Page titles only |
| h2 | 22 / 30 | 600 | Section headers |
| h3 | 17 / 26 | 600 | Card titles |
| body | 15 / 24 | 400 | Default |
| body-lg | 17 / 28 | 400 | Applicant mobile forms |
| small | 13 / 20 | 400 | Meta, helper text |
| mono | 13 / 20 | 500 | IDs |

Rules:
- Hindi needs **line-height ≥ 1.6**. When `lang="hi"`, bump body to 16/26 and never use letter-spacing.
- Never use all caps or tracking for Hindi. Uppercase labels only for English micro-labels (`MOCK`, `AI`), 11px, weight 600, tracking 0.04em.
- Numbers in tables: `font-variant-numeric: tabular-nums`.
- Max line length 68 characters for paragraphs.

---

## 6. Spacing, layout, elevation

- 4px base grid. Common steps: 4, 8, 12, 16, 24, 32, 48.
- Cards: white, 1px `--border`, radius 10, padding 20 (desktop) / 16 (mobile), `--shadow-sm` at most. Prefer borders over shadows.
- Applicant PWA: max width 480px centered on desktop, 16px gutters on phone, sticky bottom action bar (safe-area aware).
- Officer cockpit: 3 panes, 320px queue | flexible document viewer | 400px details. Resizable not required.
- Admin: 12-column grid, max width 1280px.
- Dividers: 1px `--border`. No double borders, no heavy outlines.

---

## 7. Buttons

Base: height by size, radius 6, font 14/500 (15/500 on mobile), icon 16px (lucide, stroke 1.75), gap 8, no uppercase.

| Size | Height | Use |
|---|---|---|
| sm | 32px | Table rows, toolbars |
| md | 40px | Default desktop |
| lg | 48px | **All applicant mobile actions (min touch target 48px)** |

### Variants
| Variant | Style | Use |
|---|---|---|
| `primary` | Fill `--primary`, text white | The one main action per view; **Approve** |
| `secondary` | White fill, 1px `--border-strong`, text `--foreground` | Secondary actions |
| `ghost` | Transparent, text `--foreground`, hover `--sunken` | Toolbar, tertiary |
| `return` | White fill, 1px `--warn-border`, text `--warn`, hover `--warn-tint` | **Return for correction** |
| `reject` | White fill, 1px danger @ 40%, text `--danger`, hover `--danger-tint` | **Reject** (never a solid red fill) |
| `ai` | `--ai-tint` fill, 1px dashed `--ai-border`, text `--ai` | "Explain this flag", "Summarise file" — AI-triggered helpers only |
| `link` | Text `--primary`, underline on hover | Inline |

### States (all variants)
- **Hover:** background shifts ~6% (primary → `--primary-hover`). No movement, no shadow growth.
- **Active/pressed:** `transform: scale(0.98)`, 100ms.
- **Focus-visible:** 2px ring `--ring` with 2px offset, always visible, never removed.
- **Loading:** replace leading icon with 16px spinner, keep width fixed, label stays, `aria-busy`.
- **Disabled:** 45% opacity, `not-allowed`, no hover. If disabled because a rule blocks it (e.g. evidence not opened), show a tooltip explaining why.

### Decision bar (officer cockpit)
Sticky bottom of the details pane. Order: `Return` · `Reject` · `Approve` (primary on the right). Each shows a keyboard hint chip (`A`, `R`, `X`) in a `kbd` style (mono 11px, `--sunken`, 1px border). Reject and Return open a reason dialog (coded reason required). Approve on a high-risk file stays disabled until its evidence is opened; tooltip says why. After a decision, show an **Undo** toast for 8 seconds.

### Applicant action bar (mobile)
Sticky bottom: `lg` primary full width, optional `ghost` "Save draft" above/left. Include a **read-aloud** icon button (speaker icon, 48px, `secondary`) beside every question title.

---

## 8. Core components

Build these as shared components before screens.

1. **AIFlagChip** — dashed indigo chip: `AI · Name mismatch · 82%`. Click opens popover with rule id (mono), evidence thumbnail, one plain sentence. Confidence shown as text, not just color.
2. **EvidenceBox** — rectangle drawn over the document image: 2px `--ai` stroke, 8% indigo fill. Hover a field in the right pane → matching box pulses once (opacity 0.08→0.18→0.08, 400ms) and the document scrolls to it. Hover a box → field row highlights.
3. **MockBadge** — `MOCK` micro-label, ochre dashed border, warn-tint fill. Place on mocked responses, plus a one-time tooltip: "Simulated response with real response shape."
4. **HumanGateTag** — small teal solid-outline tag "Human decision" with officer initials + time once decided.
5. **StatusTimeline** (applicant) — vertical stepper: Submitted → Institute check → Ministry check → Selection → Payment. Completed = teal filled dot + connector, current = teal ring, future = grey outline. Under the current step show plain sentence + expected wait ("Usually 4–6 days"). Deadline countdown in ochre when a deficiency exists.
6. **DeficiencyCard** — white card, left 3px `--warn` border. Contents: what is wrong (h3), why (body), sample photo thumbnail, inline `Upload` button (lg on mobile), read-aloud button, countdown chip.
7. **PreflightChecklist** — list rows: icon (check = success, warning = warn, cross = danger) + check name + one-line fix. Warnings never disable Submit; they require an "I understand" checkbox.
8. **RiskMeter** — thin 4px horizontal bar with 3 stops (low/med/high) using success/warn/danger *tints* plus numeric score. Expandable to show components (name mismatch +20, certificate age +10, shared account +30).
9. **QueueRow** — 56px row: application ID (mono), institute, risk dot + score, age chip, deficiency type. Selected = `--primary-tint` background + 2px left teal border.
10. **StatCard** (dashboard headline) — label, big number (display serif 32), delta chip, definition tooltip icon (info), freshness stamp ("Updated 2 min ago") in small muted text, tiny sparkline optional.
11. **SimulatorDiff** (Rule Studio) — before/after horizontal bars with count labels; changed applicants listed below with `Fail → Pass` chips (success-tint).
12. **ReasonCodeSelect** — searchable list: code (mono) + plain sentence + badges "Fixable by student" / "Appealable".
13. **DemoToolbar** — top-right, only in demo mode: role switcher (Student / Officer / Committee / Admin) and `Reset demo` ghost button. Small, unobtrusive, makes the 5-minute demo smooth.
14. **LanguageToggle** — `हिन्दी | English` segmented control in the header of every screen.
15. **Empty / error states** — one line illustration-free message + one action. Never "Oops".

Inputs: height 44 (48 mobile), 1px `--border-strong`, radius 6, focus ring as buttons, label above (never placeholder-only), helper text below in small muted, error text in `--danger` with icon (not color alone).

Badges for status: pill, tinted background + same-hue text, 12px/500: Verified (success), Needs review (warn), Returned (warn), Rejected (danger), Draft (neutral), Selected (primary-tint).

---

## 9. Motion and effects

Philosophy: motion explains state change. If it does not help understanding, remove it.

| Token | Value |
|---|---|
| duration-fast | 120ms |
| duration-base | 180ms |
| duration-slow | 300ms (max, charts and timeline only) |
| easing | `cubic-bezier(0.2, 0, 0, 1)` |

### Allowed (and only these)
- **Page/route enter:** opacity 0→1 + translateY 4px→0, 180ms.
- **Lists:** stagger 30ms per item, max 6 items, then instant.
- **Hover:** color/border change only. Card hover: border `--border`→`--border-strong`, shadow-sm→md. No lift, no scale.
- **Press:** scale 0.98, 100ms.
- **Dialogs/popovers/sheets:** fade + 8px slide, 180ms. Mobile bottom sheet slides up.
- **Timeline:** connector fills 300ms when a step completes.
- **Count-up:** dashboard headline numbers animate once on first view, 600ms, easeOut, tabular-nums. Never loop.
- **Evidence box highlight:** single pulse, 400ms.
- **Progress / upload:** determinate bar, no indeterminate shimmer on important actions.
- **Skeletons:** static `--sunken` blocks with a very slow (1.6s) opacity pulse 0.6↔1. No gradient sweep.
- **Toasts:** slide in 180ms, auto-dismiss 5s, Undo variant 8s.
- **Success confirmation (submit, payment credited):** check icon draws with 300ms stroke animation, once.

### Forbidden
Parallax, scroll-jacking, tilt/3D cards, cursor glow or trails, particle or aurora backgrounds, animated gradients, glassmorphism/blur panels, text typewriter or scramble effects, marquee tickers, bouncing or spring overshoot, confetti, looping animations, auto-playing anything over 300ms except count-up.

### Reduced motion
Respect `prefers-reduced-motion`: disable all transforms and count-up (show final value); keep only opacity changes ≤120ms.

---

## 10. Screen specs

### 10.1 Applicant PWA (mobile first, 390px)
- Header: logo mark + `{{PRODUCT_NAME}}`, language toggle, help (`?`) icon.
- Form wizard: top "Step 3 of 6" with 6-segment progress bar (teal); auto-save indicator ("Saved just now").
- One question group per screen. Each question: label (body-lg), read-aloud button, helper text, input.
- Upload step: guided camera overlay (rounded-rect frame, corner marks), live quality hints ("Move closer", "Too dark") in a small dark chip; after capture show quality score and Retake/Use buttons.
- **Confirm what we read** screen: OCR fields as editable rows with AIFlagChip confidence; student taps "Correct" or "Edit".
- **Pre-flight check** screen: PreflightChecklist; bank seeding row shows MockBadge.
- Submit: declaration, mocked e-sign, receipt with big mono application ID (grouped `ABCD-1234-EF`), QR code, "Share on WhatsApp".
- Track: StatusTimeline + DeficiencyCards on top when present.
- Grievance button fixed in the overflow menu on every screen.

### 10.2 Public eligibility checker
One question per screen, 5 questions, big option buttons (lg, secondary, selected = `--primary-tint` + teal border). Result card: "You may qualify for" list with scheme name, why, documents to gather, and `Start application` primary.

### 10.3 Officer cockpit (desktop)
- Left: filters (institute, scheme, deficiency type) + QueueRow list, sorted by risk then age.
- Center: document viewer (zoom/pan), tabs for each document, EvidenceBoxes, page thumbnails strip.
- Right: tabs `Fields` · `Flags` · `Summary` (AI summary uses `ai` styling and a template fallback note). Fields shown as extracted value vs form value side by side with match status.
- Sticky decision bar (Section 7). Top bar shows SLA timer chip and keyboard shortcut help (`?`).
- Command palette (`⌘K`) for next file, jump to application, switch scheme.
- Audit sampling: files in the sample show a subtle `Audit sample` neutral chip; blind-review mode hides AI styling entirely (cleanest visual proof).
- Decision sheet: A4-style white panel summarising signals shown, decision, reason, officer, time; `Export PDF` secondary.

### 10.4 Rule Studio
- Left: rule list (id in mono, field, operator, value, severity badge hard/soft/advisory).
- Center: rule editor form with live JSON preview tab; maker-checker status banner (Draft → Awaiting approval → Live).
- Right: **What-if simulator** panel: slider for the value (e.g. income ceiling), SimulatorDiff updates on release (not on every drag tick), shows counts by State/category.
- Version diff view with added/removed lines in success-tint/danger-tint.
- Scheme switcher in header proves two schemes on one engine; badge shows `Config only` for the second scheme.

### 10.5 Committee view
Ranked table (tabular-nums), expandable row for score components, tie-break note chip, waitlist section below a clear divider. **Equity preview** strip above the table: 4 small horizontal bars (State, gender, Divyangjan, PVTG) with "Preview, not published" caption. Sign-off is a primary button that opens a confirmation dialog listing what will be published.

### 10.6 Admin dashboard
Row of 5 StatCards in fixed order: Speed · Transparency · Accuracy · Accountability · Accessibility (match the problem statement). Below: Operations (pendency by institute bar chart), Quality (deficiency reasons ranked list), Fraud radar, Equity and coverage gap (diverging bars by district), Finance (payment failures by reason code), Grievance. Every chart has a title phrased as a decision ("Which institutes need a nudge this week?"), a "View files" link, and the label **Simulated data** (ochre dashed chip) on the page header.
Charts: Recharts via shadcn charts, no gradients, no 3D, thin gridlines `--border`, direct labels where possible, max 4 series.

### 10.7 Notifications preview
Phone-frame mock showing WhatsApp-style bubble for the status message, with `MOCK` badge. Neutral grey frame, no brand-color chat imitation beyond a light green bubble tint `#E4F1E7`.

---

## 11. Accessibility and language (a stated goal, so show it)

- WCAG 2.1 AA target. Say "designed to align with GIGW 3.0" until tested.
- All interactive targets ≥ 44px (48px on applicant mobile).
- Focus ring on every interactive element; skip-to-content link.
- Status never by color alone: always icon + text.
- Text-size toggle (A−, A, A+) in applicant header; high-contrast toggle optional.
- No CAPTCHA. Dialogs trap focus and close on Esc.
- Use `lang="hi"` / `lang="en"` on the right elements; never hardcode strings, use message catalogues (next-intl).
- Every key notice has a read-aloud button (can use browser SpeechSynthesis for the demo).
- Test Hindi strings for clipping in buttons: buttons grow in width, never truncate, and wrap to two lines on mobile.
- Provide `aria-live="polite"` for status changes and toasts.

---

## 12. Libraries (install only these)

Core: `next`, `react`, `tailwindcss` (v4), **shadcn/ui** (Radix primitives), `lucide-react`.
Add: `motion` (animations), `sonner` (toasts), `cmdk` (command palette), `recharts` (via shadcn chart), `@tanstack/react-table` (+ `@tanstack/react-virtual` for the queue), `react-hook-form` + `zod`, `next-intl`, `react-zoom-pan-pinch` (document viewer), `qrcode.react` (receipt QR), `date-fns`.

Optional, max two pieces total from React Bits (copy-paste components): **CountUp** for StatCards, and nothing else unless this file asks for it. Do not add Aceternity / Magic UI effects.

---

## 13. "Looks vibe-coded" checklist (reject if any is true)

- Gradient hero, gradient text, or gradient buttons
- Glow shadows or colored shadows
- Every card has the same rounded-2xl + shadow + icon-in-circle pattern
- More than one accent color competing on a screen
- Emoji or sparkle icons used as decoration
- Lorem ipsum, "John Doe", or generic stock avatars (use the fictional demo characters; label them "Fictional")
- Placeholder charts with perfect smooth curves
- Hover effects that move elements
- Centered-everything layouts on desktop dashboards
- Inconsistent radius, spacing, or font sizes between screens

Use real content: real reason codes, real field names (name, DOB, IFSC, income, tribe, issuing authority), real error sentences from the plan.

---

## 14. Demo data to hardcode in the UI

Fictional characters (show a small "Fictional" label): a Gond PhD applicant from Madhya Pradesh, an Institute Nodal Officer, a Ministry officer. Application IDs in the format `NFS-26-ABCD-1234`. Show the three sourced problem numbers on the landing/pitch screen with source captions: 1,482 ghosts (CAG Jharkhand), 35–55% eligible ST students missed (CAG Tamil Nadu), 7,164 unpaid for seeding reasons (Arunachal). Verify each before it is shown.

---

## 15. Build order and acceptance

1. Tokens, fonts, shadcn theme, Button, Input, Badge, Card, Dialog, Toast.
2. AI/human components: AIFlagChip, EvidenceBox, MockBadge, HumanGateTag.
3. Applicant flow (form → upload → confirm read → preflight → submit → track).
4. Officer cockpit.
5. Rule Studio + simulator.
6. Committee + dashboard.
7. Polish: Hindi pass on every screen, keyboard pass, reduced-motion pass, DemoToolbar.

Done when: (a) a stranger can tell AI from human actions by styling alone, (b) every screen works in Hindi without clipping, (c) the 5-minute demo runs without a single animation drawing attention away from the content.
