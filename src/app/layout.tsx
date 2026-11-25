import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';
import Navbar from '@/components/Navbar';
import SmoothScroll from '@/components/SmoothScroll';

export const metadata: Metadata = {
  title: 'AuditAI — Technical SEO & Competitor Diagnostic Tool',
  description:
    'Diagnostic website audit tool performing empirical SEO checks, UX conversion signals, competitor benchmarking, and AI strategic recommendations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-zinc-950 font-sans selection:bg-[#FC440C] selection:text-white">
        <SmoothScroll>
          <Suspense fallback={<header className="h-18 bg-[#000000]" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
