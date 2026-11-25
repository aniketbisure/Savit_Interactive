'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Loader2, AlertCircle } from 'lucide-react';
import MagneticButton from './MagneticButton';

const LIVE_SCAN_LOGS = [
  { label: 'SSRF Clearance', desc: 'Validating public host IP range...', time: '14ms', status: 'done' },
  { label: 'DOM Parsing', desc: 'Scraping 42 technical SEO & UX metrics...', time: '210ms', status: 'active' },
  { label: 'Signal Engine', desc: 'Calculating deterministic scores & rules...', time: '450ms', status: 'pending' },
  { label: 'AI Synthesis', desc: 'Synthesizing strategic recommendations...', time: '820ms', status: 'pending' },
];

export default function AuditForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeContextField, setActiveContextField] = useState<string | null>(null);
  const [scanStep, setScanStep] = useState(0);

  const [formData, setFormData] = useState({
    primaryUrl: '',
    competitorUrl1: '',
    competitorUrl2: '',
    industry: '',
    targetAudience: '',
    serviceProduct: '',
    auditObjective: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.primaryUrl.trim()) {
      setErrorMessage('Please provide a primary website URL.');
      return;
    }

    setLoading(true);
    setScanStep(1);

    const stepTimer = setInterval(() => {
      setScanStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      clearInterval(stepTimer);
      const data = await res.json();

      if (!res.ok || !data.success) {
        const fieldErrors = data.details
          ? Object.values(data.details as Record<string, string[]>)
              .flat()
              .filter(Boolean)
              .join(' ')
          : '';
        throw new Error(fieldErrors || data.error || 'Audit analysis failed.');
      }

      router.push(`/audit/${data.auditId}`);
    } catch (err: unknown) {
      clearInterval(stepTimer);
      setLoading(false);
      setScanStep(0);
      const raw = err instanceof Error ? err.message : 'An unexpected error occurred';
      // Surface friendlier messages for common network errors
      let msg = raw;
      if (raw.includes('EAI_AGAIN') || raw.includes('DNS temporarily')) {
        msg = 'DNS lookup failed for one of the URLs — this is usually a temporary network issue. Try again in a moment, or use a different URL.';
      } else if (raw.includes('ENOTFOUND')) {
        msg = 'Could not resolve that domain. Please check the URL is correct and publicly accessible.';
      } else if (raw.includes('403 Forbidden') || raw.includes('HTTP Error: 403')) {
        msg = 'That website blocked automated requests (403 Forbidden / Bot Protection). Try auditing a different site like https://stripe.com, https://vercel.com, or https://linear.app.';
      } else if (raw.includes('SSRF Protection')) {
        msg = 'That URL is blocked for security reasons (private/internal network address). Please use a public website URL.';
      }
      setErrorMessage(msg);
    }
  };

  return (
    <div id="audit-form" className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl p-7 sm:p-10 border border-zinc-200/80 shadow-2xl shadow-zinc-900/5 relative">
        {/* Step Counter Badge from Figma */}
        <div className="absolute top-8 right-8 sm:top-10 sm:right-10 text-2xl sm:text-3xl font-mono text-zinc-300 font-medium">
          01
        </div>

        {/* Form Card Header */}
        <div className="space-y-1 mb-8 pr-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#FC440C]">
            YOUR NEXT COMPETITIVE ADVANTAGE
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Start with your website.
          </h2>
          <p className="text-sm text-zinc-500 font-normal">
            A complete diagnostic in under a minute. No account required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Target URL Field */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
              PRIMARY TARGET URL *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 font-bold text-sm">
                ◎
              </span>
              <input
                type="text"
                required
                value={formData.primaryUrl}
                onChange={(e) => setFormData({ ...formData, primaryUrl: e.target.value })}
                placeholder="https://stripe.com"
                disabled={loading}
                className="w-full pl-9 pr-4 py-3.5 rounded-2xl bg-white border border-zinc-200 text-zinc-900 text-sm font-medium placeholder:text-zinc-400 focus:outline-none focus:border-[#FC440C] focus:ring-4 focus:ring-[#FC440C]/10 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Competitor URLs Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-800">
                Compare your competition
              </label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                OPTIONAL · UP TO 2 DOMAINS
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.competitorUrl1}
                onChange={(e) => setFormData({ ...formData, competitorUrl1: e.target.value })}
                placeholder="+ Add Competitor 1"
                disabled={loading}
                className="w-full px-4 py-3 rounded-2xl bg-[#FBFBFB] border border-zinc-200/90 text-zinc-900 text-xs font-medium placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-[#FC440C] focus:ring-2 focus:ring-[#FC440C]/10 transition-all"
              />
              <input
                type="text"
                value={formData.competitorUrl2}
                onChange={(e) => setFormData({ ...formData, competitorUrl2: e.target.value })}
                placeholder="+ Add Competitor 2"
                disabled={loading}
                className="w-full px-4 py-3 rounded-2xl bg-[#FBFBFB] border border-zinc-200/90 text-zinc-900 text-xs font-medium placeholder:text-zinc-400 focus:bg-white focus:outline-none focus:border-[#FC440C] focus:ring-2 focus:ring-[#FC440C]/10 transition-all"
              />
            </div>
          </div>

          {/* Business Context Interactive Pills */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-zinc-600 flex items-center gap-1.5">
                <span className="font-semibold text-zinc-900">Business context</span>
                <span className="text-zinc-400">· Personalize your strategy</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: 'industry', label: 'Industry +' },
                { key: 'targetAudience', label: 'Target Audience +' },
                { key: 'serviceProduct', label: 'Core Offering +' },
                { key: 'auditObjective', label: 'Audit Objective +' },
              ].map((pill) => (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() =>
                    setActiveContextField(activeContextField === pill.key ? null : pill.key)
                  }
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                    activeContextField === pill.key || formData[pill.key as keyof typeof formData]
                      ? 'bg-[#FC440C]/10 border-[#FC440C] text-[#FC440C] font-semibold'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  {formData[pill.key as keyof typeof formData]
                    ? `${pill.label.replace(' +', '')}: ${formData[pill.key as keyof typeof formData]}`
                    : pill.label}
                </button>
              ))}
            </div>

            {/* Inline Expanding Input for Selected Context Pill */}
            {activeContextField && (
              <div className="pt-2 animate-in fade-in duration-200">
                <input
                  type="text"
                  autoFocus
                  value={formData[activeContextField as keyof typeof formData]}
                  onChange={(e) =>
                    setFormData({ ...formData, [activeContextField]: e.target.value })
                  }
                  placeholder={`Enter ${activeContextField} context...`}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-[#FC440C] focus:ring-2 focus:ring-[#FC440C]/10"
                />
              </div>
            )}
          </div>

          {/* Live Diagnostic Console Box (Figma Jet Black Console) */}
          <div className="bg-[#000000] text-zinc-300 rounded-2xl p-5 border border-zinc-800 text-xs font-mono space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-zinc-500 pb-2 border-b border-zinc-800/80">
              <span className="text-zinc-400">LIVE DIAGNOSTIC</span>
              <span className="uppercase text-[10px] text-zinc-500">
                {loading ? 'ANALYZING LIVE HOST...' : 'PREVIEW / READY'}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {/* Row 1: SSRF */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      loading && scanStep >= 0 ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-zinc-200 font-semibold">SSRF Clearance</span>
                </div>
                <span className="text-zinc-400 text-[11px]">
                  {loading && scanStep === 0
                    ? 'Probing DNS & IP subnets...'
                    : 'Public endpoint validated'}
                </span>
                <span className="text-zinc-500 text-[10px]">32ms</span>
              </div>

              {/* Row 2: DOM Parsing */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      loading && scanStep >= 1
                        ? 'bg-emerald-400 animate-pulse'
                        : scanStep > 1
                        ? 'bg-emerald-500'
                        : 'bg-zinc-600'
                    }`}
                  />
                  <span className="text-zinc-200 font-semibold">DOM Parsing</span>
                </div>
                <span className="text-zinc-400 text-[11px]">
                  {loading && scanStep >= 1
                    ? 'Extracting meta, links & headers...'
                    : '42 deterministic signals queued'}
                </span>
                <span className="text-zinc-500 text-[10px]">{loading ? '120ms' : '–'}</span>
              </div>

              {/* Row 3: AI Synthesis */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      loading && scanStep >= 2
                        ? 'bg-[#FC440C] animate-pulse'
                        : scanStep >= 3
                        ? 'bg-emerald-500'
                        : 'bg-[#FC440C]/60'
                    }`}
                  />
                  <span className="text-zinc-200 font-semibold">AI Synthesis</span>
                </div>
                <span className="text-zinc-400 text-[11px]">
                  {loading && scanStep >= 2
                    ? 'Synthesizing with Gemini 3.5...'
                    : 'Awaiting diagnostic launch'}
                </span>
                <span className="text-zinc-500 text-[10px]">{loading ? '840ms' : '–'}</span>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Audit Blocked: </span>
                {errorMessage}
              </div>
            </div>
          )}

          {/* Primary Submit Button */}
          <div className="pt-2">
            <MagneticButton
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-full font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
                loading
                  ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  : 'bg-[#FC440C] hover:bg-[#e03b08] text-white shadow-orange-600/20 active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Executing Diagnostic Scan...</span>
                </>
              ) : (
                <>
                  <span>Launch Diagnostic Audit</span>
                  <ArrowUpRight className="w-5 h-5" />
                </>
              )}
            </MagneticButton>
          </div>

          {/* Card Footer Notes from Figma */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium pt-2">
            <span className="flex items-center gap-1">
              <span>◎</span>
              <span>Public websites only</span>
            </span>
            <span>No credit card. No noise. Just clarity.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
