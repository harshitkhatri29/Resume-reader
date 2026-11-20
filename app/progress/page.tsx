'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Analysis, Roadmap, RoadmapTask } from '@/lib/types';
import { triggerCelebration } from '@/lib/confetti';
import {
  Compass,
  CheckCircle2,
  Clock,
  Award,
  Link2,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Sparkles,
  Loader2,
  Flame,
  Target,
  FolderOpen
} from 'lucide-react';

export default function ProgressPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetch('/api/analyses');
      if (res.ok) {
        const data: Analysis[] = await res.json();
        setAnalyses(data);

        // Fetch roadmaps for all analyses
        const roadmapPromises = data.map(a =>
          fetch(`/api/analyses/${a.id}/roadmap`)
            .then(r => (r.ok ? r.json() : null))
            .catch(() => null)
        );
        const resolvedRoadmaps = await Promise.all(roadmapPromises);
        setRoadmaps(resolvedRoadmaps.filter(Boolean));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTask = async (roadmapId: string, task: RoadmapTask) => {
    const newCompleted = !task.completed;
    if (newCompleted) {
      triggerCelebration();
    }

    try {
      const res = await fetch(`/api/roadmaps/${roadmapId}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newCompleted })
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="font-extrabold text-navy text-sm">Loading your skill milestones...</p>
      </div>
    );
  }

  // Aggregate stats across all roadmaps
  let totalTasks = 0;
  let completedTasks = 0;
  let totalHours = 0;
  const completedMilestonesList: { skill: string; role: string; completedDate?: string }[] = [];
  const inProgressMilestones: { milestone: any; roadmapId: string; role: string }[] = [];
  const loggedEvidenceList: { taskTitle: string; notes?: string; url?: string; role: string }[] = [];

  roadmaps.forEach(r => {
    r.milestones.forEach(m => {
      const allDone = m.tasks.length > 0 && m.tasks.every(t => t.completed);
      if (allDone) {
        completedMilestonesList.push({ skill: m.skill, role: r.role_title });
      } else {
        inProgressMilestones.push({ milestone: m, roadmapId: r.id, role: r.role_title });
      }

      m.tasks.forEach(t => {
        totalTasks++;
        if (t.completed) completedTasks++;
        totalHours += t.estimated_hours || 0;

        if (t.evidence_notes || t.evidence_url) {
          loggedEvidenceList.push({
            taskTitle: t.title,
            notes: t.evidence_notes,
            url: t.evidence_url,
            role: r.role_title
          });
        }
      });
    });
  });

  const overallPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-light border border-mint/40 text-mint-dark font-bold text-xs uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Measurable Skill Growth</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-navy">
            Milestone &amp; Progress Tracker
          </h1>
          <p className="text-xs text-navy-muted mt-1">
            Keep track of completed roadmap milestones, hands-on evidence, and readiness growth.
          </p>
        </div>

        <Link
          href="/analyze"
          className="btn-secondary text-xs px-4 py-2.5 rounded-xl flex items-center gap-2"
        >
          <Target className="w-3.5 h-3.5" />
          <span>Re-assess New Resume</span>
        </Link>
      </div>

      {/* Hero KPI Progress Card */}
      <div className="card-playful p-6 sm:p-8 bg-white space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b-2 border-slate-100">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-navy">
              Skill Acquisition Trajectory
            </h2>
            <p className="text-xs text-navy-muted">
              {completedTasks} of {totalTasks} roadmap tasks verified across {roadmaps.length} target role(s).
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold text-navy-muted block">Roadmap Velocity</span>
              <span className="text-2xl font-extrabold text-primary">{overallPercent}% Complete</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-mint text-navy border-2 border-navy flex items-center justify-center font-extrabold text-lg shadow-chunky-sm">
              <Award className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200">
          <div
            className="bg-primary h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>

      {/* Grid: Mastered Skills vs Logged Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Mastered Skills */}
        <div className="card-playful p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-navy flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Mastered Skills ({completedMilestonesList.length})</span>
            </h3>
          </div>
          <p className="text-xs text-navy-muted">
            Milestones where you have completed all conceptual and practical deliverable requirements.
          </p>

          {completedMilestonesList.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1 text-xs text-slate-500">
              <p className="font-bold text-navy">No milestones completed yet.</p>
              <p>Check off tasks in your active roadmap below as you study and build!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {completedMilestonesList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      ✓
                    </span>
                    <span className="font-extrabold text-xs text-navy">{item.skill}</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800">For {item.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deliverables & Evidence Log */}
        <div className="card-playful p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-navy flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-primary" />
              <span>Logged Deliverables ({loggedEvidenceList.length})</span>
            </h3>
          </div>
          <p className="text-xs text-navy-muted">
            Demonstrable links and notes you logged during learning tasks.
          </p>

          {loggedEvidenceList.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1 text-xs text-slate-500">
              <p className="font-bold text-navy">No evidence logged yet.</p>
              <p>Click &quot;+ Log Evidence&quot; on any roadmap task to save your GitHub or live project URL.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {loggedEvidenceList.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs"
                >
                  <span className="font-bold text-navy block">{ev.taskTitle}</span>
                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary font-bold hover:underline text-[11px]"
                    >
                      <Link2 className="w-3 h-3" />
                      <span>{ev.url}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {ev.notes && (
                    <p className="italic text-slate-600 text-[11px]">&ldquo;{ev.notes}&rdquo;</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Active Roadmap Tasks (Actionable Checklists) */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-navy flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <span>Active In-Progress Milestones</span>
        </h2>

        {inProgressMilestones.length === 0 ? (
          <div className="card-playful p-8 text-center text-xs text-navy-muted">
            All active roadmap milestones are complete or no roadmaps exist yet.
          </div>
        ) : (
          <div className="space-y-4">
            {inProgressMilestones.map(({ milestone, roadmapId, role }) => (
              <div key={milestone.id} className="card-playful p-5 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-sm text-navy">{milestone.title}</h3>
                    <p className="text-[11px] text-navy-muted">
                      Target Role: <strong className="text-navy">{role}</strong> • Focus: {milestone.skill}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-navy-muted">~{milestone.estimated_hours}h</span>
                </div>

                <div className="space-y-2">
                  {milestone.tasks.map((task: RoadmapTask) => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        task.completed ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(roadmapId, task)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                            task.completed ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300 bg-white hover:border-primary'
                          }`}
                        >
                          {task.completed && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <span className={`font-semibold ${task.completed ? 'line-through' : 'text-navy'}`}>
                          {task.title}
                        </span>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                        {task.type.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function FolderGit2(props: any) {
  return <FolderOpen {...props} />;
}
