import React, { useState } from 'react';
import { PrioritizedIssue, Severity } from '@/lib/types/audit';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

interface IssuesListProps {
  issues: PrioritizedIssue[] | undefined | null;
}

export default function IssuesList({ issues }: IssuesListProps) {
  const [filter, setFilter] = useState<'ALL' | Severity>('ALL');
  const [expandedIndices, setExpandedIndices] = useState<number[]>([0, 1, 2]);
  const [showAll, setShowAll] = useState(false);

  if (!issues || issues.length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200/80 flex items-center space-x-3 text-emerald-800">
        <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
        <span className="text-sm font-semibold">
          No critical issues detected! All deterministic SEO and UX checks passed successfully.
        </span>
      </div>
    );
  }

  const filteredIssues = issues.filter((issue) => {
    if (filter === 'ALL') return true;
    return issue.severity === filter;
  });

  const highCount = issues.filter((i) => i.severity === 'HIGH').length;
  const medCount = issues.filter((i) => i.severity === 'MEDIUM').length;
  const lowCount = issues.filter((i) => i.severity === 'LOW').length;

  const displayList = showAll ? filteredIssues : filteredIssues.slice(0, 3);

  const toggleExpand = (idx: number) => {
    setExpandedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="space-y-6">
      {/* Figma Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-2">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
            From insight to impact
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            A clear action plan, ordered by what matters most.
          </p>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-2 sm:mt-0">
          {issues.length} OPEN ISSUES · {displayList.length} SHOWN
        </div>
      </div>

      {/* Priority Filter Tabs from Figma */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`text-xs px-4 py-2 rounded-full font-bold transition-all ${
            filter === 'ALL'
              ? 'bg-[#FC440C] text-white shadow-sm'
              : 'bg-[#F6F6F6] text-zinc-600 hover:text-zinc-900'
          }`}
        >
          All Issues {issues.length}
        </button>
        <button
          onClick={() => setFilter('HIGH')}
          className={`text-xs px-4 py-2 rounded-full font-bold transition-all ${
            filter === 'HIGH'
              ? 'bg-[#FC440C] text-white shadow-sm'
              : 'bg-[#F6F6F6] text-zinc-600 hover:text-zinc-900'
          }`}
        >
          High Priority {highCount}
        </button>
        <button
          onClick={() => setFilter('MEDIUM')}
          className={`text-xs px-4 py-2 rounded-full font-bold transition-all ${
            filter === 'MEDIUM'
              ? 'bg-[#FC440C] text-white shadow-sm'
              : 'bg-[#F6F6F6] text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Medium Priority {medCount}
        </button>
        <button
          onClick={() => setFilter('LOW')}
          className={`text-xs px-4 py-2 rounded-full font-bold transition-all ${
            filter === 'LOW'
              ? 'bg-[#FC440C] text-white shadow-sm'
              : 'bg-[#F6F6F6] text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Low Priority {lowCount}
        </button>
      </div>

      {/* Issues Accordion Cards */}
      <div className="space-y-4">
        {displayList.map((issue, idx) => {
          const isExpanded = expandedIndices.includes(idx);

          let badgeBg = 'bg-blue-100/70 text-blue-800';
          let badgeText = 'LOW PRIORITY';

          if (issue.severity === 'HIGH') {
            badgeBg = 'bg-rose-100 text-rose-800';
            badgeText = 'HIGH PRIORITY';
          } else if (issue.severity === 'MEDIUM') {
            badgeBg = 'bg-amber-100 text-amber-900';
            badgeText = 'MEDIUM PRIORITY';
          }

          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-zinc-200/80 overflow-hidden shadow-xs hover:border-zinc-300 transition-all"
            >
              {/* Card Header */}
              <button
                onClick={() => toggleExpand(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${badgeBg}`}
                  >
                    {badgeText}
                  </span>
                  <span className="font-extrabold text-base sm:text-lg text-zinc-900">
                    {issue.title}
                  </span>
                </div>
                <div className="text-zinc-400">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              {/* 2-Column Interior strictly separating Evidence from AI Recommendations */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAFAFA]">
                  {/* Left Column: VERIFIED EVIDENCE */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      VERIFIED EVIDENCE
                    </div>
                    <div className="text-sm font-bold text-zinc-900 leading-snug">
                      {issue.evidence}
                    </div>
                    <div className="text-xs text-zinc-500 font-mono">
                      Category: {issue.category} · Impact: {issue.impact}
                    </div>
                  </div>

                  {/* Right Column: AI STRATEGIC RECOMMENDATION */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#0808C4]">
                      AI STRATEGIC RECOMMENDATION
                    </div>
                    <div className="text-sm font-normal text-zinc-800 leading-relaxed">
                      {issue.recommendation}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show all issues toggle */}
      {filteredIssues.length > 3 && (
        <div className="text-center pt-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-bold text-zinc-600 hover:text-zinc-900 py-2 px-5 rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >
            {showAll ? 'Show fewer issues ↑' : `Show all ${filteredIssues.length} issues ↓`}
          </button>
        </div>
      )}
    </div>
  );
}
