'use client';

import React, { useState } from 'react';
import { ResumeRevision, ResumeSuggestion } from '@/lib/types';
import {
  FileText,
  Check,
  X,
  Edit3,
  Download,
  Copy,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface ResumeStudioTabProps {
  revision: ResumeRevision;
  analysisId: string;
  onRevisionUpdate: (updatedRevision: ResumeRevision) => void;
}

export default function ResumeStudioTab({ revision, analysisId, onRevisionUpdate }: ResumeStudioTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [exportModal, setExportModal] = useState(false);
  const [exportedContent, setExportedContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleUpdateStatus = async (
    suggestionId: string,
    status: 'accepted' | 'rejected',
    customText?: string
  ) => {
    try {
      const res = await fetch(`/api/resume-revisions/${analysisId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestionId,
          status,
          userEditedText: customText
        })
      });

      if (res.ok) {
        const data = await res.json();
        onRevisionUpdate(data.revision);
        setEditingId(null);
      }
    } catch (err) {
      console.error('Failed to update suggestion status:', err);
    }
  };

  const handleStartEdit = (sug: ResumeSuggestion) => {
    setEditingId(sug.id);
    setEditText(sug.user_edited_text || sug.proposed_text);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await fetch(`/api/resume-revisions/${analysisId}/export`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setExportedContent(data.content);
        setExportModal(true);
      }
    } catch (err) {
      console.error('Failed to export resume:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleRegenerateSuggestions = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/analyses/${analysisId}/resume-suggestions`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        onRevisionUpdate(data.revision);
      }
    } catch (err) {
      console.error('Failed to regenerate suggestions:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportedContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resume_Optimized.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(exportedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const acceptedCount = revision.suggestions.filter(s => s.status === 'accepted').length;

  return (
    <div className="space-y-6">

      {/* Studio Header */}
      <div className="card-playful p-6 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-peach-dark uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Grounded Resume Enhancements
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-navy">
              Truthful Resume Studio
            </h2>
            <p className="text-xs text-navy-muted mt-1">
              Refactor bullet points using active engineering verbs and quantified XYZ impact. No fabricated facts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRegenerateSuggestions}
              disabled={generating}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-navy hover:bg-slate-50 flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>

            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="btn-primary text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-chunky-sm"
            >
              <Download className="w-4 h-4" />
              <span>{exportLoading ? 'Exporting...' : `Export Revised Resume (${acceptedCount} Accepted)`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-5">
        {revision.suggestions.map((sug, idx) => {
          const isEditing = editingId === sug.id;

          return (
            <div
              key={sug.id}
              className={`card-playful p-6 space-y-4 border-2 transition-all ${
                sug.status === 'accepted'
                  ? 'border-emerald-300 bg-emerald-50/15'
                  : sug.status === 'rejected'
                  ? 'border-slate-200 opacity-60 bg-slate-50'
                  : 'border-slate-900/10'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-navy text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    Section: {sug.section}
                  </span>
                  {sug.status === 'accepted' && (
                    <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Accepted
                    </span>
                  )}
                  {sug.status === 'rejected' && (
                    <span className="text-[11px] font-extrabold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                      Declined
                    </span>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(sug)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-navy hover:bg-slate-50 text-xs font-bold flex items-center gap-1"
                    title="Edit proposed wording"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(sug.id, 'accepted')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      sug.status === 'accepted'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(sug.id, 'rejected')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      sug.status === 'rejected'
                        ? 'bg-slate-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Original Text */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                    Original Resume Text
                  </span>
                  <p className="text-slate-700 leading-relaxed font-sans">{sug.original_text}</p>
                </div>

                {/* Proposed Text / Edit Mode */}
                <div className="p-4 rounded-xl bg-primary-light/40 border border-primary/20 space-y-1.5">
                  <span className="font-bold text-primary uppercase text-[10px] tracking-wider block flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Grounded Revision (XYZ Impact Formula)
                  </span>

                  {isEditing ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        rows={3}
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-primary focus:outline-none text-xs font-medium text-navy"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 text-xs text-slate-500 hover:text-navy"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(sug.id, 'accepted', editText)}
                          className="px-3 py-1 rounded-lg bg-primary text-white text-xs font-bold shadow-sm"
                        >
                          Save &amp; Accept
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-navy font-semibold leading-relaxed font-sans">
                      {sug.user_edited_text || sug.proposed_text}
                    </p>
                  )}
                </div>

              </div>

              {/* Grounded Reason */}
              <div className="text-xs text-slate-600 pt-1">
                <strong className="text-navy">Why this improves match:</strong> {sug.grounded_reason}
              </div>

            </div>
          );
        })}
      </div>

      {/* Export Modal */}
      {exportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl border-2 border-navy shadow-playful max-w-2xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 my-8 flex flex-col max-h-[85vh]">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-extrabold text-navy">
                  Exported ATS-Optimized Resume
                </h3>
                <p className="text-xs text-navy-muted mt-0.5">
                  Includes accepted rewrites formatted cleanly for ATS parsers.
                </p>
              </div>
              <button
                onClick={() => setExportModal(false)}
                className="text-slate-400 hover:text-navy text-xl font-bold px-2 py-0.5 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed whitespace-pre-wrap select-all border border-slate-800">
              {exportedContent}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">Format: Markdown / Plain Text</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-navy hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

