export interface ExtractedWebsiteData {
  url: string;
  finalUrl: string;
  isHttps: boolean;
  httpStatus: number;
  responseTimeMs: number;
  htmlSizeBytes: number;

  // Metadata
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  canonicalUrl: string | null;
  robotsMeta: string | null;
  viewportMeta: string | null;
  htmlLang: string | null;

  // OpenGraph & Schema
  openGraph: {
    title: string | null;
    description: string | null;
    image: string | null;
    type: string | null;
  };
  hasSchemaOrg: boolean;
  schemaTypes: string[];

  // Headings
  h1: string[];
  h2Count: number;
  h3Count: number;
  h2Samples: string[];
  h3Samples: string[];

  // Content
  wordCount: number;
  readingTimeMinutes: number;

  // Links
  totalLinks: number;
  internalLinks: number;
  externalLinks: number;

  // Images
  totalImages: number;
  missingAltCount: number;
  missingAltPercentage: number;
  sampleImagesWithoutAlt: string[];

  // Conversion & UX Signals
  hasViewport: boolean;
  hasCtaButton: boolean;
  ctaKeywordsFound: string[];
  hasPhoneContact: boolean;
  hasEmailContact: boolean;
  formsCount: number;
  hasNavTag: boolean;
  hasFooterTag: boolean;
}

export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface AuditCheckItem {
  id: string;
  title: string;
  passed: boolean;
  severity: Severity;
  category: 'SEO' | 'UX' | 'PERFORMANCE' | 'ACCESSIBILITY';
  fact: string;
  recommendation: string;
}

export interface FactualAuditReport {
  seoScore: number;
  uxScore: number;
  overallScore: number;
  seoChecks: AuditCheckItem[];
  uxChecks: AuditCheckItem[];
}

export interface CompetitorComparisonMetric {
  metric: string;
  primaryValue: string | number;
  competitors: {
    url: string;
    value: string | number;
  }[];
  verdict: 'LEAD' | 'LAG' | 'NEUTRAL';
  notes: string;
}

export interface CompetitorComparisonData {
  metrics: CompetitorComparisonMetric[];
  seoGaps: string[];
  contentGaps: string[];
  ctaConversionGaps: string[];
}

export interface PrioritizedIssue {
  title: string;
  category: string;
  severity: Severity;
  fact: string;
  impact: string;
  evidence: string;
  recommendation: string;
}

export interface AIStrategicReport {
  overallScore: number;
  seoScore: number;
  uxScore: number;
  auditorTake?: string; // Editorial perspective from lead growth strategist
  clientSummary: string;
  competitorSummary: string;
  strengths: string[];
  weaknesses: string[];
  prioritizedIssues: PrioritizedIssue[];
  actionPlan: {
    quickWins: string[];
    mediumTerm: string[];
    longTerm: string[];
  };
}
