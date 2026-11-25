# Architectural Notes: Limitations & Future Improvements

**Project:** AI Website & Competitor Audit Platform  
**Target Organization:** Savit Interactive (Take-Home Assignment)  
**Author:** Backend / Web Developer Candidate  

---

## 1. Current Architecture & Design Decisions

The application was designed adhering strictly to the assignment's mandate:
- **Clean Separation of Concerns:** Pure factual extraction is decoupled from AI interpretation. The AI receives empirical metrics and structured findings; it never hallucinates competitor statistics.
- **SSRF Defense-in-Depth:** Target hostnames are resolved via DNS and checked against RFC 1918 private subnets, loopbacks, link-local addresses, and AWS/GCP metadata endpoints (`169.254.169.254`) before any HTTP socket connection is opened.
- **Deterministic Baseline Scoring:** Audit scores (0–100) are computed through a deterministic rules engine before LLM invocation, ensuring reproducible benchmarks regardless of LLM temperature.
- **Fail-Safe Persistence:** PostgreSQL via Prisma ORM handles structured history and JSON payloads, backed by a memory cache fallback if the database connection is unconfigured during quick reviewer evaluation.

---

## 2. Technical Limitations of the Current Prototype

### 2.1 Client-Side Rendered (CSR) JavaScript Applications
- **Current Behavior:** The extraction engine uses Node.js HTTP streaming with `cheerio` to parse static HTML payloads.
- **Limitation:** Websites rendered exclusively via client-side JavaScript (e.g., heavy CSR React, Angular, or Vue SPAs that mount an empty `<div id="root"></div>`) will yield minimal raw HTML content unless pre-rendered via Server-Side Rendering (SSR) or Static Site Generation (SSG).
- **Trade-off:** `cheerio` was selected for speed (sub-second response times, negligible memory footprint, zero headless browser vulnerability vectors) over running a heavyweight headless Chromium instance.

### 2.2 Deep Domain Crawling vs. Focused URL Benchmarking
- **Current Behavior:** Audits are executed on specific target landing pages (the primary domain and 1–2 competitor target URLs).
- **Limitation:** The current scope does not crawl 10,000 sub-pages or map full XML sitemaps across an entire enterprise domain.
- **Trade-off:** Fits the expected 8–10 hour assignment timeline and prevents server socket exhaustion.

### 2.3 Cloudflare, Akamai & Advanced Anti-Bot Protections
- **Current Behavior:** Outgoing requests use standard browser headers (`User-Agent`, `Accept-Language`, `Accept: text/html`).
- **Limitation:** Sites behind aggressive Cloudflare Under Attack mode or CAPTCHA challenges will return `403 Forbidden` or challenge pages.
- **Resolution:** As per ethical web scraping and assignment guidelines, bot bypasses or CAPTCHA circumventions are avoided.

---

## 3. Production Roadmap & Future Improvements

If scaling this prototype into a full commercial enterprise product, the following enhancements are planned:

### 3.1 Distributed Asynchronous Worker Queue (BullMQ + Redis)
- Migrate synchronous API audit executions to an asynchronous job queue using **BullMQ** or **Celery** backed by **Redis**.
- Clients receive an immediate `auditId` and subscribe to real-time execution stages using **Server-Sent Events (SSE)** or **WebSockets**.
- Enables horizontal worker scaling across multiple Node.js instances with automatic retries and rate-limiting per domain.

### 3.2 Hybrid Dual-Engine Fetcher (Cheerio + Playwright Pool)
- Implement a two-tiered scraping pipeline:
  1. **Tier 1 (Fast path):** Cheerio fetches and parses static HTML in ~200ms.
  2. **Tier 2 (Fallback):** If word count < 100 or `<div id="root">` is empty, dispatch the job to a containerized **Playwright** / **Puppeteer** pool with Chromium to execute client-side JavaScript, capture Core Web Vitals (LCP, CLS, FID), and generate responsive device screenshots.

### 3.3 Google Lighthouse & Core Web Vitals Integration
- Integrate Google PageSpeed Insights API or localized Lighthouse runner to measure real-world performance metrics (First Contentful Paint, Time to Interactive, Cumulative Layout Shift, Total Blocking Time).

### 3.4 Automated Scheduled Audits & Regression Monitoring
- Introduce recurring cron audits (e.g., weekly or monthly) allowing clients to track competitor changes over time.
- Generate visual diff alerts when a competitor updates their H1 value proposition, meta description, or CTA pricing.

### 3.5 Automated Client-Ready PDF Report Export
- Implement `@react-pdf/renderer` or server-side headless PDF generation to allow marketing agencies to download branded white-label PDF audit reports ready for direct presentation to C-level clients.

### 3.6 Multi-Model AI Routing & Cost Optimization
- Implement an AI gateway that routes simple summarization tasks to lightweight local models (e.g., Ollama / Llama 3) and reserves high-tier models for complex competitive strategy synthesis.
