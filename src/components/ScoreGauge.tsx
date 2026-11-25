'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface ScoreGaugeProps {
  score: number | null | undefined;
  label: string;
  sublabel?: string;
  colorVariant?: 'blue' | 'orange';
}

export default function ScoreGauge({
  score,
  label,
  sublabel,
  colorVariant = 'blue',
}: ScoreGaugeProps) {
  const numericScore = typeof score === 'number' ? Math.round(score) : 0;
  const [displayValue, setDisplayValue] = useState(0);
  const circleRef = useRef<SVGCircleElement>(null);

  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ~263.89

  useEffect(() => {
    const targetObj = { val: 0 };
    const numTween = gsap.to(targetObj, {
      val: numericScore,
      duration: 1.6,
      ease: 'power3.out',
      onUpdate: () => {
        setDisplayValue(Math.round(targetObj.val));
      },
    });

    if (circleRef.current) {
      const targetOffset = circumference - (numericScore / 100) * circumference;
      gsap.fromTo(
        circleRef.current,
        { strokeDashoffset: circumference },
        { strokeDashoffset: targetOffset, duration: 1.6, ease: 'power3.out' }
      );
    }

    return () => {
      numTween.kill();
    };
  }, [numericScore, circumference]);

  const strokeColor = colorVariant === 'orange' ? '#FC440C' : '#0808C4';

  return (
    <div className="flex flex-col items-center justify-center p-3 text-center">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#F0F0F0"
            strokeWidth="7"
            fill="transparent"
          />
          <circle
            ref={circleRef}
            cx="50"
            cy="50"
            r={radius}
            stroke={strokeColor}
            strokeWidth="7"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-zinc-900 tracking-tight leading-none">
            {displayValue}
          </span>
          <span className="text-[11px] font-bold text-zinc-400 mt-0.5">/ 100</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="font-bold text-sm text-zinc-900">{label}</div>
        {sublabel && <div className="text-[11px] text-zinc-400 font-medium">{sublabel}</div>}
      </div>
    </div>
  );
}
