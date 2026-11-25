'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#000000] border-b border-zinc-900 text-white print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#FC440C] flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
            a
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            AuditAI
          </span>
        </Link>

        {/* Clean, Useful Navigation Menu */}
        <nav className="flex items-center space-x-8 text-sm font-medium">
          <Link
            href="/"
            className={`transition-colors ${
              pathname === '/' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Audits
          </Link>
          <Link
            href="/history"
            className={`transition-colors ${
              pathname === '/history' ? 'text-white font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            History
          </Link>
        </nav>

        {/* Right Section: System Status & Launch Audit Button */}
        <div className="flex items-center space-x-5">
          <div className="hidden sm:flex items-center text-xs text-zinc-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            System operational
          </div>

          <Link
            href="/#audit-form"
            className="bg-[#FC440C] hover:bg-[#e03b08] text-white text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full flex items-center gap-1 transition-all shadow-md shadow-orange-950/20 active:scale-95"
          >
            <span>Launch Audit</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
