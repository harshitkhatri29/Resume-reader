'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Analysis, DashboardSummary, Roadmap } from '@/lib/types';
import {
  LayoutDashboard,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Compass,
  FileCheck2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Plus,
  Loader2,
  Zap,
  Target
} from 'lucide-react';
import { getAllLocalAnalyses, deleteLocalAnalysis } from '@/lib/clientStorage';

export default function DashboardPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [analysesRes, summaryRes] = await Promise.all([
        fetch('/api/analyses').catch(() => null),
        fetch('/api/dashboard').catch(() => null)
      ]);

      let serverAnalyses: Analysis[] = [];
      if (analysesRes && analysesRes.ok) {
        serverAnalyses = await analysesRes.json();
      }

      const localList = getAllLocalAnalyses();
      const map = new Map<string, Analysis>();
      serverAnalyses.forEach(a => map.set(a.id, a));
      localList.forEach(a => map.set(a.id, a));

      const combined = Array.from(map.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setAnalyses(combined);

      if (summaryRes && summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setAnalyses(getAllLocalAnalyses());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteAnalysis = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Delete this saved analysis and its stored resume?')) {
      return;
    }

    deleteLocalAnalysis(id);
    try {
      await fetch(`/api/analyses/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete analysis on server:', err);
    }
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="font-extrabold text-navy text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Candidate Command Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy">
            Readiness &amp; Learning Dashboard
          </h1>
          <p className="text-xs text-navy-muted mt-1">
            Track your target roles, roadmap milestone completions, and truthful resume revisions.
          </p>
        </div>

        <Link
          href="/analyze"
          className="btn-primary text-sm px-5 py-3 rounded-xl flex items-center gap-2 shadow-chunky hover:shadow-chunky-lg"
        >
          <Plus className="w-4 h-4" />
          <span>New Role Analysis</span>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1 */}
        <div className="card-playful p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-muted uppercase tracking-wider">
              Target Roles Analyzed
            </span>
            <Target className="w-5 h-5 text-primary" />
          </div>
          <p className="text-4xl font-extrabold text-navy">
            {summary?.total_analyses || analyses.length}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold">Active job benchmarks</p>
        </div>

        {/* Card 2 */}
        <div className="card-playful p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-muted uppercase tracking-wider">
              Average Readiness
            </span>
            <TrendingUp className="w-5 h-5 text-mint-dark" />
          </div>
          <p className="text-4xl font-extrabold text-navy">
            {summary?.average_readiness || 0}%
          </p>
          <p className="text-[11px] text-emerald-700 font-bold">Grounded evidence index</p>
        </div>

        {/* Card 3 */}
        <div className="card-playful p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-muted uppercase tracking-wider">
              Roadmap Tasks Done
            </span>
            <CheckCircle2 className="w-5 h-5 text-peach-dark" />
          </div>
          <p className="text-4xl font-extrabold text-navy">
            {summary?.completed_tasks_count || 0} / {summary?.total_tasks_count || 0}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold">Verified learning steps</p>
        </div>

        {/* Card 4 */}
        <div className="card-playful p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-muted uppercase tracking-wider">
              Active Roadmaps
            </span>
            <Compass className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-4xl font-extrabold text-navy">
            {summary?.active_roadmaps_count || analyses.length}
          </p>
          <p className="text-[11px] text-purple-700 font-semibold">Weekly milestones active</p>
        </div>

      </div>

      {/* Saved Analyses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-navy flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            <span>Saved Role Analyses ({analyses.length})</span>
          </h2>
        </div>

        {analyses.length === 0 ? (
          <div className="card-playful p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-light border-2 border-primary/20 text-primary flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-navy">No Analyses Created Yet</h3>
            <p className="text-xs text-navy-muted max-w-sm mx-auto">
              Upload your resume and paste a target job description to see your first grounded readiness report.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link href="/analyze" className="btn-primary text-xs px-5 py-2.5 rounded-xl">
                Start New Analysis
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map(item => {
              const matchedCount = item.requirement_matches.filter(m => m.status === 'evidenced').length;
              const missingCount = item.requirement_matches.filter(m => m.status === 'not_evidenced').length;

              return (
                <div
                  key={item.id}
                  className="card-playful p-6 space-y-5 flex flex-col justify-between hover:border-primary transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {item.target_company || 'Target Organization'}
                      </span>
                      <button
                        onClick={e => handleDeleteAnalysis(item.id, e)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Analysis"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-lg text-navy group-hover:text-primary transition-colors">
                        {item.role_title}
                      </h3>
                      <p className="text-xs text-navy-muted mt-0.5">
                        Candidate: {item.parsed_resume.contact.name} • {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Score Bar */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-navy-muted">Role Readiness:</span>
                      <span className="text-lg font-extrabold text-primary">
                        {item.readiness?.overall_score || 0}%
                      </span>
                    </div>

                    {/* Skill Match badges */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                        {matchedCount} Evidenced
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-coral-light text-coral-dark font-bold border border-coral/30">
                        {missingCount} Missing Gaps
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/analysis/${item.id}`}
                      className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 w-full justify-center"
                    >
                      <span>Open Assessment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

