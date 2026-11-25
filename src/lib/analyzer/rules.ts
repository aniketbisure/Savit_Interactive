import { ExtractedWebsiteData, AuditCheckItem, FactualAuditReport } from '../types/audit';

export function runDeterministicAudit(data: ExtractedWebsiteData): FactualAuditReport {
  const seoChecks: AuditCheckItem[] = [];
  const uxChecks: AuditCheckItem[] = [];

  // ==========================================
  // 1. SEO AUDIT RULES (Strictly Factual)
  // ==========================================

  // Title Check
  if (!data.title) {
    seoChecks.push({
      id: 'seo-title-missing',
      title: 'Page Title Tag',
      passed: false,
      severity: 'HIGH',
      category: 'SEO',
      fact: 'The <title> tag is completely missing from the HTML document.',
      recommendation: 'Add a concise, keyword-rich <title> tag between 30 and 60 characters.',
    });
  } else if (data.titleLength < 30) {
    seoChecks.push({
      id: 'seo-title-short',
      title: 'Page Title Tag Length',
      passed: false,
      severity: 'MEDIUM',
      category: 'SEO',
      fact: `The title is ${data.titleLength} characters long ("${data.title}"). Recommended length is 30–60 characters.`,
      recommendation: 'Expand the title to incorporate primary brand and target keywords.',
    });
  } else if (data.titleLength > 65) {
    seoChecks.push({
      id: 'seo-title-long',
      title: 'Page Title Tag Length',
      passed: false,
      severity: 'LOW',
      category: 'SEO',
      fact: `The title is ${data.titleLength} characters long and may be truncated in search results.`,
      recommendation: 'Shorten the title to under 60 characters so it fits search result snippets.',
    });
  } else {
    seoChecks.push({
      id: 'seo-title-optimal',
      title: 'Page Title Tag',
      passed: true,
      severity: 'LOW',
      category: 'SEO',
      fact: `Optimal title tag detected (${data.titleLength} characters): "${data.title}"`,
      recommendation: 'Maintain relevant search keywords in title.',
    });
  }

  // Meta Description Check
  if (!data.metaDescription) {
    seoChecks.push({
      id: 'seo-meta-desc-missing',
      title: 'Meta Description',
      passed: false,
      severity: 'HIGH',
      category: 'SEO',
      fact: 'No meta description tag was found on the page.',
      recommendation: 'Add a compelling meta description between 50 and 160 characters describing the primary offering.',
    });
  } else if (data.metaDescriptionLength < 50) {
    seoChecks.push({
      id: 'seo-meta-desc-short',
      title: 'Meta Description Length',
      passed: false,
      severity: 'MEDIUM',
      category: 'SEO',
      fact: `Meta description is short (${data.metaDescriptionLength} characters). Recommended: 50–160 characters.`,
      recommendation: 'Expand the description to provide more context and clear search click-through incentives.',
    });
  } else if (data.metaDescriptionLength > 165) {
    seoChecks.push({
      id: 'seo-meta-desc-long',
      title: 'Meta Description Length',
      passed: false,
      severity: 'LOW',
      category: 'SEO',
      fact: `Meta description is ${data.metaDescriptionLength} characters and may be cut off by search engines.`,
      recommendation: 'Keep meta descriptions within 150–160 characters to avoid truncation.',
    });
  } else {
    seoChecks.push({
      id: 'seo-meta-desc-optimal',
      title: 'Meta Description',
      passed: true,
      severity: 'LOW',
      category: 'SEO',
      fact: `Meta description is present with optimal length (${data.metaDescriptionLength} characters).`,
      recommendation: 'Keep description up-to-date with active marketing campaigns.',
    });
  }

  // H1 Check
  if (data.h1.length === 0) {
    seoChecks.push({
      id: 'seo-h1-missing',
      title: 'H1 Primary Heading',
      passed: false,
      severity: 'HIGH',
      category: 'SEO',
      fact: 'Zero <h1> headings found on the page.',
      recommendation: 'Add exactly one <h1> heading summarizing the primary value proposition.',
    });
  } else if (data.h1.length > 1) {
    seoChecks.push({
      id: 'seo-h1-multiple',
      title: 'Multiple H1 Headings',
      passed: false,
      severity: 'MEDIUM',
      category: 'SEO',
      fact: `Found ${data.h1.length} separate <h1> tags: ${data.h1.map((h) => `"${h}"`).join(', ')}.`,
      recommendation: 'Consolidate into a single primary <h1> heading and demote supplementary headings to <h2>.',
    });
  } else {
    seoChecks.push({
      id: 'seo-h1-optimal',
      title: 'H1 Primary Heading',
      passed: true,
      severity: 'LOW',
      category: 'SEO',
      fact: `Single clear <h1> heading found: "${data.h1[0]}"`,
      recommendation: 'Ensure your target keywords are prominently featured in this heading.',
    });
  }

  // Heading Hierarchy Check (H2 & H3)
  if (data.h2Count === 0 && data.wordCount > 300) {
    seoChecks.push({
      id: 'seo-h2-missing',
      title: 'Subheadings Structure (H2)',
      passed: false,
      severity: 'MEDIUM',
      category: 'SEO',
      fact: `Page has ${data.wordCount} words but lacks any <h2> subheadings.`,
      recommendation: 'Organize long-form content using <h2> sections to aid crawling and scannability.',
    });
  } else {
    seoChecks.push({
      id: 'seo-headings-structured',
      title: 'Content Hierarchy',
      passed: true,
      severity: 'LOW',
      category: 'SEO',
      fact: `Found ${data.h2Count} H2 headings and ${data.h3Count} H3 subheadings.`,
      recommendation: 'Maintain a clear hierarchical cascade from H1 to H2 to H3.',
    });
  }

  // Image Alt Text Check
  if (data.totalImages > 0 && data.missingAltCount > 0) {
    const isHigh = data.missingAltPercentage > 30;
    seoChecks.push({
      id: 'seo-image-alt-missing',
      title: 'Image Alt Text Attributes',
      passed: false,
      severity: isHigh ? 'HIGH' : 'MEDIUM',
      category: 'SEO',
      fact: `${data.missingAltCount} out of ${data.totalImages} images (${data.missingAltPercentage}%) are missing alt attributes.`,
      recommendation: 'Provide descriptive alt attributes for all informative images for SEO and screen-reader accessibility.',
    });
  } else if (data.totalImages > 0) {
    seoChecks.push({
      id: 'seo-image-alt-complete',
      title: 'Image Alt Text Coverage',
      passed: true,
      severity: 'LOW',
      category: 'SEO',
      fact: `All ${data.totalImages} images contain alt attributes (100% coverage).`,
      recommendation: 'Ensure alt descriptions remain accurate and avoid keyword stuffing.',
    });
  }

  // Canonical & Robots Check
  if (!data.canonicalUrl) {
    seoChecks.push({
      id: 'seo-canonical-missing',
      title: 'Canonical URL Tag',
      passed: false,
      severity: 'MEDIUM',
      category: 'SEO',
      fact: 'No <link rel="canonical"> tag detected.',
      recommendation: 'Specify a self-referential canonical URL to prevent duplicate content indexing issues.',
    });
  } else {
    seoChecks.push({
      id: 'seo-canonical-present',
      title: 'Canonical URL Tag',
      passed: true,
      severity: 'LOW',
      category: 'SEO',
      fact: `Canonical URL declared: ${data.canonicalUrl}`,
      recommendation: 'Verify canonical URL matches preferred domain version (www vs non-www).',
    });
  }

  if (data.robotsMeta && data.robotsMeta.toLowerCase().includes('noindex')) {
    seoChecks.push({
      id: 'seo-robots-noindex',
      title: 'Search Indexing Directives (Robots)',
      passed: false,
      severity: 'HIGH',
      category: 'SEO',
      fact: `Robots meta tag explicitly blocks indexing: "${data.robotsMeta}".`,
      recommendation: 'Remove "noindex" directive if this page is intended for public search engine visibility.',
    });
  } else {
    seoChecks.push({
      id: 'seo-robots-indexable',
      title: 'Search Indexing Directives',
      passed: true,
      severity: 'LOW',
      category: 'SEO',
      fact: 'Page allows search engine indexing.',
      recommendation: 'Monitor search console for indexation status.',
    });
  }

  // HTTPS Protocol Check
  if (!data.isHttps) {
    seoChecks.push({
      id: 'seo-https-insecure',
      title: 'SSL / HTTPS Security',
      passed: false,
      severity: 'HIGH',
      category: 'SEO',
      fact: 'Page is served over unencrypted HTTP protocol.',
      recommendation: 'Install an SSL certificate and redirect all HTTP traffic to HTTPS.',
    });
  } else {
    seoChecks.push({
      id: 'seo-https-secure',
      title: 'SSL / HTTPS Security',
      passed: true,
      severity: 'LOW',
      category: 'SEO',
      fact: 'Page is securely served over HTTPS.',
      recommendation: 'Ensure all linked assets are also delivered via HTTPS to prevent mixed content warnings.',
    });
  }

  // Word Count / Thin Content Check
  if (data.wordCount < 250) {
    seoChecks.push({
      id: 'seo-content-thin',
      title: 'Content Depth / Word Count',
      passed: false,
      severity: 'MEDIUM',
      category: 'SEO',
      fact: `Page has relatively thin text content (${data.wordCount} words).`,
      recommendation: 'Enrich page with clear explanations of products, services, FAQs, and value propositions.',
    });
  } else {
    seoChecks.push({
      id: 'seo-content-sufficient',
      title: 'Content Depth / Word Count',
      passed: true,
      severity: 'LOW',
      category: 'SEO',
      fact: `Page contains sufficient written content (${data.wordCount} words, ~${data.readingTimeMinutes} min read).`,
      recommendation: 'Regularly audit content freshness and relevancy.',
    });
  }

  // Open Graph & Social Metadata
  if (!data.openGraph.title || !data.openGraph.image) {
    seoChecks.push({
      id: 'seo-og-missing',
      title: 'Open Graph Social Sharing Meta',
      passed: false,
      severity: 'LOW',
      category: 'SEO',
      fact: `Missing complete Open Graph social tags (og:title: ${data.openGraph.title ? 'Yes' : 'No'}, og:image: ${data.openGraph.image ? 'Yes' : 'No'}).`,
      recommendation: 'Add og:title, og:description, and og:image tags for rich previews on LinkedIn, Twitter, and messaging apps.',
    });
  } else {
    seoChecks.push({
      id: 'seo-og-present',
      title: 'Open Graph Social Sharing Meta',
      passed: true,
      severity: 'LOW',
      category: 'SEO',
      fact: 'Open Graph title and image metadata are properly configured.',
      recommendation: 'Test social card previews periodically.',
    });
  }

  // Structured Data / Schema.org
  if (!data.hasSchemaOrg) {
    seoChecks.push({
      id: 'seo-schema-missing',
      title: 'Structured Data (Schema.org / JSON-LD)',
      passed: false,
      severity: 'LOW',
      category: 'SEO',
      fact: 'No Schema.org structured data (JSON-LD) detected.',
      recommendation: 'Implement relevant schema (e.g., Organization, LocalBusiness, WebSite, or FAQPage) for rich search snippet enhancements.',
    });
  } else {
    seoChecks.push({
      id: 'seo-schema-present',
      title: 'Structured Data (Schema.org)',
      passed: true,
      severity: 'LOW',
      category: 'SEO',
      fact: `Found Schema.org types: ${data.schemaTypes.join(', ')}.`,
      recommendation: 'Validate schema using Google Rich Results Test.',
    });
  }

  // ==========================================
  // 2. WEBSITE & UX AUDIT RULES (Measurable Signals Only)
  // ==========================================

  // Mobile Viewport
  if (!data.hasViewport) {
    uxChecks.push({
      id: 'ux-viewport-missing',
      title: 'Mobile Viewport Meta Tag',
      passed: false,
      severity: 'HIGH',
      category: 'UX',
      fact: 'The mobile <meta name="viewport" content="width=device-width, initial-scale=1"> tag is missing.',
      recommendation: 'Add the standard responsive viewport meta tag to enable proper mobile layout scaling.',
    });
  } else {
    uxChecks.push({
      id: 'ux-viewport-present',
      title: 'Mobile Viewport Tag',
      passed: true,
      severity: 'LOW',
      category: 'UX',
      fact: `Responsive mobile viewport configuration detected ("${data.viewportMeta}").`,
      recommendation: 'Ensure touch targets meet minimum 48x48px size standard.',
    });
  }

  // Primary Call-To-Action (CTA) Availability
  if (!data.hasCtaButton) {
    uxChecks.push({
      id: 'ux-cta-missing',
      title: 'Primary Call to Action (CTA)',
      passed: false,
      severity: 'HIGH',
      category: 'UX',
      fact: 'No standard conversion action buttons (e.g., "Contact", "Sign Up", "Book", "Get Started") were identified.',
      recommendation: 'Place prominent, contrasting CTA buttons above the fold and at key content milestones.',
    });
  } else {
    uxChecks.push({
      id: 'ux-cta-present',
      title: 'Call to Action (CTA) Detection',
      passed: true,
      severity: 'LOW',
      category: 'UX',
      fact: `Conversion CTAs identified (${data.ctaKeywordsFound.slice(0, 4).join(', ')}).`,
      recommendation: 'Test button copy and contrast to maximize conversion rates.',
    });
  }

  // Contact Accessibility
  if (!data.hasPhoneContact && !data.hasEmailContact && data.formsCount === 0) {
    uxChecks.push({
      id: 'ux-contact-missing',
      title: 'Contact Accessibility',
      passed: false,
      severity: 'HIGH',
      category: 'UX',
      fact: 'No direct contact signals detected (no tel: links, mailto: links, or interactive form elements).',
      recommendation: 'Provide clear contact pathways (clickable phone number, email address, or contact form).',
    });
  } else {
    const methods: string[] = [];
    if (data.hasPhoneContact) methods.push('Click-to-call phone');
    if (data.hasEmailContact) methods.push('Direct email');
    if (data.formsCount > 0) methods.push(`${data.formsCount} interactive form(s)`);

    uxChecks.push({
      id: 'ux-contact-accessible',
      title: 'Contact Pathways',
      passed: true,
      severity: 'LOW',
      category: 'UX',
      fact: `Direct contact channels detected: ${methods.join(', ')}.`,
      recommendation: 'Ensure mobile users can tap phone links to dial immediately.',
    });
  }

  // Navigation Structure (<nav>)
  if (!data.hasNavTag) {
    uxChecks.push({
      id: 'ux-nav-semantic-missing',
      title: 'Semantic Navigation (<nav>)',
      passed: false,
      severity: 'MEDIUM',
      category: 'UX',
      fact: 'No semantic <nav> element found for site navigation.',
      recommendation: 'Wrap main header menus in semantic <nav> containers for screen-reader navigation.',
    });
  } else {
    uxChecks.push({
      id: 'ux-nav-semantic-present',
      title: 'Semantic Site Navigation',
      passed: true,
      severity: 'LOW',
      category: 'UX',
      fact: 'Semantic <nav> element is present in the document.',
      recommendation: 'Keep main navigation concise and clearly labeled.',
    });
  }

  // Language Declaration (<html lang="...">)
  if (!data.htmlLang) {
    uxChecks.push({
      id: 'ux-lang-missing',
      title: 'HTML Language Attribute',
      passed: false,
      severity: 'LOW',
      category: 'UX',
      fact: 'The <html> tag lacks a lang attribute (e.g., lang="en").',
      recommendation: 'Add the lang attribute to specify primary document language for browser translators and screen readers.',
    });
  } else {
    uxChecks.push({
      id: 'ux-lang-present',
      title: 'Document Language Declaration',
      passed: true,
      severity: 'LOW',
      category: 'UX',
      fact: `Document language declared as "${data.htmlLang}".`,
      recommendation: 'Ensure localized pages declare matching regional lang tags.',
    });
  }

  // Internal vs External Link Ratio
  if (data.internalLinks === 0 && data.totalLinks > 0) {
    uxChecks.push({
      id: 'ux-internal-links-sparse',
      title: 'Internal Navigation Pathways',
      passed: false,
      severity: 'MEDIUM',
      category: 'UX',
      fact: `Page has ${data.totalLinks} links, but 0 internal site links detected.`,
      recommendation: 'Add internal links to guide users to related services, case studies, or contact pages.',
    });
  } else {
    uxChecks.push({
      id: 'ux-internal-links-good',
      title: 'Internal Linking Structure',
      passed: true,
      severity: 'LOW',
      category: 'UX',
      fact: `Found ${data.internalLinks} internal links and ${data.externalLinks} external references.`,
      recommendation: 'Ensure all primary user journeys are linked from the homepage.',
    });
  }

  // Calculate deterministic scores (0-100)
  const calcScore = (checks: AuditCheckItem[]): number => {
    if (checks.length === 0) return 0;
    const totalPoints = checks.reduce((acc, curr) => {
      const weight = curr.severity === 'HIGH' ? 3 : curr.severity === 'MEDIUM' ? 2 : 1;
      return acc + weight;
    }, 0);

    const earnedPoints = checks.reduce((acc, curr) => {
      if (!curr.passed) return acc;
      const weight = curr.severity === 'HIGH' ? 3 : curr.severity === 'MEDIUM' ? 2 : 1;
      return acc + weight;
    }, 0);

    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const seoScore = calcScore(seoChecks);
  const uxScore = calcScore(uxChecks);
  const overallScore = Math.round((seoScore * 0.6) + (uxScore * 0.4));

  return {
    seoScore,
    uxScore,
    overallScore,
    seoChecks,
    uxChecks,
  };
}
