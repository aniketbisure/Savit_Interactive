# AuditAI Pro — AI Website & Competitor Audit Tool

An enterprise-grade web application built for the **Savit Interactive Backend / Web Developer Take-Home Assignment**. It audits primary websites against 1–2 competitors, extracts empirical technical SEO and UX conversion signals, executes deterministic rules, and delivers strategic AI insights while maintaining strict separation between facts and AI interpretations.

---

## 🌟 Key Features

- **Empirical Website Extraction:** Fast, resilient extraction of titles, descriptions, H1/H2/H3 headings, image alt coverage, internal/external link ratios, Schema.org JSON-LD, OpenGraph tags, canonicals, robots meta, mobile viewports, and conversion CTAs.
- **SSRF & Security Shield:** Advanced URL validation with DNS resolution blocking RFC 1918 private IP ranges, loopback addresses (`127.0.0.1`), carrier-grade NAT, and cloud metadata endpoints (`169.254.169.254`).
- **Deterministic Factual Rules Engine:** Computes exact, reproducible health scores (0–100) for SEO and UX based on concrete evidence—ensuring audits remain objective and consistent.
- **Side-by-Side Competitor Benchmarking:** Directly compares primary domain metrics against competitors to highlight content gaps, metadata disparities, and conversion CTA differences.
- **AI Strategic Insights (Google Gemini / Fallback):** Synthesizes structured JSON reports categorizing issues by severity (`HIGH`, `MEDIUM`, `LOW`) with factual evidence and actionable recommendations. Operates with an intelligent deterministic fallback if an external API key is not supplied.
- **Audit History & Detail Archive:** Persistent audit storage using PostgreSQL (Prisma ORM) with fail-safe local caching, allowing users to review previous audits, track scores, and inspect raw JSON data payloads.

---

## 🛠️ Technology Stack & Choices

| Layer | Technology | Rationale |
|---|---|---|
| **Fullstack Framework** | **Next.js (App Router, Node.js runtime)** | Unified TypeScript codebase delivering high-performance server-rendered UI and robust API routes with zero context-switching. |
| **Language** | **TypeScript 5** | Strict compile-time type safety preventing runtime null/undefined errors across extraction, analysis, and API layers. |
| **Database & ORM** | **PostgreSQL + Prisma ORM** | Relational integrity for audit records, automatic schema migrations, and flexible JSONB storage for complex audit payloads. |
| **HTML Parser** | **Cheerio** | Fast, lightweight server-side DOM parsing with minimal memory footprint and sub-second response times. |
| **Security** | **ipaddr.js + Node.js DNS** | Enterprise-grade SSRF defense verifying resolved socket IPs before any connection is initiated. |
| **AI Integration** | **Google GenAI SDK (`@google/genai`)** | Structured JSON schema generation via Gemini 2.5 Flash with deterministic engine fallback. |
| **Styling** | **Tailwind CSS & Lucide Icons** | Polished, responsive executive dashboard with light/dark support and interactive score gauges. |

---

## 📁 Project Architecture

```
task/
├── prisma/
│   ├── schema.prisma              # PostgreSQL Prisma schema
│   └── migrations/0_init/         # SQL migration script
├── src/
│   ├── app/
│   │   ├── api/audits/            # GET (history), POST (run audit)
│   │   │   └── route.ts
│   │   ├── api/audits/[id]/       # GET (single audit), DELETE
│   │   │   └── route.ts
│   │   ├── audit/[id]/page.tsx    # Detailed Audit Report Dashboard
│   │   ├── history/page.tsx       # Past Audits Archive
│   │   ├── layout.tsx             # Root Layout with Navigation
│   │   ├── page.tsx               # Homepage & Audit Launcher Form
│   │   └── globals.css            # Tailwind styling
│   ├── components/
│   │   ├── AuditForm.tsx          # Submission form with progress indicator
│   │   ├── CompetitorTable.tsx    # Side-by-side comparison matrix
│   │   ├── FactualChecklist.tsx   # Deterministic SEO/UX passes & fails
│   │   ├── IssuesList.tsx         # Prioritized issues with severity & evidence
│   │   ├── Navbar.tsx             # Global application header
│   │   ├── RawDataViewer.tsx      # JSON inspector for technical review
│   │   └── ScoreGauge.tsx         # Circular colored score indicators
│   └── lib/
│       ├── ai/synthesizer.ts      # LLM prompt engineering & fallback engine
│       ├── analyzer/
│       │   ├── comparator.ts      # Competitor deltas & gap identification
│       │   └── rules.ts           # Deterministic SEO & UX rules engine
│       ├── scraper/
│       │   └── extractor.ts       # Resilient fetcher & Cheerio parser
│       ├── security/
│       │   └── ssrf.ts            # DNS lookup & IP range security guard
│       ├── services/
│       │   └── audit-service.ts   # Prisma DB repository & memory fallback
│       ├── types/audit.ts         # TypeScript shared domain models
│       └── validations/audit.ts   # Zod input validation schemas
├── .env.example                   # Environment configuration template
├── LICENSE                        # Confidential Evaluation License
├── NOTES.md                       # Limitations & future improvements roadmap
├── package.json
├── README.md
└── tsconfig.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **PostgreSQL**: Local instance, Docker container, or cloud database (Neon, Supabase)
- **npm** or **pnpm**

### Step-by-Step Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd task
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Configure your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/website_audits?schema=public"
   GEMINI_API_KEY="" # Optional: Free key from https://aistudio.google.com/
   ```
   *(Note: The application includes a built-in memory storage fallback, allowing full functionality even if PostgreSQL is not yet started during evaluation).*

4. **Run Database Migrations (PostgreSQL):**
   ```bash
   npx prisma migrate dev --name init
   # Or directly execute prisma/migrations/0_init/migration.sql in your DB client
   ```

5. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

6. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

7. **Production Build:**
   ```bash
   npm run build
   npm start
   ```

---

## 🔍 Website Extraction Logic

Website data extraction is handled by `src/lib/scraper/extractor.ts`:
- **Timeout Management:** Enforces a strict 10-second `AbortController` timeout on all network requests.
- **Payload Size Capping:** Inspects `Content-Length` and limits response sizes to 5MB to protect against memory exhaustion attacks.
- **Redirect Validation:** Manually follows HTTP 301, 302, 307, 308 redirects (up to 5 hops), re-verifying every target hostname against the SSRF guard before following.
- **DOM Parsing via Cheerio:**
  - Extracts `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta name="robots">`, and `<meta name="viewport">`.
  - Parses OpenGraph tags (`og:title`, `og:image`, `og:description`, `og:type`) and Schema.org JSON-LD scripts (`application/ld+json`).
  - Scans heading tags (`h1`, `h2`, `h3`) and extracts text hierarchy.
  - Computes visible body word count by stripping `<script>`, `<style>`, `<svg>`, `<nav>`, and `<footer>` elements.
  - Inspects all `<img>` tags for missing or whitespace-only `alt` attributes.
  - Classifies internal vs. external links based on parsed hostname matching.
  - Detects conversion signals: `tel:` click-to-call links, `mailto:` addresses, `<form>` counts, and button CTA keywords (`get started`, `sign up`, `contact`, `book`, `demo`, `pricing`).

---

## 📊 SEO & Website/UX Logic

The application implements a **strictly deterministic rules engine** (`src/lib/analyzer/rules.ts`):

### SEO Rules
- **Page Title Tag:** Validates presence and optimal snippet length (30–60 characters).
- **Meta Description:** Validates presence and optimal snippet length (50–160 characters).
- **H1 Heading:** Enforces exactly one primary `<h1>` heading per page (flags 0 H1s as High Severity; flags multiple H1s as Medium Severity).
- **Heading Hierarchy:** Checks for `<h2>` and `<h3>` presence when word count exceeds 300 words.
- **Image Alt Coverage:** Calculates the percentage of unannotated images; triggers High/Medium alerts if unannotated images exceed threshold.
- **Canonical & Indexation:** Ensures self-referential canonical tags exist and verifies no accidental `noindex` robots meta tags block public search engines.
- **SSL / HTTPS:** Flags unencrypted HTTP connections as High Severity.
- **Content Volume:** Detects thin content (< 250 words) on main landing pages.

### Website / UX Rules (Measurable Signals Only)
- **Mobile Viewport:** Confirms presence of responsive `width=device-width` viewport meta tag.
- **Call-to-Action (CTA):** Checks for primary conversion action triggers in buttons, links, or form submit controls.
- **Contact Pathways:** Detects direct contact channels (clickable phone, email address, interactive forms).
- **Semantic Structure:** Verifies presence of `<nav>` elements and document language declarations (`<html lang="...">`).
- *Strict Rule: No speculative or unsupported visual claims are made.*

---

## ⚔️ Competitor Comparison Logic

The competitor analysis module (`src/lib/analyzer/comparator.ts`) benchmarks the primary website against up to 2 competitors using actual extracted facts:
- **Metrics Evaluated:** Content Word Count, Meta Description Health, Schema.org adoption, Image Alt Coverage, CTA buttons presence, Direct Contact Accessibility, and Server Response Time (TTFB).
- **Status Classification:** Each metric is categorized as `LEAD` (outperforming competitors), `LAG` (competitive gap), or `NEUTRAL` (comparable).
- **Gap Identification:** Automatically synthesizes distinct lists of:
  - **SEO Gaps:** e.g., missing schema markup or metadata when competitors have them.
  - **Content Gaps:** e.g., thin content volume vs. competitor topic coverage.
  - **Conversion Gaps:** e.g., lack of click-to-call or immediate conversion buttons.

---

## 🤖 AI Integration & Fact/Insight Separation

The AI synthesis engine (`src/lib/ai/synthesizer.ts`) leverages Google Gemini 2.5 Flash:
- **Strict Grounding:** The prompt feeds strictly extracted facts, deterministic rule findings, and competitor benchmark tables into the model. The model is explicitly instructed never to invent competitor information or hallucinate statistics.
- **Structured JSON Output:** Responses are guaranteed to conform to a strict JSON schema containing:
  - `overallScore`, `seoScore`, `uxScore`
  - `clientSummary` and `competitorSummary`
  - `strengths` and `weaknesses`
  - `prioritizedIssues` with explicit fields: `title`, `severity` (High/Med/Low), `fact` (empirical evidence), `impact`, and `recommendation`
  - `actionPlan` divided into Quick Wins (Days 1–7), Medium Term (Weeks 2–4), and Long Term strategy.
- **Deterministic Fallback Engine:** If an external API key is omitted, rate-limited, or unavailable, the application seamlessly activates an internal deterministic synthesizer that constructs the same structured report from empirical data, ensuring the app never fails.

---

## 🛡️ Security & Error Handling

- **SSRF Prevention:** Implemented in `src/lib/security/ssrf.ts`. Rejects:
  - `127.0.0.0/8`, `::1` (Loopbacks)
  - `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (Private RFC 1918)
  - `169.254.0.0/16` (Cloud instance metadata services like AWS EC2/GCP)
  - `100.64.0.0/10` (Carrier-grade NAT)
  - Internal hostnames like `localhost`, `*.local`, `*.internal`
- **Request Resiliency:** Every fetch is protected by a 10s timeout, content-length limits, and manual redirect checks.
- **Audit Status Lifecycle:** Failed audits are explicitly marked with `status: "FAILED"` along with clear, user-facing error messages; failed audits are never falsely marked as successful.
- **Secret Protection:** API keys and database credentials are fully externalized via `.env.example`; no credentials are hardcoded or tracked in Git.

---

## 📝 Limitations

Please refer to [`NOTES.md`](./NOTES.md) for an in-depth review of current architectural limitations (such as client-rendered Single Page Apps and deep domain crawling) and the production roadmap (BullMQ worker queues, Playwright rendering pools, Core Web Vitals, and PDF exports).
