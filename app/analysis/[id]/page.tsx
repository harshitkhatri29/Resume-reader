'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Analysis, Roadmap, ResumeRevision } from '@/lib/types';
import SkillsGapTab from '@/components/SkillsGapTab';
import ATSCheckerTab from '@/components/ATSCheckerTab';
import LearningRoadmapTab from '@/components/LearningRoadmapTab';
import ResumeStudioTab from '@/components/ResumeStudioTab';
import ExtractionReviewModal from '@/components/ExtractionReviewModal';
import {
  Sparkles,
  ArrowLeft,
  FileCheck2,
  Compass,
  FileText,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Target,
  ShieldCheck,
  Blocks
} from 'lucide-react';

export default function AnalysisDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [revision, setRevision] = useState<ResumeRevision | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gaps' | 'ats' | 'roadmap' | 'studio'>('gaps');
  const [showExtractionModal, setShowExtractionModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/analyses/${params.id}`)
      .then(async res => {
        if (!res.ok) {
          throw new Error('Analysis not found');
        }
        return res.json();
      })
      .then(data => {
        setAnalysis(data.analysis);
        setRoadmap(data.roadmap);
        setRevision(data.revision);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Failed to load analysis');
        setLoading(false);
      });
  }, [params.id]);

  const handleSaveCorrections = async (correctedResume: any, correctedJD: any) => {
    const res = await fetch(`/api/analyses/${params.id}/extraction`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parsed_resume: correctedResume,
        parsed_jd: correctedJD
      })
    });

    if (res.ok) {
      const data = await res.json();
      setAnalysis(data.analysis);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this analysis and stored resume?')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/analyses/${params.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="font-extrabold text-navy text-sm">Loading readiness assessment...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-xl mx-auto my-16 card-playful p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-extrabold text-navy">Analysis Not Found</h2>
        <p className="text-xs text-navy-muted">
          The requested readiness report does not exist or has been deleted.
        </p>
        <Link href="/analyze" className="btn-primary text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-2">
          <span>Start New Analysis</span>
        </Link>
      </div>
    );
  }

  const missingGapsCount = analysis.requirement_matches.filter(m => m.status === 'not_evidenced').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Back and Utility Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-muted hover:text-navy group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExtractionModal(true)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-navy hover:bg-slate-50 flex items-center gap-1.5"
            title="Inspect & edit extracted fields"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Review Extraction</span>
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1.5 disabled:opacity-50"
            title="Permanently delete this analysis and document per retention controls"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{deleting ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>

      {/* Role Banner & Overall Readiness */}
      <section className="card-playful p-6 sm:p-8 bg-white space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b-2 border-slate-100">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-peach/50 border border-navy/20 text-navy font-bold text-xs uppercase tracking-wider">
                {analysis.target_company || 'Target Organization'}
              </span>

              {analysis.is_ai_powered ? (
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Gemini Generative AI
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 font-bold text-xs flex items-center gap-1">
                  ⚡ Heuristic Analysis Engine
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-navy">
              {analysis.role_title}
            </h1>

            <p className="text-xs text-navy-muted font-medium">
              Candidate: <strong className="text-navy">{analysis.parsed_resume.contact.name}</strong> • Analyzed on {new Date(analysis.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Big Readiness Score Block */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border-2 border-slate-900/10">
            <div className="w-16 h-16 rounded-2xl bg-primary text-white border-2 border-navy flex flex-col items-center justify-center shadow-chunky-sm">
              <span className="text-2xl font-extrabold leading-none">{analysis.readiness.overall_score}%</span>
              <span className="text-[9px] uppercase font-bold tracking-tighter opacity-90 mt-0.5">Ready</span>
            </div>
            <div>
              <span className="text-xs font-bold text-navy-muted uppercase tracking-wider block">
                Overall Role Alignment
              </span>
              <span className="text-xs font-semibold text-slate-700 max-w-[200px] block leading-tight mt-0.5">
                {analysis.readiness.summary.slice(0, 75)}...
              </span>
            </div>
          </div>

        </div>

        {/* 4 Dimension Readiness Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-navy-muted uppercase tracking-wider block">
              Core Skills
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-navy">
                {analysis.readiness.dimensions.core_skills}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${analysis.readiness.dimensions.core_skills}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-navy-muted uppercase tracking-wider block">
              Experience Relevance
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-navy">
                {analysis.readiness.dimensions.experience_relevance}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-mint-dark h-full rounded-full"
                style={{ width: `${analysis.readiness.dimensions.experience_relevance}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-navy-muted uppercase tracking-wider block">
              Education &amp; Background
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-navy">
                {analysis.readiness.dimensions.education_credentials}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-peach-dark h-full rounded-full"
                style={{ width: `${analysis.readiness.dimensions.education_credentials}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-navy-muted uppercase tracking-wider block">
              ATS Formatting
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-navy">
                {analysis.readiness.dimensions.ats_readability}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-600 h-full rounded-full"
                style={{ width: `${analysis.readiness.dimensions.ats_readability}%` }}
              />
            </div>
          </div>

        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border-2 border-slate-900/10 shadow-sm">
        
        <button
          onClick={() => setActiveTab('gaps')}
          className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'gaps'
              ? 'bg-primary text-white border-2 border-navy shadow-chunky-sm'
              : 'text-navy-muted hover:text-navy hover:bg-slate-50'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Skills Gap Analyzer</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'gaps' ? 'bg-white text-navy' : 'bg-slate-100 text-slate-700'
          }`}>
            {analysis.requirement_matches.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ats')}
          className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'ats'
              ? 'bg-primary text-white border-2 border-navy shadow-chunky-sm'
              : 'text-navy-muted hover:text-navy hover:bg-slate-50'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>ATS Diagnostics</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'ats' ? 'bg-white text-navy' : 'bg-slate-100 text-slate-700'
          }`}>
            {analysis.ats_diagnostics.overall_ats_score}%
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'roadmap'
              ? 'bg-primary text-white border-2 border-navy shadow-chunky-sm'
              : 'text-navy-muted hover:text-navy hover:bg-slate-50'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Learning Roadmap</span>
          {missingGapsCount > 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'roadmap' ? 'bg-mint text-navy' : 'bg-peach text-navy'
            }`}>
              {missingGapsCount} Gaps
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
            activeTab === 'studio'
              ? 'bg-primary text-white border-2 border-navy shadow-chunky-sm'
              : 'text-navy-muted hover:text-navy hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Resume Studio</span>
          {revision && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'studio' ? 'bg-white text-navy' : 'bg-slate-100 text-slate-700'
            }`}>
              {revision.suggestions.length} Edits
            </span>
          )}
        </button>

      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'gaps' && (
          <SkillsGapTab
            matches={analysis.requirement_matches}
            onNavigateToRoadmap={() => setActiveTab('roadmap')}
          />
        )}

        {activeTab === 'ats' && (
          <ATSCheckerTab diagnostics={analysis.ats_diagnostics} />
        )}

        {activeTab === 'roadmap' && roadmap && (
          <LearningRoadmapTab
            roadmap={roadmap}
            onRoadmapUpdate={(updated) => setRoadmap(updated)}
          />
        )}

        {activeTab === 'studio' && revision && (
          <ResumeStudioTab
            revision={revision}
            analysisId={analysis.id}
            onRevisionUpdate={(updated) => setRevision(updated)}
          />
        )}
      </div>

      {/* Extraction Review / Edit Modal */}
      <ExtractionReviewModal
        isOpen={showExtractionModal}
        onClose={() => setShowExtractionModal(false)}
        parsedResume={analysis.parsed_resume}
        parsedJD={analysis.parsed_jd}
        onSaveCorrections={handleSaveCorrections}
      />

    </div>
  );
}

