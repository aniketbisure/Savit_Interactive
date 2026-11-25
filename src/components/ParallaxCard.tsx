'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';

export default function ParallaxCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - (left + width / 2)) / (width / 2);
    const y = (e.clientY - (top + height / 2)) / (height / 2);

    gsap.to(cardRef.current, {
      rotateY: x * 6,
      rotateX: -y * 6,
      transformPerspective: 1000,
      duration: 0.4,
      ease: 'power2.out',
    });

    if (floatRef.current) {
      gsap.to(floatRef.current, {
        x: x * 12,
        y: y * 12,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.7,
      ease: 'power2.out',
    });
    if (floatRef.current) {
      gsap.to(floatRef.current, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="p-8 sm:p-9 rounded-3xl bg-[#F6F6F6] border border-zinc-200/60 flex flex-col justify-between min-h-[340px] shadow-sm hover:shadow-md transition-shadow will-change-transform transform-gpu select-none"
    >
      <div>
        <div className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
          FROM SIGNAL TO STRATEGY.
        </div>
        <div className="text-sm font-semibold text-zinc-800 mt-1">
          A clearer view of what comes next.
        </div>
      </div>

      {/* Floating 3D Preview Card from Figma */}
      <div
        ref={floatRef}
        className="mt-6 bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xl shadow-zinc-900/5 rotate-[-2deg] transition-transform"
      >
        <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-100">
          <div className="font-bold text-zinc-900">stripe.com</div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#FC440C]">
            <span>AUDIT COMPLETE</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        <div className="py-4 flex items-center justify-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#0808C4]"
                strokeDasharray="88, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-black text-zinc-900 leading-none">88</span>
              <span className="text-[9px] font-bold text-zinc-400">/100</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-500 font-medium">
          <span>42 signals verified</span>
          <span className="font-bold text-zinc-700">SEO Score</span>
        </div>
      </div>
    </div>
  );
}
