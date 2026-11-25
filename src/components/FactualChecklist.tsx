import React, { useState } from 'react';
import { AuditCheckItem } from '@/lib/types/audit';
import { Check, X } from 'lucide-react';

interface FactualChecklistProps {
  seoChecks: AuditCheckItem[] | undefined | null;
  uxChecks: AuditCheckItem[] | undefined | null;
}

export default function FactualChecklist({ seoChecks, uxChecks }: FactualChecklistProps) {
  const [showAll, setShowAll] = useState(false);
  const allChecks = [...(seoChecks || []), ...(uxChecks || [])];

  const passedCount = allChecks.filter((c) => c.passed).length;
  const flaggedCount = allChecks.filter((c) => !c.passed).length;

  const displayChecks = showAll ? allChecks : allChecks.slice(0, 8);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-zinc-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            DETERMINISTIC CHECKS
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            {passedCount} PASSED / {flaggedCount} FLAGGED
          </div>
        </div>

        {/* 2-Column Checks Grid from Figma */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 py-6">
          {displayChecks.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-zinc-800">
              {item.passed ? (
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
              <span className="truncate">{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
        <span>Showing {displayChecks.length} of {allChecks.length} checks</span>
        <button
          onClick={() => setShowAll(!showAll)}
          className="font-bold text-zinc-800 hover:text-[#FC440C] transition-colors"
        >
          {showAll ? 'Collapse checks' : 'View all checks ↗'}
        </button>
      </div>
    </div>
  );
}
