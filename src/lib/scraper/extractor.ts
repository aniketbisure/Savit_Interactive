import * as cheerio from 'cheerio';
import { validateUrlForSSRF } from '../security/ssrf';
import { ExtractedWebsiteData } from '../types/audit';

const CTA_KEYWORDS = [
  'get started',
  'sign up',
  'contact',
  'book',
  'demo',
  'buy',
  'pricing',
  'free trial',
  'request',
  'schedule',
  'call us',
  'subscribe',
  'consult',
  'order now',
  'quote',
  'start now',
];

const MAX_REDIRECTS = 5;
const TIMEOUT_MS = 10000;
const MAX_CONTENT_LENGTH = 5 * 1024 * 1024; // 5MB

/**
 * Resilient HTTP fetcher with SSRF prevention and redirect checks.
 */
async function safeFetchHtml(initialUrl: string): Promise<{ html: string; finalUrl: string; responseTimeMs: number; status: number }> {
  let currentUrl = initialUrl;
  let redirectsCount = 0;
  const startTime = Date.now();

  while (redirectsCount < MAX_REDIRECTS) {
    // 1. SSRF check on target host
    // Note: validateUrlForSSRF may throw (not return) for transient DNS errors (EAI_AGAIN, ETIMEDOUT)
    // so that competitor audits can soft-fail instead of being misreported as SSRF blocks.
    const ssrfCheck = await validateUrlForSSRF(currentUrl);
    if (!ssrfCheck.isSafe) {
      throw new Error(`SSRF Protection: ${ssrfCheck.reason} (blocked URL: ${currentUrl})`);
    }
    currentUrl = ssrfCheck.normalizedUrl || currentUrl;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual', // Manually handle redirects to validate each destination against SSRF
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
      });
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(`Connection timed out after ${TIMEOUT_MS / 1000}s while requesting ${currentUrl}`);
      }
      throw new Error(`Connection failure for ${currentUrl}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      clearTimeout(timeout);
    }

    // Handle redirects manually
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get('location');
      if (!location) {
        throw new Error(`Redirect status ${res.status} received without Location header.`);
      }
      redirectsCount++;
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status} ${res.statusText} for URL ${currentUrl}`);
    }

    // MIME-Type check: Ensure target is textual/HTML (block binaries, executables, multimedia streams)
    const contentType = res.headers.get('content-type')?.toLowerCase() || '';
    const isHtmlOrText =
      contentType.includes('text/html') ||
      contentType.includes('application/xhtml+xml') ||
      contentType.includes('text/plain') ||
      contentType === ''; // Some legacy servers omit content-type

    if (!isHtmlOrText && contentType) {
      throw new Error(`Unsupported content type "${contentType}". Target must be an HTML document.`);
    }

    const contentLength = res.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_CONTENT_LENGTH) {
      throw new Error(`Target page payload exceeds maximum allowed size (5MB).`);
    }

    // Stream-safe read: Read chunks with byte counter to prevent memory exhaustion / zip bombs
    if (!res.body) {
      const html = await res.text();
      return { html, finalUrl: currentUrl, responseTimeMs: Date.now() - startTime, status: res.status };
    }

    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        receivedBytes += value.length;
        if (receivedBytes > MAX_CONTENT_LENGTH) {
          reader.cancel();
          throw new Error(`Target page exceeded maximum allowed size (5MB) during transfer.`);
        }
        chunks.push(value);
      }
    }

    const decoder = new TextDecoder('utf-8');
    let html = '';
    for (const chunk of chunks) {
      html += decoder.decode(chunk, { stream: true });
    }
    html += decoder.decode();

    const responseTimeMs = Date.now() - startTime;

    return {
      html,
      finalUrl: currentUrl,
      responseTimeMs,
      status: res.status,
    };
  }

  throw new Error(`Too many redirects (exceeded limit of ${MAX_REDIRECTS}).`);
}

/**
 * Extracts comprehensive SEO, UX, content, and conversion data from a website.
 */
export async function extractWebsiteData(targetUrl: string): Promise<ExtractedWebsiteData> {
  const { html, finalUrl, responseTimeMs, status } = await safeFetchHtml(targetUrl);
  const $ = cheerio.load(html);

  // Protocol check
  const isHttps = finalUrl.startsWith('https://');

  // Metadata
  const title = $('title').first().text().trim() || null;
  const metaDescription =
    $('meta[name="description" i]').attr('content')?.trim() ||
    $('meta[property="og:description" i]').attr('content')?.trim() ||
    null;
  const canonicalUrl = $('link[rel="canonical" i]').attr('href')?.trim() || null;
  const robotsMeta = $('meta[name="robots" i]').attr('content')?.trim() || null;
  const viewportMeta = $('meta[name="viewport" i]').attr('content')?.trim() || null;
  const htmlLang = $('html').attr('lang')?.trim() || null;

  // Open Graph
  const openGraph = {
    title: $('meta[property="og:title" i]').attr('content')?.trim() || null,
    description: $('meta[property="og:description" i]').attr('content')?.trim() || null,
    image: $('meta[property="og:image" i]').attr('content')?.trim() || null,
    type: $('meta[property="og:type" i]').attr('content')?.trim() || null,
  };

  // Schema.org (JSON-LD)
  const schemaTypes: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).text());
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (item && item['@type']) schemaTypes.push(String(item['@type']));
        });
      } else if (parsed && parsed['@type']) {
        schemaTypes.push(String(parsed['@type']));
      }
    } catch {
      // Ignore malformed JSON-LD scripts
    }
  });

  // Headings
  const h1: string[] = [];
  $('h1').each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (text) h1.push(text);
  });

  const h2Samples: string[] = [];
  $('h2').each((i, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (text && i < 10) h2Samples.push(text);
  });

  const h3Samples: string[] = [];
  $('h3').each((i, el) => {
    const text = $(el).text().trim().replace(/\s+/g, ' ');
    if (text && i < 10) h3Samples.push(text);
  });

  const h2Count = $('h2').length;
  const h3Count = $('h3').length;

  // Content / Word Count
  // Clone to safely remove non-visible elements without altering DOM queries
  const $content = cheerio.load(html);
  $content('script, style, noscript, svg, iframe, nav, footer, header').remove();
  const visibleText = $content('body').text().replace(/\s+/g, ' ').trim();
  const words = visibleText.length > 0 ? visibleText.split(/\s+/).filter((w) => w.length > 0) : [];
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  // Links
  let internalLinks = 0;
  let externalLinks = 0;
  let finalHost = '';
  try {
    finalHost = new URL(finalUrl).hostname;
  } catch {
    finalHost = '';
  }

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim();
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

    try {
      const linkUrl = new URL(href, finalUrl);
      if (linkUrl.hostname === finalHost) {
        internalLinks++;
      } else {
        externalLinks++;
      }
    } catch {
      // Relative or internal anchor
      internalLinks++;
    }
  });

  const totalLinks = internalLinks + externalLinks;

  // Images & Alt attributes
  const totalImages = $('img').length;
  let missingAltCount = 0;
  const sampleImagesWithoutAlt: string[] = [];

  $('img').each((_, el) => {
    const alt = $(el).attr('alt');
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    if (alt === undefined || alt === null || alt.trim() === '') {
      missingAltCount++;
      if (sampleImagesWithoutAlt.length < 5 && src) {
        sampleImagesWithoutAlt.push(src.slice(0, 100));
      }
    }
  });

  const missingAltPercentage =
    totalImages > 0 ? Math.round((missingAltCount / totalImages) * 100) : 0;

  // Conversion & UX Signals
  let hasPhoneContact = false;
  let hasEmailContact = false;

  $('a[href^="tel:" i]').each(() => {
    hasPhoneContact = true;
  });
  $('a[href^="mailto:" i]').each(() => {
    hasEmailContact = true;
  });

  // Also check plain text for standard email / phone patterns if no href found
  if (!hasEmailContact && /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(visibleText)) {
    hasEmailContact = true;
  }
  if (!hasPhoneContact && /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/.test(visibleText)) {
    hasPhoneContact = true;
  }

  const formsCount = $('form').length;
  const hasNavTag = $('nav').length > 0;
  const hasFooterTag = $('footer').length > 0;
  const hasViewport = !!viewportMeta && viewportMeta.includes('width=device-width');

  // CTA button/link detection
  const ctaKeywordsFound = new Set<string>();
  $('button, a, input[type="submit"], input[type="button"]').each((_, el) => {
    const text = ($(el).text() || $(el).attr('value') || '').toLowerCase().trim();
    for (const kw of CTA_KEYWORDS) {
      if (text.includes(kw)) {
        ctaKeywordsFound.add(kw);
      }
    }
  });

  const hasCtaButton = ctaKeywordsFound.size > 0;

  return {
    url: targetUrl,
    finalUrl,
    isHttps,
    httpStatus: status,
    responseTimeMs,
    htmlSizeBytes: Buffer.byteLength(html, 'utf8'),

    title,
    titleLength: title ? title.length : 0,
    metaDescription,
    metaDescriptionLength: metaDescription ? metaDescription.length : 0,
    canonicalUrl,
    robotsMeta,
    viewportMeta,
    htmlLang,

    openGraph,
    hasSchemaOrg: schemaTypes.length > 0,
    schemaTypes: Array.from(new Set(schemaTypes)),

    h1,
    h2Count,
    h3Count,
    h2Samples,
    h3Samples,

    wordCount,
    readingTimeMinutes,

    totalLinks,
    internalLinks,
    externalLinks,

    totalImages,
    missingAltCount,
    missingAltPercentage,
    sampleImagesWithoutAlt,

    hasViewport,
    hasCtaButton,
    ctaKeywordsFound: Array.from(ctaKeywordsFound),
    hasPhoneContact,
    hasEmailContact,
    formsCount,
    hasNavTag,
    hasFooterTag,
  };
}
