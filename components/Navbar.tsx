'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, FileText, CheckCircle2, LayoutDashboard, Compass, Key, ExternalLink } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [geminiActive, setGeminiActive] = useState<boolean | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setGeminiActive(Boolean(data.gemini_configured)))
      .catch(() => setGeminiActive(false));
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'New Analysis', href: '/analyze' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'My Progress', href: '/progress' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-slate-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

        {/* Brand Logo with Roblox-style chunky block */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-primary border-2 border-navy flex items-center justify-center text-white shadow-chunky-sm group-hover:rotate-6 transition-transform">
            <Sparkles className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-navy">Skill Bridge</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-peach border border-navy/20 text-navy">
                MVP
              </span>
            </div>
            <p className="text-xs text-navy-muted font-medium hidden sm:block">Truthful Career & ATS Readiness</p>
          </div>
        </Link>

        {/* Center Nav links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200">
          {navLinks.map(link => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive
                  ? 'bg-white text-navy shadow-sm border border-slate-200'
                  : 'text-navy-muted hover:text-navy hover:bg-white/50'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & AI status indicator */}
        <div className="flex items-center gap-3">
          {/* Key status badge */}
          {geminiActive === true ? (
            <button
              onClick={() => setShowKeyModal(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
              title="Click to view Gemini API status"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Gemini AI Connected</span>
            </button>
          ) : geminiActive === false ? (
            <button
              onClick={() => setShowKeyModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors"
              title="Click to view API configuration guide"
            >
              <Key className="w-3.5 h-3.5 text-amber-700" />
              <span>Heuristic Engine (No Key)</span>
            </button>
          ) : null}

          <Link
            href="/analyze"
            className="btn-primary text-sm px-4 py-2.5 rounded-xl flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Analyze Resume</span>
          </Link>
        </div>
      </div>

      {/* AI Key Info Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border-2 border-navy shadow-playful max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-navy/20 flex items-center justify-center text-amber-800 font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-lg text-navy">AI Engine Configuration</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-navy text-xl font-bold px-2 py-0.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600 mb-6">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-navy block mb-1">Current Active Mode:</span>
                {geminiActive ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Live Gemini Generative AI (Model 1.5 Flash)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-amber-800 font-semibold">
                    ⚡ Built-in Deterministic Heuristic Engine
                  </span>
                )}
              </div>

              <p>
                {geminiActive
                  ? 'Your Gemini API key is configured. Analyses and roadmaps use Google Gemini generative responses with strict JSON schema validation.'
                  : 'Skill Bridge is currently running in zero-setup mode using our deterministic parsing and matching engine. All features (ATS scoring, gap analysis, roadmaps, and resume studio) work immediately!'}
              </p>

              {!geminiActive && (
                <div className="p-3.5 rounded-2xl bg-primary-light/60 border border-primary/20 space-y-2">
                  <span className="font-bold text-navy block text-xs uppercase tracking-wider">
                    To activate live Gemini models:
                  </span>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-navy/90">
                    <li>Open your project&apos;s <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono font-bold">.env.local</code></li>
                    <li>Add: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono font-bold">GEMINI_API_KEY=your_key_here</code></li>
                    <li>Restart the development server.</li>
                  </ol>
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline pt-1"
                  >
                    <span>Get a free Gemini API key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowKeyModal(false)}
              className="w-full btn-secondary py-2.5 rounded-xl text-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

