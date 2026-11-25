import { ExtractedWebsiteData, CompetitorComparisonData, CompetitorComparisonMetric } from '../types/audit';

export function compareCompetitors(
  primary: ExtractedWebsiteData,
  competitors: ExtractedWebsiteData[]
): CompetitorComparisonData {
  const metrics: CompetitorComparisonMetric[] = [];
  const seoGaps: string[] = [];
  const contentGaps: string[] = [];
  const ctaConversionGaps: string[] = [];

  if (competitors.length === 0) {
    return {
      metrics: [],
      seoGaps: ['No competitor URLs were provided for comparative benchmarking.'],
      contentGaps: [],
      ctaConversionGaps: [],
    };
  }

  // 1. Content Word Count Metric
  const wordCountCompetitors = competitors.map((c) => ({
    url: c.finalUrl,
    value: `${c.wordCount} words`,
  }));
  const avgCompetitorWords = Math.round(
    competitors.reduce((acc, c) => acc + c.wordCount, 0) / competitors.length
  );
  let wordCountVerdict: 'LEAD' | 'LAG' | 'NEUTRAL' = 'NEUTRAL';
  let wordCountNote = '';

  if (primary.wordCount > avgCompetitorWords * 1.2) {
    wordCountVerdict = 'LEAD';
    wordCountNote = `Primary site has ${(primary.wordCount - avgCompetitorWords)} more words than competitor average.`;
  } else if (primary.wordCount < avgCompetitorWords * 0.8) {
    wordCountVerdict = 'LAG';
    wordCountNote = `Primary site has thinner content (${primary.wordCount} vs ${avgCompetitorWords} avg).`;
    contentGaps.push(
      `Content volume gap: Primary site has ${primary.wordCount} words, whereas competitors average ${avgCompetitorWords} words. Competitors provide more in-depth coverage.`
    );
  } else {
    wordCountNote = `Content depth is comparable to competitors (${primary.wordCount} vs ${avgCompetitorWords} avg).`;
  }

  metrics.push({
    metric: 'Content Word Count',
    primaryValue: `${primary.wordCount} words`,
    competitors: wordCountCompetitors,
    verdict: wordCountVerdict,
    notes: wordCountNote,
  });

  // 2. Meta Description Coverage
  const metaDescCompetitors = competitors.map((c) => ({
    url: c.finalUrl,
    value: c.metaDescription ? `${c.metaDescriptionLength} chars` : 'Missing',
  }));
  const compHasMeta = competitors.some((c) => !!c.metaDescription);
  if (!primary.metaDescription && compHasMeta) {
    seoGaps.push('SEO metadata gap: Primary site lacks a meta description, while competitor pages have configured meta descriptions.');
  }

  metrics.push({
    metric: 'Meta Description',
    primaryValue: primary.metaDescription ? `${primary.metaDescriptionLength} chars` : 'Missing',
    competitors: metaDescCompetitors,
    verdict: primary.metaDescription ? 'LEAD' : (compHasMeta ? 'LAG' : 'NEUTRAL'),
    notes: primary.metaDescription ? 'Properly declared' : 'Missing on primary site',
  });

  // 3. Schema Structured Data
  const schemaCompetitors = competitors.map((c) => ({
    url: c.finalUrl,
    value: c.hasSchemaOrg ? c.schemaTypes.join(', ') || 'Present' : 'None',
  }));
  const compHasSchema = competitors.some((c) => c.hasSchemaOrg);
  if (!primary.hasSchemaOrg && compHasSchema) {
    seoGaps.push('Structured data gap: Competitors utilize Schema.org rich markup, which gives them rich snippets in SERP results, while primary site has none.');
  }

  metrics.push({
    metric: 'Schema.org Structured Data',
    primaryValue: primary.hasSchemaOrg ? primary.schemaTypes.join(', ') || 'Present' : 'None',
    competitors: schemaCompetitors,
    verdict: primary.hasSchemaOrg ? 'LEAD' : (compHasSchema ? 'LAG' : 'NEUTRAL'),
    notes: primary.hasSchemaOrg ? 'Schema detected' : 'Missing rich schema',
  });

  // 4. Image Alt Coverage
  const imgAltCompetitors = competitors.map((c) => ({
    url: c.finalUrl,
    value: `${c.missingAltPercentage}% missing (${c.missingAltCount}/${c.totalImages})`,
  }));
  const compAvgMissingAlt = Math.round(
    competitors.reduce((acc, c) => acc + c.missingAltPercentage, 0) / competitors.length
  );
  let altVerdict: 'LEAD' | 'LAG' | 'NEUTRAL' = 'NEUTRAL';
  if (primary.missingAltPercentage < compAvgMissingAlt) {
    altVerdict = 'LEAD';
  } else if (primary.missingAltPercentage > compAvgMissingAlt) {
    altVerdict = 'LAG';
    seoGaps.push(
      `Image accessibility gap: Primary site is missing alt text on ${primary.missingAltPercentage}% of images, compared to ${compAvgMissingAlt}% competitor average.`
    );
  }

  metrics.push({
    metric: 'Image Alt Coverage',
    primaryValue: `${primary.missingAltPercentage}% missing (${primary.missingAltCount}/${primary.totalImages})`,
    competitors: imgAltCompetitors,
    verdict: altVerdict,
    notes: primary.missingAltCount === 0 ? '100% alt coverage' : `${primary.missingAltCount} unannotated images`,
  });

  // 5. CTAs and Conversion Points
  const ctaCompetitors = competitors.map((c) => ({
    url: c.finalUrl,
    value: c.hasCtaButton ? `Yes (${c.ctaKeywordsFound.slice(0, 3).join(', ')})` : 'None detected',
  }));
  const compHasCta = competitors.some((c) => c.hasCtaButton);
  if (!primary.hasCtaButton && compHasCta) {
    ctaConversionGaps.push('Conversion gap: Primary site lacks explicit call-to-action buttons, whereas competitors deploy prominent conversion triggers.');
  }

  metrics.push({
    metric: 'Conversion CTAs',
    primaryValue: primary.hasCtaButton ? `Yes (${primary.ctaKeywordsFound.slice(0, 3).join(', ')})` : 'None detected',
    competitors: ctaCompetitors,
    verdict: primary.hasCtaButton ? 'LEAD' : (compHasCta ? 'LAG' : 'NEUTRAL'),
    notes: primary.hasCtaButton ? 'CTA triggers present' : 'No prominent conversion action found',
  });

  // 6. Direct Contact Mechanisms
  const contactCompetitors = competitors.map((c) => ({
    url: c.finalUrl,
    value: `${c.hasPhoneContact ? 'Phone ' : ''}${c.hasEmailContact ? 'Email ' : ''}${c.formsCount > 0 ? `${c.formsCount} Forms` : ''}`.trim() || 'None',
  }));
  const compHasPhone = competitors.some((c) => c.hasPhoneContact);
  if (!primary.hasPhoneContact && compHasPhone) {
    ctaConversionGaps.push('Direct contact gap: Competitors offer click-to-call phone access, making phone conversion immediate for mobile visitors.');
  }

  metrics.push({
    metric: 'Contact Accessibility',
    primaryValue: `${primary.hasPhoneContact ? 'Phone ' : ''}${primary.hasEmailContact ? 'Email ' : ''}${primary.formsCount > 0 ? `${primary.formsCount} Forms` : ''}`.trim() || 'None',
    competitors: contactCompetitors,
    verdict: (primary.hasPhoneContact || primary.hasEmailContact) ? 'LEAD' : 'LAG',
    notes: 'Phone/Email/Form availability',
  });

  // 7. Page Response Speed (TTFB / Raw Response)
  const speedCompetitors = competitors.map((c) => ({
    url: c.finalUrl,
    value: `${c.responseTimeMs} ms`,
  }));
  const avgSpeed = Math.round(
    competitors.reduce((acc, c) => acc + c.responseTimeMs, 0) / competitors.length
  );
  metrics.push({
    metric: 'Server Response Time',
    primaryValue: `${primary.responseTimeMs} ms`,
    competitors: speedCompetitors,
    verdict: primary.responseTimeMs < avgSpeed ? 'LEAD' : 'LAG',
    notes: primary.responseTimeMs < 800 ? 'Fast response' : 'Higher latency',
  });

  return {
    metrics,
    seoGaps,
    contentGaps,
    ctaConversionGaps,
  };
}
