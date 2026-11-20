import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t-2 border-slate-900/10 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary border-2 border-navy flex items-center justify-center text-white shadow-chunky-sm">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-navy">Resume Ready</span>
              <p className="text-xs text-navy-muted">Explainable career readiness & grounded roadmaps</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-navy-muted">
            <Link href="/" className="hover:text-navy transition-colors">Home</Link>
            <Link href="/analyze" className="hover:text-navy transition-colors">New Analysis</Link>
            <Link href="/dashboard" className="hover:text-navy transition-colors">Saved Analyses</Link>
            <Link href="/progress" className="hover:text-navy transition-colors">Milestone Tracker</Link>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-navy-muted gap-4">
          <p className="flex items-center gap-1.5">
            Built strictly adhering to the Product Requirements Document (PRD).
          </p>
          <p className="font-medium">
            Privacy-first • Truthful AI assistance • No fabricated credentials
          </p>
        </div>
      </div>
    </footer>
  );
}

