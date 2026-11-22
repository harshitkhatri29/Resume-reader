'use client';

import React, { useState } from 'react';
import { Roadmap, RoadmapMilestone, RoadmapTask } from '@/lib/types';
import { triggerCelebration } from '@/lib/confetti';
import {
  Compass,
  CheckCircle2,
  Clock,
  BookOpen,
  Code,
  FolderGit2,
  FileEdit,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Link2,
  Save
} from 'lucide-react';

interface LearningRoadmapTabProps {
  roadmap: Roadmap;
  onRoadmapUpdate: (updatedRoadmap: Roadmap) => void;
}

export default function LearningRoadmapTab({ roadmap, onRoadmapUpdate }: LearningRoadmapTabProps) {
  const [weeklyHours, setWeeklyHours] = useState(roadmap.weekly_hours || 8);
  const [recalculating, setRecalculating] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  // Evidence editing state
  const [evidenceNotes, setEvidenceNotes] = useState<Record<string, string>>({});
  const [evidenceUrls, setEvidenceUrls] = useState<Record<string, string>>({});
  const [savingEvidence, setSavingEvidence] = useState<string | null>(null);

  // Compute stats
  let totalTasks = 0;
  let completedTasks = 0;
  let totalHours = 0;

  roadmap.milestones.forEach(m => {
    m.tasks.forEach(t => {
      totalTasks++;
      if (t.completed) completedTasks++;
      totalHours += t.estimated_hours || 0;
    });
  });

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleToggleTask = async (milestoneId: string, task: RoadmapTask) => {
    const newCompleted = !task.completed;

    if (newCompleted) {
      triggerCelebration();
    }

    // Optimistic local update
    const updatedMilestones = roadmap.milestones.map(m => ({
      ...m,
      tasks: m.tasks.map(t => t.id === task.id ? { ...t, completed: newCompleted } : t)
    }));
    const updatedRoadmap = { ...roadmap, milestones: updatedMilestones };
    onRoadmapUpdate(updatedRoadmap);

    try {
      const res = await fetch(`/api/roadmaps/${roadmap.id}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newCompleted })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.roadmap) onRoadmapUpdate(data.roadmap);
      }
    } catch (err) {
      console.error('Failed to toggle task on server:', err);
    }
  };

  const handleSaveEvidence = async (task: RoadmapTask) => {
    setSavingEvidence(task.id);
    const newNotes = evidenceNotes[task.id] ?? task.evidence_notes;
    const newUrl = evidenceUrls[task.id] ?? task.evidence_url;

    // Optimistic local update
    const updatedMilestones = roadmap.milestones.map(m => ({
      ...m,
      tasks: m.tasks.map(t => t.id === task.id ? { ...t, evidence_notes: newNotes, evidence_url: newUrl } : t)
    }));
    const updatedRoadmap = { ...roadmap, milestones: updatedMilestones };
    onRoadmapUpdate(updatedRoadmap);
    setExpandedTask(null);

    try {
      const res = await fetch(`/api/roadmaps/${roadmap.id}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidence_notes: newNotes,
          evidence_url: newUrl
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.roadmap) onRoadmapUpdate(data.roadmap);
      }
    } catch (err) {
      console.error('Failed to save evidence on server:', err);
    } finally {
      setSavingEvidence(null);
    }
  };

  const handleRecalculateHours = async () => {
    setRecalculating(true);
    try {
      const res = await fetch(`/api/analyses/${roadmap.analysis_id}/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyHours })
      });
      if (res.ok) {
        const data = await res.json();
        onRoadmapUpdate(data.roadmap);
      }
    } catch (err) {
      console.error('Failed to recalculate roadmap:', err);
    } finally {
      setRecalculating(false);
    }
  };

  const getTaskIcon = (type: RoadmapTask['type']) => {
    switch (type) {
      case 'learning':
        return <BookOpen className="w-4 h-4 text-primary" />;
      case 'practice_exercise':
        return <Code className="w-4 h-4 text-emerald-600" />;
      case 'portfolio_deliverable':
        return <FolderGit2 className="w-4 h-4 text-peach-dark" />;
      case 'resume_update':
        return <FileEdit className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-6">

      {/* Progress & Controls Banner */}
      <div className="card-playful p-6 bg-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Compass className="w-4 h-4" /> Personalized Learning Trajectory
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-navy">
              Roadmap for {roadmap.role_title}
            </h2>
          </div>

          {/* Weekly Hours Adjuster */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-navy-muted">Study Hours:</span>
            <select
              value={weeklyHours}
              onChange={e => setWeeklyHours(Number(e.target.value))}
              className="text-xs font-bold bg-white px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-primary text-navy"
            >
              <option value={4}>4 hrs / wk (Part-time)</option>
              <option value={8}>8 hrs / wk (Standard)</option>
              <option value={15}>15 hrs / wk (Accelerated)</option>
              <option value={25}>25+ hrs / wk (Full-time)</option>
            </select>
            <button
              onClick={handleRecalculateHours}
              disabled={recalculating}
              className="px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-bold shadow-chunky-sm hover:bg-slate-800 disabled:opacity-50"
            >
              {recalculating ? 'Updating...' : 'Apply'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-navy">
            <span>Overall Roadmap Completion: {progressPercentage}%</span>
            <span>{completedTasks} of {totalTasks} milestones tasks checked off ({totalHours} hrs estimated)</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestones list */}
      <div className="space-y-6">
        {roadmap.milestones.map((milestone, mIdx) => {
          const mCompleted = milestone.tasks.filter(t => t.completed).length;
          const isAllDone = mCompleted === milestone.tasks.length && milestone.tasks.length > 0;

          return (
            <div
              key={milestone.id}
              className={`card-playful p-6 space-y-4 border-2 transition-all ${isAllDone
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-slate-900/10 hover:border-slate-900/20'
                }`}
            >
              {/* Milestone Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center border ${isAllDone
                      ? 'bg-emerald-500 text-white border-emerald-600'
                      : 'bg-primary-light text-primary border-primary/20'
                    }`}>
                    W{milestone.target_week}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-navy">{milestone.title}</h3>
                      <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md ${milestone.priority === 'high' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {milestone.priority}
                      </span>
                    </div>
                    <p className="text-xs text-navy-muted mt-0.5">Focus Skill: <strong className="text-navy">{milestone.skill}</strong></p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-navy-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~{milestone.estimated_hours} Hours</span>
                  <span className="text-slate-300">•</span>
                  <span className={isAllDone ? 'text-emerald-700 font-extrabold' : ''}>
                    {mCompleted}/{milestone.tasks.length} Completed
                  </span>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 pt-1">
                {milestone.tasks.map((task) => {
                  const isExpanded = expandedTask === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border-2 transition-all ${task.completed
                          ? 'bg-slate-50 border-slate-200 text-slate-500'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleTask(milestone.id, task)}
                          className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed
                              ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                              : 'border-slate-300 hover:border-primary bg-white'
                            }`}
                        >
                          {task.completed && <CheckCircle2 className="w-4 h-4" />}
                        </button>

                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-navy'}`}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {getTaskIcon(task.type)}
                                <span className="capitalize">{task.type.replace('_', ' ')}</span>
                              </span>
                              <span className="text-[11px] font-semibold text-slate-400">
                                {task.estimated_hours}h
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {task.description}
                          </p>

                          {/* Existing Evidence Display */}
                          {(task.evidence_notes || task.evidence_url) && !isExpanded && (
                            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                              {task.evidence_url && (
                                <a
                                  href={task.evidence_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-primary font-bold hover:underline"
                                >
                                  <Link2 className="w-3 h-3" />
                                  <span>View Project Evidence</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                              {task.evidence_notes && (
                                <span className="text-slate-500 italic">
                                  Note: &quot;{task.evidence_notes}&quot;
                                </span>
                              )}
                            </div>
                          )}

                          {/* Expandable Evidence Editor */}
                          {isExpanded && (
                            <div className="pt-3 mt-3 border-t border-slate-100 space-y-3 animate-in fade-in">
                              <div>
                                <label className="block text-[11px] font-bold text-navy mb-1">
                                  Evidence / Deliverable URL (e.g. GitHub Repository, Vercel Link)
                                </label>
                                <input
                                  type="url"
                                  placeholder="https://github.com/..."
                                  value={evidenceUrls[task.id] ?? (task.evidence_url || '')}
                                  onChange={e => setEvidenceUrls({ ...evidenceUrls, [task.id]: e.target.value })}
                                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-primary"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-navy mb-1">
                                  Completion Notes &amp; Reflection
                                </label>
                                <textarea
                                  rows={2}
                                  placeholder="What did you build or learn? How will you describe this in an interview?"
                                  value={evidenceNotes[task.id] ?? (task.evidence_notes || '')}
                                  onChange={e => setEvidenceNotes({ ...evidenceNotes, [task.id]: e.target.value })}
                                  className="w-full p-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-primary"
                                />
                              </div>

                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setExpandedTask(null)}
                                  className="text-xs font-bold text-slate-500 hover:text-navy px-2 py-1"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={savingEvidence === task.id}
                                  onClick={() => handleSaveEvidence(task)}
                                  className="px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-bold flex items-center gap-1 hover:bg-slate-800"
                                >
                                  <Save className="w-3 h-3" />
                                  <span>{savingEvidence === task.id ? 'Saving...' : 'Save Evidence'}</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Bottom Action links */}
                          <div className="pt-2 flex items-center justify-between text-[11px]">
                            {task.search_query ? (
                              <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(task.search_query)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-slate-500 hover:text-primary font-semibold"
                              >
                                <span>Suggested Search: &ldquo;{task.search_query}&rdquo;</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : <span />}

                            <button
                              type="button"
                              onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                              className="font-bold text-primary hover:underline flex items-center gap-0.5"
                            >
                              <span>{isExpanded ? 'Hide' : (task.evidence_url || task.evidence_notes ? 'Edit Evidence' : '+ Log Evidence')}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

