'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface RawDataViewerProps {
  data: any;
  title?: string;
}

export default function RawDataViewer({ data }: RawDataViewerProps) {
  const [copied, setCopied] = useState(false);

  // Format concise preview snippet for the Figma card
  const formattedJson = JSON.stringify(data, null, 2);
  const lines = formattedJson.split('\n').slice(0, 15);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl bg-[#000000] text-zinc-100 p-6 sm:p-7 border border-zinc-800 shadow-xs flex flex-col justify-between h-full font-mono text-xs">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-400 font-bold text-[11px] uppercase tracking-wider">
            <span className="text-zinc-600 font-bold">&#123; &#125;</span>
            <span>RAW EXTRACTED JSON</span>
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-zinc-800"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy ⧉'}</span>
          </button>
        </div>

        {/* Code Block with Line Numbers */}
        <div className="py-4 overflow-x-auto max-h-[260px] text-zinc-400 space-y-1">
          {lines.map((line, idx) => (
            <div key={idx} className="flex">
              <span className="w-8 text-zinc-600 select-none text-right pr-4 font-mono">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="text-zinc-300 whitespace-pre">{line}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
