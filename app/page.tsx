import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  FileCheck2,
  Compass,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Blocks,
  FileSearch,
  BookOpen,
  Award,
  Zap,
  Target
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-24 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* Hero Section */}
      <section className="relative text-center pt-8 sm:pt-14 pb-8 space-y-8 max-w-4xl mx-auto">
        {/* Playful Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-peach/40 border-2 border-navy text-navy font-extrabold text-xs tracking-wide shadow-chunky-sm uppercase">
          <Blocks className="w-4 h-4 text-peach-dark" />
          <span>Grounded Job Preparation • Zero Hallucinations</span>
        </div>

        {/* Big Bold Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-navy leading-[1.1]">
          Stop guessing.<br />
          <span className="relative inline-block text-primary">
            Match your skills
            <span className="absolute left-0 bottom-1.5 w-full h-3 bg-mint -z-10 rounded-sm -rotate-1"></span>
          </span>{' '}
          to the job.
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-navy-muted max-w-2xl mx-auto leading-relaxed font-medium">
          Skill Bridge turns your resume and target job description into an explainable readiness assessment,
          prioritized learning roadmap, and truthful ATS optimization.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/analyze"
            className="w-full sm:w-auto btn-primary text-base px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-chunky hover:shadow-chunky-lg"
          >
            <Sparkles className="w-5 h-5 fill-white" />
            <span>Analyze My Resume</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/analysis/demo-analysis-1"
            className="w-full sm:w-auto btn-secondary text-base px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-chunky hover:shadow-chunky-lg"
          >
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Try Interactive Demo</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-navy-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> No Fabricated Credentials
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" /> Single Canonical Analysis
          </span>
          <span className="flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-peach-dark" /> PDF &amp; DOCX Supported
          </span>
        </div>
      </section>

      {/* Interactive Flow Preview Card */}
      <section className="relative">
        <div className="card-playful p-6 sm:p-10 bg-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b-2 border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase font-extrabold text-primary tracking-wider mb-1">
                <Target className="w-4 h-4" />
                <span>Live Blueprint Preview</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy">
                From Raw Documents to Measurable Progress
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="btn-secondary text-xs px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5"
            >
              <span>View Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-900/10 space-y-3 relative group hover:border-primary transition-colors">
              <div className="w-10 h-10 rounded-xl bg-primary-light border border-primary/20 text-primary flex items-center justify-center font-extrabold text-base">
                1
              </div>
              <h3 className="font-extrabold text-lg text-navy">Extract &amp; Verify</h3>
              <p className="text-sm text-navy-muted">
                Upload your resume (PDF/DOCX) and paste any target JD. Inspect and correct parsing errors before running analysis.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-900/10 space-y-3 relative group hover:border-mint-dark transition-colors">
              <div className="w-10 h-10 rounded-xl bg-mint-light border border-mint/40 text-mint-dark flex items-center justify-center font-extrabold text-base">
                2
              </div>
              <h3 className="font-extrabold text-lg text-navy">Analyze Gaps</h3>
              <p className="text-sm text-navy-muted">
                Categorizes every job requirement: evidenced, partial, or missing, citing text quotes so you know exactly why.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-900/10 space-y-3 relative group hover:border-peach-dark transition-colors">
              <div className="w-10 h-10 rounded-xl bg-peach-light border border-peach/40 text-peach-dark flex items-center justify-center font-extrabold text-base">
                3
              </div>
              <h3 className="font-extrabold text-lg text-navy">Follow Roadmap</h3>
              <p className="text-sm text-navy-muted">
                Transform missing skills into prioritized weekly milestones with concrete exercises, resources, and portfolio targets.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-900/10 space-y-3 relative group hover:border-coral transition-colors">
              <div className="w-10 h-10 rounded-xl bg-coral-light border border-coral/30 text-coral-dark flex items-center justify-center font-extrabold text-base">
                4
              </div>
              <h3 className="font-extrabold text-lg text-navy">Truthful Edits</h3>
              <p className="text-sm text-navy-muted">
                Optimize bullet points using the XYZ impact formula and export an ATS-compliant resume without false claims.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy">
            Everything You Need to Get Job-Ready
          </h2>
          <p className="text-navy-muted font-medium">
            Designed to bridge the gap between where your resume stands today and where the target job demands it to be.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="card-playful p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white border-2 border-navy flex items-center justify-center shadow-chunky-sm">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-navy">Grounded Gap Analyzer</h3>
            <p className="text-sm text-navy-muted leading-relaxed">
              No black-box percentages. We cite exact phrases from the job description and your resume so you understand why a skill was marked missing or evidenced.
            </p>
            <ul className="space-y-2 pt-2 text-xs font-bold text-navy">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Distinguishes &quot;not evidenced&quot; from &quot;unqualified&quot;
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Normalizes skill aliases (JS, ES6, JavaScript)
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="card-playful p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-mint text-navy border-2 border-navy flex items-center justify-center shadow-chunky-sm">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-navy">Actionable Roadmaps</h3>
            <p className="text-sm text-navy-muted leading-relaxed">
              Set your available study hours per week. Get structured milestones broken into conceptual learning, portfolio deliverables, and resume updates.
            </p>
            <ul className="space-y-2 pt-2 text-xs font-bold text-navy">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tailored to your weekly schedule
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Interactive checklist with evidence links
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="card-playful p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-peach text-navy border-2 border-navy flex items-center justify-center shadow-chunky-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-navy">Truthful Resume Studio</h3>
            <p className="text-sm text-navy-muted leading-relaxed">
              Refactor bullet points using proven engineering achievement standards. Accept, reject, or edit suggestions with zero fabricated titles or metrics.
            </p>
            <ul className="space-y-2 pt-2 text-xs font-bold text-navy">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> XYZ formula: Accomplished [X] by doing [Z]
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> One-click Markdown / Text export
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="rounded-3xl bg-navy text-white p-8 sm:p-14 border-2 border-navy shadow-chunky flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="space-y-3 max-w-xl text-center sm:text-left">
          <div className="inline-block px-3 py-1 rounded-full bg-mint text-navy font-extrabold text-xs">
            Start in 2 minutes
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to test your readiness for your dream role?
          </h2>
          <p className="text-slate-300 text-sm">
            Upload your resume and paste a job posting to generate your first analysis and roadmap now.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/analyze"
            className="btn-mint text-base px-8 py-4 rounded-2xl flex items-center justify-center gap-2"
          >
            <span>Start Free Analysis</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/analysis/demo-analysis-1"
            className="btn-secondary text-base px-6 py-4 rounded-2xl flex items-center justify-center gap-2"
          >
            <span>View Demo</span>
          </Link>
        </div>
      </section>

    </div>
  );
}

