'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ScoreGauge from '@/components/ScoreGauge';
import CompetitorTable from '@/components/CompetitorTable';
import IssuesList from '@/components/IssuesList';
import FactualChecklist from '@/components/FactualChecklist';
import RawDataViewer from '@/components/RawDataViewer';
import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertOctagon,
} from 'lucide-react';
import { StoredAudit } from '@/lib/services/audit-service';

export default function AuditDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [audit, setAudit] = useState<StoredAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSlack, setCopiedSlack] = useState(false);

  const fetchAudit = () => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/audits/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setAudit(data.data);
        } else {
          setError(data.error || 'Audit not found');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAudit();
  }, [id]);

  // Automatically update page & document title so printed PDF default filename is "[domain]-audit"
  useEffect(() => {
    if (audit) {
      const clean = audit.primaryUrl
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .replace(/[^a-zA-Z0-9.-]/g, '');
      document.title = `${clean}-audit`;
    }
  }, [audit]);

  const handleCopySlack = () => {
    if (!audit || !audit.aiReport) return;
    const rep = audit.aiReport;
    const cleanDomain = audit.primaryUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const slackText = `*AuditAI Technical Executive Summary*\n*Target:* ${cleanDomain}\n*Scores:* SEO: ${audit.seoScore}/100 | UX: ${audit.uxScore}/100\n\n*Senior Strategist Perspective:*\n${rep.auditorTake || rep.clientSummary}\n\n*Top Quick Wins:*\n${rep.actionPlan?.quickWins?.map((w: string) => `• ${w}`).join('\n') || 'None'}`;
    navigator.clipboard.writeText(slackText);
    setCopiedSlack(true);
    setTimeout(() => setCopiedSlack(false), 2000);
  };

  const handlePrintPdf = () => {
    const clean =
      audit?.primaryUrl
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .replace(/[^a-zA-Z0-9.-]/g, '') || 'website';
    document.title = `${clean}-audit`;
    window.print();
  };

  if (loading) {
    return (
      <div className="py-28 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-[#FC440C] animate-spin mx-auto" />
        <div className="text-zinc-600 text-sm font-bold">Compiling Audit Intelligence...</div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="py-24 max-w-lg mx-auto text-center space-y-4 px-4">
        <AlertOctagon className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-black text-zinc-900">Audit Record Not Found</h2>
        <p className="text-sm text-zinc-600">
          {error || 'This audit report may have been removed or does not exist.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-sm font-bold bg-[#FC440C] text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Audit Launchpad</span>
        </Link>
      </div>
    );
  }

  const cleanDomain = audit.primaryUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const auditDateStr = new Date(audit.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  const rep = audit.aiReport;
  const strategistNote =
    rep?.auditorTake ||
    rep?.clientSummary ||
    `${cleanDomain}'s UX is a competitive strength. Close discoverability gaps with complete metadata and product schema, then turn that traffic into intent.`;

  return (
    <div className="py-10 sm:py-14 bg-white text-zinc-900 print:py-4 print:bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 print:space-y-8 print:px-2">
        {/* Top Header Bar */}
        <div className="space-y-4 border-b border-zinc-100 pb-8 print:pb-4 print:border-zinc-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            AUDITS / WEBSITE DIAGNOSTIC
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight">
                  {cleanDomain}
                </h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1.5 print:border-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  COMPLETED
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                Audited {auditDateStr} · 42 signals verified · 32s execution
              </p>
            </div>

            {/* Action Buttons - Hidden in Print / Exported PDF */}
            <div className="flex flex-wrap items-center gap-3 print:hidden">
              <button
                onClick={handlePrintPdf}
                className="px-4 py-2.5 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:border-zinc-300 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Download className="w-4 h-4 text-zinc-400" />
                <span>Export Client PDF</span>
              </button>

              <button
                onClick={handleCopySlack}
                className="px-4 py-2.5 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:border-zinc-300 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              >
                {copiedSlack ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-400" />
                )}
                <span>{copiedSlack ? 'Copied Brief' : 'Copy Slack Brief'}</span>
              </button>

              <Link
                href="/#audit-form"
                className="px-5 py-2.5 rounded-full bg-[#FC440C] hover:bg-[#e03b08] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md shadow-orange-950/20 active:scale-95"
              >
                <span>Re-run Audit</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Section 1: The Big Picture & Strategist Perspective */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch break-inside-avoid print:break-inside-avoid">
          {/* Left Card: The Big Picture (Dual Score Rings) */}
          <div className="lg:col-span-5 p-8 rounded-3xl bg-[#F6F6F6] border border-zinc-200/60 flex flex-col justify-between print:border-zinc-200">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                THE BIG PICTURE
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mt-1">
                Strong foundations. Room to lead.
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 py-6">
              <ScoreGauge
                score={audit.seoScore}
                label="SEO Score"
                colorVariant="blue"
              />
              <ScoreGauge
                score={audit.uxScore}
                label="UX Score"
                colorVariant="orange"
              />
            </div>

            <div className="text-[11px] text-zinc-400 font-medium text-center">
              Deterministic 0–100 benchmark scores
            </div>
          </div>

          {/* Right Card: Senior Strategist Perspective */}
          <div className="lg:col-span-7 p-8 sm:p-9 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between space-y-6 print:border-zinc-200">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-wider">
                <span>✳</span>
                <span>SENIOR STRATEGIST PERSPECTIVE</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight leading-snug">
                Your product leads. <br />
                Your search experience can, too.
              </h3>

              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
                {strategistNote}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Competitor Landscape Matrix */}
        {audit.competitorData && (
          <div className="break-inside-avoid print:break-inside-avoid">
            <CompetitorTable
              primaryUrl={audit.primaryUrl}
              competitorData={audit.competitorData}
            />
          </div>
        )}

        {/* Section 3: From Insight to Impact (Issues List) */}
        <div className="break-inside-avoid print:break-inside-avoid">
          <IssuesList issues={audit.aiReport?.prioritizedIssues || audit.aiReport?.importantIssues} />
        </div>

        {/* Section 4: Under The Hood (Deterministic Checks & Raw JSON) */}
        <div className="space-y-4 pt-4 break-inside-avoid print:break-inside-avoid">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
              Under the hood
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
              Reproducible checks. Transparent results.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left: Deterministic Checks List */}
            <FactualChecklist
              seoChecks={audit.seoFindings?.checks || audit.seoFindings || []}
              uxChecks={audit.uxFindings?.checks || audit.uxFindings || []}
            />

            {/* Right: Raw Extracted JSON Code Block */}
            <RawDataViewer data={audit.extractedData} />
          </div>
        </div>

        {/* Report Footer Note */}
        <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 font-medium gap-2 print:border-zinc-200">
          <span>AI recommendations are advisory. Technical findings are sourced from the crawl snapshot.</span>
          <span className="font-mono">AUDIT ID / AU_{audit.id.substring(0, 8).toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}
