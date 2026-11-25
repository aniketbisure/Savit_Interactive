import { NextRequest, NextResponse } from 'next/server';
import { CreateAuditSchema } from '@/lib/validations/audit';
import { extractWebsiteData } from '@/lib/scraper/extractor';
import { runDeterministicAudit } from '@/lib/analyzer/rules';
import { compareCompetitors } from '@/lib/analyzer/comparator';
import { generateAIReport } from '@/lib/ai/synthesizer';
import {
  createAuditRecord,
  updateAuditRecord,
  listAudits,
} from '@/lib/services/audit-service';
import { ExtractedWebsiteData } from '@/lib/types/audit';

export async function GET() {
  try {
    const audits = await listAudits();
    return NextResponse.json({ success: true, data: audits });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to retrieve audits';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let auditRecordId: string | null = null;

  try {
    const rawBody = await req.json();
    const parseResult = CreateAuditSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      primaryUrl,
      competitorUrl1,
      competitorUrl2,
      industry,
      targetAudience,
      serviceProduct,
      auditObjective,
    } = parseResult.data;

    // 1. Initialize audit record in DB (status: PROCESSING)
    const auditRecord = await createAuditRecord({
      primaryUrl,
      competitorUrl1,
      competitorUrl2,
      industry,
      targetAudience,
      serviceProduct,
      auditObjective,
    });
    auditRecordId = auditRecord.id;

    // 2. Extract data from primary website
    let primaryData: ExtractedWebsiteData;
    try {
      primaryData = await extractWebsiteData(primaryUrl);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to extract primary website data.';
      await updateAuditRecord(auditRecordId, {
        status: 'FAILED',
        errorMessage: `Primary Site Extraction Error: ${errorMsg}`,
      });
      return NextResponse.json(
        {
          success: false,
          auditId: auditRecordId,
          error: `Failed to audit primary website: ${errorMsg}`,
        },
        { status: 422 }
      );
    }

    // 3. Extract data from competitor websites (safely handle failures without aborting the entire audit)
    const competitorsData: ExtractedWebsiteData[] = [];
    const competitorErrors: string[] = [];

    const compUrls = [competitorUrl1, competitorUrl2].filter(
      (u): u is string => typeof u === 'string' && u.trim().length > 0
    );

    for (const cUrl of compUrls) {
      try {
        const cData = await extractWebsiteData(cUrl);
        competitorsData.push(cData);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown extraction failure';
        competitorErrors.push(`Competitor (${cUrl}): ${errorMsg}`);
      }
    }

    // 4. Run deterministic SEO & UX audit engine (Pure facts)
    const factualAudit = runDeterministicAudit(primaryData);

    // 5. Run competitor comparison engine
    const competitorComparison = compareCompetitors(primaryData, competitorsData);

    // 6. Generate AI strategic report & synthesis
    const aiReport = await generateAIReport(
      primaryData,
      factualAudit,
      competitorComparison,
      competitorsData,
      {
        industry,
        targetAudience,
        serviceProduct,
        auditObjective,
      }
    );

    // 7. Update database record with completed status and all payloads
    const completedAudit = await updateAuditRecord(auditRecordId, {
      status: 'COMPLETED',
      errorMessage: competitorErrors.length > 0 ? competitorErrors.join(' | ') : null,
      overallScore: aiReport.overallScore ?? factualAudit.overallScore,
      seoScore: aiReport.seoScore ?? factualAudit.seoScore,
      uxScore: aiReport.uxScore ?? factualAudit.uxScore,
      extractedData: {
        primary: primaryData,
        competitors: competitorsData,
        competitorErrors,
      },
      seoFindings: factualAudit.seoChecks,
      uxFindings: factualAudit.uxChecks,
      competitorData: competitorComparison,
      aiReport,
    });

    return NextResponse.json({
      success: true,
      auditId: auditRecordId,
      data: completedAudit,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unexpected internal server error';

    if (auditRecordId) {
      await updateAuditRecord(auditRecordId, {
        status: 'FAILED',
        errorMessage: errorMsg,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
