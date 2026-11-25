import React from 'react';
import { CompetitorComparisonData, CompetitorComparisonMetric } from '@/lib/types/audit';

interface CompetitorTableProps {
  primaryUrl: string;
  competitorData: CompetitorComparisonData | null | undefined;
}

export default function CompetitorTable({ primaryUrl, competitorData }: CompetitorTableProps) {
  if (!competitorData || !competitorData.metrics || competitorData.metrics.length === 0) {
    return null;
  }

  const { metrics } = competitorData;
  const competitorUrls: string[] =
    metrics[0]?.competitors.map((c: { url: string; value: string | number }) => c.url) || [];

  const cleanPrimaryDomain = primaryUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const totalDomains = 1 + competitorUrls.length;

  return (
    <div className="space-y-4">
      {/* Figma Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-2">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
            The competitive landscape
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Benchmark the details that move your business forward.
          </p>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-2 sm:mt-0">
          {totalDomains} DOMAINS / SAME SCAN CONDITIONS
        </div>
      </div>

      {/* Side-by-side Benchmark Table */}
      <div className="overflow-x-auto rounded-3xl border border-zinc-200/80 bg-white shadow-xs">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 bg-[#FAFAFA]">
              <th className="py-4 px-5 font-bold uppercase tracking-wider text-[10px] text-zinc-400 w-1/4">
                METRIC
              </th>
              <th className="py-4 px-5 font-bold text-zinc-900 bg-emerald-50/40 border-x border-emerald-100/60 w-1/4">
                <div className="text-sm font-extrabold text-[#0808C4]">{cleanPrimaryDomain}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  YOUR WEBSITE
                </div>
              </th>
              {competitorUrls.map((url: string, idx: number) => {
                const compDomain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
                return (
                  <th key={idx} className="py-4 px-5 font-bold text-zinc-800 w-1/4">
                    <div className="text-sm font-bold text-zinc-800">{compDomain}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      COMPETITOR 0{idx + 1}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 font-medium">
            {metrics.map((row: CompetitorComparisonMetric, idx: number) => {
              const isLead = row.verdict === 'LEAD';
              const isLag = row.verdict === 'LAG';

              return (
                <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                  <td className="py-4 px-5 text-zinc-700 font-semibold">
                    <div>{row.metric}</div>
                  </td>
                  <td className="py-4 px-5 font-bold text-zinc-900 bg-emerald-50/30 border-x border-emerald-100/40">
                    <span className="flex items-center gap-1.5">
                      {isLead && <span className="text-emerald-600 font-bold">↑</span>}
                      {isLag && <span className="text-rose-600 font-bold">↓</span>}
                      <span>{row.primaryValue}</span>
                    </span>
                  </td>
                  {row.competitors.map((comp: { url: string; value: string | number }, cIdx: number) => (
                    <td key={cIdx} className="py-4 px-5 text-zinc-600">
                      {comp.value}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
