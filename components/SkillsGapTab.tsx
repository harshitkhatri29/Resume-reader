'use client';

import React, { useState } from 'react';
import { RequirementMatch, SkillStatus } from '@/lib/types';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Filter, ArrowRight, Quote } from 'lucide-react';

interface SkillsGapTabProps {
  matches: RequirementMatch[];
  onNavigateToRoadmap?: () => void;
}

export default function SkillsGapTab({ matches, onNavigateToRoadmap }: SkillsGapTabProps) {
  const [filter, setFilter] = useState<'all' | SkillStatus>('all');

  const filteredMatches = matches.filter(m => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const getStatusBadge = (status: SkillStatus) => {
    switch (status) {
      case 'evidenced':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Evidenced
          </span>
        );
      case 'partially_evidenced':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" /> Partially Evidenced
          </span>
        );
      case 'not_evidenced':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-coral-light text-coral-dark text-xs font-extrabold border border-coral/30">
            <XCircle className="w-3.5 h-3.5" /> Missing / Not Evidenced
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold border border-slate-300">
            <HelpCircle className="w-3.5 h-3.5" /> Unclear
          </span>
        );
    }
  };

  const counts = {
    all: matches.length,
    evidenced: matches.filter(m => m.status === 'evidenced').length,
    partially_evidenced: matches.filter(m => m.status === 'partially_evidenced').length,
    not_evidenced: matches.filter(m => m.status === 'not_evidenced').length,
  };

  return (
    <div className="space-y-6">
      
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border-2 border-slate-900/10 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-navy-muted flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter by:
          </span>

          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-navy text-white shadow-chunky-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Requirements ({counts.all})
          </button>

          <button
            onClick={() => setFilter('evidenced')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'evidenced'
                ? 'bg-emerald-600 text-white shadow-chunky-sm'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Evidenced ({counts.evidenced})
          </button>

          <button
            onClick={() => setFilter('partially_evidenced')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'partially_evidenced'
                ? 'bg-amber-600 text-white shadow-chunky-sm'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Partial ({counts.partially_evidenced})
          </button>

          <button
            onClick={() => setFilter('not_evidenced')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'not_evidenced'
                ? 'bg-coral-dark text-white shadow-chunky-sm'
                : 'bg-coral-light text-coral-dark hover:bg-red-100 border border-coral/30'
            }`}
          >
            Missing ({counts.not_evidenced})
          </button>
        </div>

        {onNavigateToRoadmap && counts.not_evidenced > 0 && (
          <button
            onClick={onNavigateToRoadmap}
            className="btn-secondary text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5"
          >
            <span>Convert Gaps to Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Requirement Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMatches.length === 0 ? (
          <div className="card-playful p-10 text-center space-y-2">
            <p className="font-extrabold text-navy">No requirements match this filter.</p>
            <p className="text-xs text-navy-muted">Switch filters above to view other skill findings.</p>
          </div>
        ) : (
          filteredMatches.map(match => (
            <div
              key={match.id}
              className="card-playful p-5 sm:p-6 space-y-4 border-2 border-slate-900/10 hover:border-slate-900/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-extrabold text-base text-navy">{match.requirement}</h3>
                  <span className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    match.type === 'required' ? 'bg-primary-light text-primary border border-primary/20' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {match.type}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    match.priority === 'high' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {match.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <div>{getStatusBadge(match.status)}</div>
              </div>

              {/* Side-by-side citations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* JD Quote */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-navy-muted flex items-center gap-1">
                    <Quote className="w-3 h-3 text-primary" /> Target JD Requirement Citation:
                  </span>
                  <p className="italic text-slate-700 leading-relaxed">&ldquo;{match.jd_citation}&rdquo;</p>
                </div>

                {/* Resume Quote */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-navy-muted flex items-center gap-1">
                    <Quote className="w-3 h-3 text-emerald-600" /> Resume Evidence Citation:
                  </span>
                  <p className={`italic leading-relaxed ${
                    match.status === 'not_evidenced' ? 'text-coral-dark font-medium' : 'text-slate-700'
                  }`}>
                    &ldquo;{match.resume_evidence}&rdquo;
                  </p>
                </div>
              </div>

              {/* Explanation & Actionable Guidance */}
              <div className="pt-1 space-y-2 text-xs">
                <p className="text-slate-600">
                  <span className="font-bold text-navy">Analysis:</span> {match.explanation}
                </p>
                <div className="p-3 rounded-xl bg-mint-light/60 border border-mint/30 flex items-start gap-2">
                  <span className="font-bold text-mint-dark shrink-0">Actionable Advice:</span>
                  <span className="text-navy">{match.actionable_guidance}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

