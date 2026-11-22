'use client';

import React from 'react';
import { ATSDiagnostics } from '@/lib/types';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Lightbulb,
  ShieldAlert,
  Info
} from 'lucide-react';

interface ATSCheckerTabProps {
  diagnostics: ATSDiagnostics;
}

export default function ATSCheckerTab({ diagnostics }: ATSCheckerTabProps) {
  const getSeverityBadge = (severity: 'critical' | 'moderate' | 'tip') => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-md bg-coral-light text-coral-dark text-[11px] font-extrabold uppercase border border-coral/30">
            Critical Fix
          </span>
        );
      case 'moderate':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-extrabold uppercase border border-amber-300">
            Moderate
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-primary-light text-primary text-[11px] font-extrabold uppercase border border-primary/20">
            Pro Tip
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

        {/* ATS Match Score */}
        <div className="card-playful p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-muted uppercase tracking-wider">
              ATS Compatibility Index
            </span>
            <FileCheck2 className="w-5 h-5 text-primary" />
          </div>
          <div className="my-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-navy">
              {diagnostics.overall_ats_score}%
            </span>
            <span className="text-xs font-bold text-emerald-700">Good ATS Readability</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${diagnostics.overall_ats_score}%` }}
            />
          </div>
        </div>

        {/* Readability Score */}
        <div className="card-playful p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-muted uppercase tracking-wider">
              Text Readability Index
            </span>
            <FileText className="w-5 h-5 text-mint-dark" />
          </div>
          <div className="my-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-navy">
              {diagnostics.readability_score}
            </span>
            <span className="text-xs font-bold text-slate-500">/ 100 clarity</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-mint-dark h-full rounded-full transition-all duration-500"
              style={{ width: `${diagnostics.readability_score}%` }}
            />
          </div>
        </div>

        {/* File Format Health */}
        <div className="card-playful p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-muted uppercase tracking-wider">
              Document Format Health
            </span>
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="my-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
              <CheckCircle2 className="w-4 h-4" /> Standard Structure
            </span>
            <p className="text-xs text-slate-600 mt-2 font-medium">
              {diagnostics.file_format_health.message}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold">Standard single-column layout</p>
        </div>

      </div>

      {/* Standard Sections Detection */}
      <div className="card-playful p-6 space-y-4">
        <h3 className="text-base font-extrabold text-navy flex items-center gap-2">
          <span>Standard ATS Section Scans</span>
        </h3>
        <p className="text-xs text-navy-muted">
          ATS parsers look for recognized headings to index your career history accurately.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
          {Object.entries(diagnostics.sections_detected).map(([sec, detected]) => (
            <div
              key={sec}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1 ${detected
                ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                : 'bg-red-50/60 border-red-300 text-red-900'
                }`}
            >
              {detected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-xs font-extrabold capitalize">{sec}</span>
              <span className="text-[10px] font-bold text-slate-500">
                {detected ? 'Detected' : 'Missing'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Keyword Presence & Critical Missing Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Matched Keywords */}
        <div className="card-playful p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-navy flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Matched Target Keywords ({diagnostics.keyword_insights.matched_keywords.length})</span>
            </h3>
          </div>
          <p className="text-xs text-navy-muted">
            These terms are present in your resume and align with the target job posting.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {diagnostics.keyword_insights.matched_keywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="card-playful p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-navy flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Missing Critical Keywords ({diagnostics.keyword_insights.missing_critical_keywords.length})</span>
            </h3>
          </div>
          <p className="text-xs text-navy-muted">
            Frequently cited in the JD. Incorporate these into your roadmap deliverables truthfully.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {diagnostics.keyword_insights.missing_critical_keywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-coral-light border border-coral/30 text-coral-dark text-xs font-bold"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Formatting & Content Fixes List */}
      <div className="card-playful p-6 space-y-4">
        <h3 className="text-base font-extrabold text-navy flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <span>Actionable ATS Improvements</span>
        </h3>

        <div className="space-y-3 pt-1">
          {diagnostics.formatting_issues.map((issue) => (
            <div
              key={issue.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-navy text-sm">{issue.issue}</span>
                {getSeverityBadge(issue.severity)}
              </div>
              <p className="text-slate-600">
                <strong className="text-navy">Recommended Solution:</strong> {issue.fix}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* PRD Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <strong>Explainability Notice:</strong> We do not claim an absolute &quot;ATS Guarantee&quot; score. Modern ATS systems differ across companies (Workday, Greenhouse, Lever). Our checks focus on parsing hygiene, clear section hierarchies, and keyword relevance.
        </p>
      </div>

    </div>
  );
}

