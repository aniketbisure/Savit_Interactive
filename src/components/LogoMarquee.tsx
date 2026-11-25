'use client';

import React from 'react';

const BRANDS = ['stripe', 'Linear', 'Vercel', 'notion', 'Webflow', 'framer'];

export default function LogoMarquee() {
  return (
    <div className="py-12 bg-white overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
          BUILT FOR TEAMS THAT BUILD THE WEB
        </span>
      </div>
      <div className="relative flex overflow-x-hidden">
        <div className="flex animate-marquee whitespace-nowrap space-x-16 items-center mx-auto">
          {BRANDS.concat(BRANDS).concat(BRANDS).map((brand, i) => (
            <div
              key={i}
              className="text-zinc-400 hover:text-zinc-900 font-bold text-xl tracking-tight transition-colors"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
