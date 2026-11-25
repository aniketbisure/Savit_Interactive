'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, Plus } from 'lucide-react';
import { StoredAudit } from '@/lib/services/audit-service';

export default function HistoryPage() {
  const [audits, setAudits] = useState<StoredAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'FAILED'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'HIGHEST'>('NEWEST');

  const fetchAudits = () => {
    fetch('/api/audits')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAudits(data.data);
        }
      })
      .catch((err) => console.error('Failed to load audits', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const totalCount = audits.length;
  const completedCount = audits.filter((a) => a.status === 'COMPLETED').length;
  const scoredAudits = audits.filter((a) => typeof a.seoScore === 'number');
  const avgSeo = scoredAudits.length > 0
    ? Math.round(scoredAudits.reduce((acc, a) => acc + (a.seoScore || 0), 0) / scoredAudits.length)
    : 0;

  let filtered = audits.filter((a) => {
    const matchesSearch =
      a.primaryUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.industry && a.industry.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'COMPLETED') return a.status === 'COMPLETED';
    if (statusFilter === 'FAILED') return a.status === 'FAILED';
    return true;
  });

  if (sortBy === 'HIGHEST') {
    filtered = [...filtered].sort((a, b) => (b.seoScore || 0) - (a.seoScore || 0));
  } else {
    filtered = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return (
    <div className="py-10 sm:py-14 bg-white text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Figma Header & Stat Counters */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4">
          <div className="space-y-2 max-w-xl">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#FC440C]">
              YOUR INTELLIGENCE, ORGANIZED
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-none">
              Every audit. Every advantage.
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 font-medium pt-1">
              Revisit findings, track progress, and keep your next move in focus.
            </p>
          </div>

          {/* 3 Metric Cards from Figma */}
          <div className="flex items-center gap-8 self-start lg:self-auto">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-zinc-900 leading-none">
                {totalCount}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">
                TOTAL AUDITS
              </div>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-zinc-900 leading-none">
                {completedCount}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">
                COMPLETED
              </div>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#0808C4] leading-none">
                {avgSeo}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-1">
                AVG. SEO
              </div>
            </div>
          </div>
        </div>

        {/* Controls Toolbar from Figma */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by domain name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-zinc-200 text-xs sm:text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#FC440C] focus:ring-2 focus:ring-[#FC440C]/10 transition-all shadow-2xs"
            />
          </div>

          {/* Filters & Action Button */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 rounded-full bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-400 transition-all cursor-pointer shadow-2xs"
            >
              <option value="ALL">Status: All</option>
              <option value="COMPLETED">Status: Completed</option>
              <option value="FAILED">Status: Failed</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 rounded-full bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-zinc-400 transition-all cursor-pointer shadow-2xs"
            >
              <option value="NEWEST">Sort: Newest</option>
              <option value="HIGHEST">Sort: Highest Score</option>
            </select>

            <Link
              href="/#audit-form"
              className="px-5 py-2 rounded-full bg-[#FC440C] hover:bg-[#e03b08] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-md shadow-orange-950/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New audit</span>
            </Link>
          </div>
        </div>

        {/* Audit Data Table from Figma Page 3 */}
        {filtered.length > 0 ? (
          <div className="overflow-x-auto rounded-3xl border border-zinc-200/80 bg-white shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="py-4 px-6">DOMAIN URL</th>
                  <th className="py-4 px-6">AUDIT DATE</th>
                  <th className="py-4 px-6 text-center">SEO SCORE</th>
                  <th className="py-4 px-6 text-center">UX SCORE</th>
                  <th className="py-4 px-6 text-center">EXECUTION STATUS</th>
                  <th className="py-4 px-6 text-right">REPORT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium">
                {filtered.map((item) => {
                  const domain = item.primaryUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
                  const isCompleted = item.status === 'COMPLETED';
                  const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                      {/* Domain URL */}
                      <td className="py-4 px-6 font-bold text-zinc-900">
                        <div className="flex items-center gap-2.5">
                          <span className="text-zinc-400">◎</span>
                          <Link
                            href={`/audit/${item.id}`}
                            className="hover:text-[#FC440C] transition-colors"
                          >
                            {domain}
                          </Link>
                          {!isCompleted && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                              Private host blocked
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Audit Date */}
                      <td className="py-4 px-6 text-zinc-500 font-normal">
                        {dateStr}
                      </td>

                      {/* SEO Score */}
                      <td className="py-4 px-6 text-center">
                        {item.seoScore !== null && item.seoScore !== undefined ? (
                          <span className="inline-block px-3 py-1 rounded-lg bg-blue-50/70 text-[#0808C4] font-black text-xs">
                            {item.seoScore}
                          </span>
                        ) : (
                          <span className="text-zinc-300 font-mono">—</span>
                        )}
                      </td>

                      {/* UX Score */}
                      <td className="py-4 px-6 text-center">
                        {item.uxScore !== null && item.uxScore !== undefined ? (
                          <span className="inline-block px-3 py-1 rounded-lg bg-zinc-100 text-zinc-800 font-black text-xs">
                            {item.uxScore}
                          </span>
                        ) : (
                          <span className="text-zinc-300 font-mono">—</span>
                        )}
                      </td>

                      {/* Execution Status */}
                      <td className="py-4 px-6 text-center">
                        {isCompleted ? (
                          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            COMPLETED
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
                            FAILED
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={isCompleted ? `/audit/${item.id}` : '/#audit-form'}
                          className="inline-flex items-center gap-1 font-bold text-xs text-zinc-700 hover:text-[#FC440C] transition-colors"
                        >
                          <span>{isCompleted ? 'View report' : 'Retry audit'}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Table Count Footer */}
            <div className="py-4 px-6 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
              <span>Showing {filtered.length} of {totalCount} audits</span>
            </div>
          </div>
        ) : (
          /* Empty State from Figma Page 4 */
          <div className="py-20 px-4 rounded-3xl bg-[#FBFBFB] border border-dashed border-zinc-200 text-center space-y-4 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto text-2xl font-bold">
              ◎
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-zinc-900">No audits found</h3>
              <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
                Try a different domain or clear your filters. Your next opportunity starts with a new audit.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/#audit-form"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#FC440C] hover:bg-[#e03b08] text-white text-xs sm:text-sm font-bold transition-all shadow-sm"
              >
                <span>Launch your first audit</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
