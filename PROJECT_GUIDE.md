# AuditAI Pro — Complete Project Guide (For Both Non-IT & IT Teams)

This guide explains **what AuditAI Pro does**, **how the AI works**, **how it plans to resolve website problems**, and **how the system is built under the hood**.

- **Section 1** is written in plain language for **Non-IT teams** (management, marketing, sales, clients).
- **Section 2** is written for **IT teams** (developers, architects, QA, security).

---

## Section 1: Non-IT Explanation (Simple Words)

### 1. What Problem Does This Project Solve?
Businesses often don't know **why their website isn't ranking well on Google** or **why visitors leave without contacting them**. Checking a website manually takes hours of guesswork, and comparing it against competitors is even harder.

**AuditAI Pro** solves this in under a minute:
1. You enter **your website URL** (required).
2. You optionally add **up to 2 competitor URLs** to compare against.
3. You optionally add **Business Context** (your *Industry*, *Target Audience*, *Core Offering*, and *Audit Objective*) so the advice fits your exact business.
4. You click **Launch Diagnostic Audit**, and the system produces a complete, evidence-backed report with scores, competitor comparisons, and a step-by-step fix plan.

---

### 2. Think of It Like a "Medical Checkup + Specialist Doctor"
To keep results honest and accurate, the platform separates **Facts** from **AI Advice**:

1. **Safety Check (Security Guard):** Confirms the website is a real, safe public site before visiting it.
2. **Lab Test (Website Scanner):** Reads the website's code like a search engine does—checking page titles, descriptions, headings, images, contact details, buttons, speed, and mobile readiness.
3. **Rulebook Scorecard (No Guessing):** Runs a fixed checklist of rules to calculate an objective **SEO Score (0–100)** and **UX Score (0–100)**. Running the same page twice gives the exact same factual findings.
4. **Competitor Benchmark (Side-by-Side Comparison):** Places your website next to your competitors and labels where you **LEAD**, **LAG**, or tie (**NEUTRAL**).
5. **AI Strategist (Plain-English Consultant):** Reads all the lab facts + your business context and writes an executive summary, explains the business impact of each issue, and organizes fixes into a clear action plan.

---

### 3. What Does the AI Actually Do (and What Does It NOT Do)?

| What the AI **DOES** | What the AI **DOES NOT DO** |
|---|---|
| Reads the verified technical facts collected by the scanner. | Does **not** browse the internet freely or make up stats. |
| Uses your **Business Context** (industry, audience, offering, goal) to tailor recommendations. | Does **not** invent competitor numbers or fake issues. |
| Translates technical findings into clear business impact (why it matters for traffic & conversions). | Does **not** override the deterministic checks—facts stay verifiable. |
| Prioritizes issues by severity (**HIGH**, **MEDIUM**, **LOW**) with evidence + fix steps. | Does **not** break the app if the AI service is offline—a built-in backup engine still generates the full report. |

---

### 4. What Is the Plan to Resolve Website Problems?
Every audit produces a structured **Action Plan** split into three practical phases:

1. **Quick Wins (Immediate Fixes — Days 1–7)**
   - Fast, high-impact fixes you can ship right away: adding missing meta descriptions, fixing short/long page titles, and adding missing `alt` text to images.
2. **Medium-Term (Structural Improvements — Weeks 2–4)**
   - Strengthening site structure: adding Schema.org (JSON-LD) rich markup so Google understands your organization/products, fixing heading hierarchy (`H1 → H2 → H3`), and ensuring clear contact & CTA buttons.
3. **Long-Term (Competitive Growth Strategy)**
   - Outperforming competitors sustainably: building deeper, higher-value content where competitors currently have more coverage, and optimizing conversion paths above the fold.

### 5. What Teams Get After Each Audit
- **Executive Summary & Dual Scores:** SEO Score and UX Score side-by-side.
- **Competitor Matrix:** Direct comparison across content depth, metadata, schema, image accessibility, CTAs, contact channels, and server speed.
- **Prioritized Issues List:** Every issue lists the **Fact (Evidence)**, **Business Impact**, and **Recommended Fix**.
- **One-Click Sharing:** **Export Client PDF** (print-ready report) and **Copy Slack Brief** (instant team summary), plus a saved **Audit History** archive.

---

## Section 2: IT Team Explanation & System Architecture

### 1. Tech Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router, Node.js runtime) | Full-stack React UI + API routes in one TypeScript codebase |
| **Language** | TypeScript 5 | End-to-end strict typing across scraping, analysis, and APIs |
| **Validation** | Zod 4 | Schema validation for URLs, UUIDs, and business context limits |
| **HTML Extraction** | Native `fetch` + Cheerio | Fast, lightweight server-side HTML fetching and DOM parsing |
| **Security** | Node `dns/promises` + `ipaddr.js` | SSRF prevention (DNS resolution + private/metadata IP blocking) |
| **AI Synthesis** | Google GenAI SDK (`@google/genai`) | Structured JSON report generation via Gemini + deterministic fallback |
| **Database** | PostgreSQL + Prisma ORM 6 | Persistent audit storage (`Audit` model) with automatic in-memory fallback |
| **UI & Styling** | Tailwind CSS 4, GSAP, Lenis, Lucide | Responsive dashboard, score gauges, animations, print-to-PDF support |

---

### 2. End-to-End Architecture & Data Flow

```text
+-------------------------------------------------------------------------+
| 1. FRONTEND (Browser / React Client Components)                         |
|    - AuditForm.tsx + MagneticButton.tsx                                 |
|    - Collects primaryUrl, up to 2 competitors, & business context       |
|    - Sends POST /api/audits                                             |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| 2. API & VALIDATION LAYER (src/app/api/audits/route.ts)                 |
|    - CreateAuditSchema (Zod): validates HTTP/HTTPS URLs & field lengths |
|    - Initializes DB record with status = "PROCESSING"                   |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| 3. SECURITY & EXTRACTION LAYER                                          |
|    - ssrf.ts: blocks localhost, private RFC1918, link-local, metadata   |
|    - extractor.ts: 10s timeout, 5MB cap, <=5 manual redirects, Cheerio  |
|    - Runs on primaryUrl first (422 on failure), then competitors safely |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| 4. DETERMINISTIC ANALYSIS ENGINE (Pure Facts, Zero AI)                  |
|    - rules.ts: SEO & UX checks, weighted scoring -> 60% SEO + 40% UX    |
|    - comparator.ts: primary vs competitors -> LEAD / LAG / NEUTRAL      |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| 5. AI SYNTHESIS & PROMPT-INJECTION SHIELD (src/lib/ai/synthesizer.ts)   |
|    - Sanitizes scraped strings & wraps inside <untrusted_web_evidence>  |
|    - Calls Gemini (gemini-3.5-flash -> 3.8-flash -> 2.5-flash-lite)     |
|    - If API fails/unavailable -> generateDeterministicFallback()        |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
| 6. PERSISTENCE & REPORT VIEW                                            |
|    - audit-service.ts + db.ts: saves COMPLETED audit to PostgreSQL      |
|      (auto-falls back to in-memory Map if DB is unreachable)            |
|    - Client redirects to /audit/[id] for interactive report & PDF/Slack |
+-------------------------------------------------------------------------+
```

---

### 3. Module-by-Module Technical Breakdown

1. **Frontend & Pages**
   - [src/app/page.tsx](./src/app/page.tsx): Landing page, hero metrics, recent audits preview, and form container.
   - [src/components/AuditForm.tsx](./src/components/AuditForm.tsx) & [src/components/MagneticButton.tsx](./src/components/MagneticButton.tsx): Submits `POST /api/audits`, animates diagnostic stages, and surfaces field-level validation or crawl errors.
   - [src/app/audit/[id]/page.tsx](./src/app/audit/[id]/page.tsx): Renders dual [ScoreGauge](./src/components/ScoreGauge.tsx) rings, Strategist Perspective, [CompetitorTable](./src/components/CompetitorTable.tsx), [IssuesList](./src/components/IssuesList.tsx), [FactualChecklist](./src/components/FactualChecklist.tsx), [RawDataViewer](./src/components/RawDataViewer.tsx), Slack brief copy, and browser print-to-PDF export.
   - [src/app/history/page.tsx](./src/app/history/page.tsx): Lists past audits and supports deletion.

2. **API Routes & Validation**
   - [src/app/api/audits/route.ts](./src/app/api/audits/route.ts): `GET` lists up to 50 recent audits; `POST` orchestrates the entire audit pipeline and marks failed runs as `status: "FAILED"` with `errorMessage`.
   - [src/app/api/audits/[id]/route.ts](./src/app/api/audits/[id]/route.ts): `GET` fetches a single audit by UUID; `DELETE` removes it.
   - [src/lib/validations/audit.ts](./src/lib/validations/audit.ts): Enforces valid `http:`/`https:` URLs (blocking embedded credentials), UUID format checks, and character limits (`industry` ≤ 300, `targetAudience` ≤ 500, `serviceProduct` ≤ 500, `auditObjective` ≤ 1000).

3. **SSRF Security Guard ([src/lib/security/ssrf.ts](./src/lib/security/ssrf.ts))**
   - Restricts schemes to `http:` / `https:` and ports to `80, 443, 8080, 8443, 3000`.
   - Rejects `localhost`, `*.local`, `*.internal`, `*.lan`, `*.home.arpa`.
   - Resolves DNS via `dns.lookup(..., { all: true })` and validates every IP with `ipaddr.js`, blocking `loopback`, `private` (RFC 1918), `linkLocal` (`169.254.169.254` cloud metadata), `uniqueLocal`, `carrierGradeNat`, `broadcast`, `reserved`, and `unspecified`.
   - Redirects are followed manually in [src/lib/scraper/extractor.ts](./src/lib/scraper/extractor.ts) (up to 5 hops) so **every redirect target is re-validated** against SSRF before fetching.

4. **HTML Extractor ([src/lib/scraper/extractor.ts](./src/lib/scraper/extractor.ts))**
   - Enforces a 10-second `AbortController` timeout, HTML/text MIME-type validation, and a 5 MB streaming byte limit to prevent memory exhaustion.
   - Extracts metadata, OpenGraph, JSON-LD `Schema.org` types, headings (`h1`/`h2`/`h3`), visible body word count, internal vs. external link counts, missing image `alt` counts, `tel:`/`mailto:`/`<form>` contact channels, `<nav>`/`<footer>` presence, and CTA button keywords.

5. **Deterministic Rules & Competitor Comparator**
   - [src/lib/analyzer/rules.ts](./src/lib/analyzer/rules.ts): Evaluates SEO and UX checks with severity weights (`HIGH = 3`, `MEDIUM = 2`, `LOW = 1`). Computes `overallScore = Math.round(seoScore * 0.6 + uxScore * 0.4)`.
   - [src/lib/analyzer/comparator.ts](./src/lib/analyzer/comparator.ts): Compares primary metrics against competitor averages (word count ±20% band, meta description, Schema.org, image alt %, CTAs, contact access, server response time) and produces `seoGaps`, `contentGaps`, and `ctaConversionGaps`.

6. **AI Synthesizer ([src/lib/ai/synthesizer.ts](./src/lib/ai/synthesizer.ts))**
   - **Prompt Injection Mitigation (OWASP LLM01):** Strips HTML tags, newlines, and quote characters via `sanitizeUntrustedText`, and isolates scraped web content inside `<untrusted_web_evidence>` XML tags with an explicit system directive to treat it strictly as passive data.
   - **Resiliency:** Tries `gemini-3.5-flash` → `gemini-3.8-flash` → `gemini-2.5-flash-lite` with `responseMimeType: 'application/json'` and `temperature: 0.2`. Validates JSON structure before accepting; on any error or missing API key, falls back seamlessly to `generateDeterministicFallback`.

7. **Database & Fail-Safe Persistence**
   - [prisma/schema.prisma](./prisma/schema.prisma): Stores `Audit` records in PostgreSQL (Supabase transaction pooler for runtime `DATABASE_URL`, direct URL for migrations `DIRECT_URL`) with JSON columns for `extractedData`, `seoFindings`, `uxFindings`, `competitorData`, and `aiReport`.
   - [src/lib/db.ts](./src/lib/db.ts) & [src/lib/services/audit-service.ts](./src/lib/services/audit-service.ts): Runs a 1.5s TCP socket reachability check (cached for 30s) before hitting Prisma; if PostgreSQL is offline, reads/writes gracefully fall back to an in-memory `Map` so the app remains operational.

---

### 4. Known Scope Boundaries & Future Roadmap
As documented in [NOTES.md](./NOTES.md):
- **Static HTML Scraping (Cheerio):** Fast and lightweight, but heavy client-side-rendered SPAs (empty `<div id="root">`) return minimal HTML unless upgraded to a Tier-2 Playwright/headless browser pool.
- **Single-Page Focus:** Audits target landing pages (primary + up to 2 competitors) synchronously rather than crawling entire multi-thousand-page sitemaps.
- **Future Production Scaling:** Move long-running audits to an async worker queue (e.g., BullMQ + Redis) with SSE/WebSocket progress updates and Google Lighthouse / Core Web Vitals integration.
