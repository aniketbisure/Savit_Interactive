'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import AuditForm from '@/components/AuditForm';
import ParallaxCard from '@/components/ParallaxCard';
import LogoMarquee from '@/components/LogoMarquee';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { StoredAudit } from '@/lib/services/audit-service';
import gsap from 'gsap';

const FEATURED_COMMUNITY_AUDITS = [
  {
    category: 'FINTECH / PAYMENTS',
    domain: 'stripe.com',
    seoScore: 88,
    uxScore: 94,
    time: '32s',
  },
  {
    category: 'SAAS / PRODUCTIVITY',
    domain: 'linear.app',
    seoScore: 96,
    uxScore: 98,
    time: '28s',
  },
  {
    category: 'DEVELOPER TOOLS',
    domain: 'vercel.com',
    seoScore: 92,
    uxScore: 95,
    time: '30s',
  },
];

export default function Home() {
  const [recentAudits, setRecentAudits] = useState<StoredAudit[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/audits')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setRecentAudits(data.data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (heroRef.current) {
        tl.fromTo(
          heroRef.current.children,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }
        );
      }

      if (cardsRef.current) {
        tl.fromTo(
          cardsRef.current.children,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 },
          '-=0.3'
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 py-10 sm:py-14 bg-white text-zinc-900">
      {/* Figma Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div ref={heroRef} className="space-y-5 max-w-4xl mx-auto flex flex-col items-center">
          {/* Eyebrow Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-zinc-200/90 text-zinc-800 text-xs font-semibold shadow-xs">
            <span className="text-emerald-500 font-bold">✳</span>
            <span>AI-Powered Technical SEO & Competitor Benchmarking</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-950 leading-[1.08]">
            Engineering Data-Driven <br />
            Search Dominance
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-2xl font-normal">
            Turn 40+ technical signals into your next competitive advantage. <br className="hidden sm:inline" />
            One audit. Clear evidence. A prioritized path to growth.
          </p>
        </div>
      </div>

      {/* Figma 3-Card Showcase Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Card 1: 3D Floating Score Preview Card */}
          <ParallaxCard />

          {/* Card 2: 40+ Signals & Equalizer Meters */}
          <div className="p-8 sm:p-9 rounded-3xl bg-[#000000] text-white border border-zinc-900 flex flex-col justify-between min-h-[340px] shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                TECHNICAL PRECISION
              </div>
              <div className="text-5xl sm:text-6xl font-black text-white tracking-tight mt-4">
                40+
              </div>
              <div className="font-extrabold text-lg text-white mt-2">
                Signals. Zero guesswork.
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Verified checks, not AI assumptions.
              </p>
            </div>

            {/* Soundwave / Signal Equalizer Bars from Figma */}
            <div className="pt-6 flex items-end gap-1.5 h-16">
              {[4, 12, 8, 16, 24, 14, 28, 36, 20, 32, 40, 26, 44, 30, 20, 12, 6].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className={`w-1.5 rounded-full ${
                    i === 10 || i === 12 ? 'bg-[#FC440C]' : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Card 3: 800+ Audits Completed in Electric Blue */}
          <div className="p-8 sm:p-9 rounded-3xl bg-[#F6F6F6] border border-zinc-200/60 flex flex-col justify-between min-h-[340px] shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                BUILT FOR AMBITIOUS TEAMS
              </div>
              <div className="text-5xl sm:text-6xl font-black text-[#0808C4] tracking-tight mt-4">
                800+
              </div>
              <div className="font-extrabold text-lg text-zinc-900 mt-2">
                Audits completed
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Better decisions start with evidence.
              </p>
            </div>

            <div className="pt-6">
              <Link
                href="/history"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-800 hover:text-[#FC440C] transition-colors"
              >
                <span>View historical archive →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Launcher Form Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AuditForm />
      </div>

      {/* Infinite Client Logo Marquee */}
      <LogoMarquee />

      {/* Recent Community Audits Showcase (Figma Page 1 Bottom) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              A clearer picture. Every time.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium">
              Recent community audits
            </p>
          </div>
          <Link
            href="/history"
            className="mt-3 sm:mt-0 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-zinc-900 hover:text-[#FC440C] transition-colors"
          >
            <span>Explore all audits</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Grid Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(recentAudits.length > 0
            ? recentAudits
            : FEATURED_COMMUNITY_AUDITS
          ).map((item, idx) => {
            const anyItem = item as any;
            const domain = anyItem.domain || anyItem.primaryUrl?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'website.com';
            const category = anyItem.category || 'PRODUCTION AUDIT';
            const seo = anyItem.seoScore ?? 88;
            const ux = anyItem.uxScore ?? 94;
            const time = anyItem.time || '32s';
            const linkHref = anyItem.id ? `/audit/${anyItem.id}` : '/history';

            return (
              <Link
                key={idx}
                href={linkHref}
                className="group p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs hover:shadow-md hover:border-zinc-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    {category}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xl font-extrabold text-zinc-900 group-hover:text-[#FC440C] transition-colors">
                      {domain}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-[#FC440C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-100 mt-6 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 font-medium">
                      SEO <strong className="text-[#0808C4] font-bold">{seo}</strong>
                    </span>
                    <span className="text-zinc-500 font-medium">
                      UX <strong className="text-zinc-900 font-bold">{ux}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    Completed · {time}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Clean Global Footer */}
      <footer className="border-t border-zinc-100 pt-8 pb-12 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-zinc-700 font-medium">
            <span className="font-bold text-zinc-900">AuditAI</span>
            <span>·</span>
            <span>Technical SEO & Competitor Diagnostic Tool</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/history" className="hover:text-zinc-900 transition-colors">Audit History</Link>
            <Link href="/#audit-form" className="hover:text-zinc-900 transition-colors">Launch New Audit</Link>
            <span>© 2026 AuditAI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
