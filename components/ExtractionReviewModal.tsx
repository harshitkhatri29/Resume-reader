'use client';

import React, { useState } from 'react';
import { ParsedResume, ParsedJD } from '@/lib/types';
import { Check, X, Edit2, AlertCircle } from 'lucide-react';

interface ExtractionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedResume: ParsedResume;
  parsedJD: ParsedJD;
  onSaveCorrections: (correctedResume: ParsedResume, correctedJD: ParsedJD) => Promise<void>;
}

export default function ExtractionReviewModal({
  isOpen,
  onClose,
  parsedResume,
  parsedJD,
  onSaveCorrections
}: ExtractionReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'resume' | 'jd'>('resume');
  const [candidateName, setCandidateName] = useState(parsedResume.contact.name || '');
  const [candidateEmail, setCandidateEmail] = useState(parsedResume.contact.email || '');
  const [skillsText, setSkillsText] = useState(parsedResume.skills.join(', '));
  const [summaryText, setSummaryText] = useState(parsedResume.summary || '');
  const [jdTitle, setJdTitle] = useState(parsedJD.title || '');
  const [jdRequiredSkills, setJdRequiredSkills] = useState(parsedJD.required_skills.join(', '));

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedResume: ParsedResume = {
        ...parsedResume,
        contact: {
          ...parsedResume.contact,
          name: candidateName,
          email: candidateEmail
        },
        summary: summaryText,
        skills: skillsText.split(',').map(s => s.trim()).filter(Boolean)
      };

      const updatedJD: ParsedJD = {
        ...parsedJD,
        title: jdTitle,
        required_skills: jdRequiredSkills.split(',').map(s => s.trim()).filter(Boolean)
      };

      await onSaveCorrections(updatedResume, updatedJD);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border-2 border-navy shadow-playful max-w-3xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 my-8">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b-2 border-slate-100">
          <div>
            <h3 className="text-xl font-extrabold text-navy">
              Review &amp; Correct Extracted Content
            </h3>
            <p className="text-xs text-navy-muted mt-0.5">
              Ensure parser fidelity. Corrections directly update your evidence matching.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-navy text-xl font-bold px-2 py-0.5 rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 mt-4 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'resume'
                ? 'bg-primary text-white border-2 border-navy shadow-chunky-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Parsed Resume Fields
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('jd')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'jd'
                ? 'bg-primary text-white border-2 border-navy shadow-chunky-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Parsed JD Requirements
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {activeTab === 'resume' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Candidate Name</label>
                  <input
                    type="text"
                    value={candidateName}
                    onChange={e => setCandidateName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-primary text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">Email</label>
                  <input
                    type="email"
                    value={candidateEmail}
                    onChange={e => setCandidateEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-primary text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Extracted Skills (comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={skillsText}
                  onChange={e => setSkillsText(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-primary text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Professional Summary
                </label>
                <textarea
                  rows={3}
                  value={summaryText}
                  onChange={e => setSummaryText(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-primary text-xs font-mono"
                />
              </div>

              {parsedResume.experience.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Extracted Experience Roles ({parsedResume.experience.length})
                  </label>
                  <div className="space-y-2">
                    {parsedResume.experience.map((exp, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-navy">{exp.role}</span> — <span>{exp.company}</span>
                        <p className="text-slate-500 text-[11px] mt-0.5">{exp.bullets.length} bullet points extracted</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-navy mb-1">Target Job Title</label>
                <input
                  type="text"
                  value={jdTitle}
                  onChange={e => setJdTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-primary text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Required Skills Extracted (comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={jdRequiredSkills}
                  onChange={e => setJdRequiredSkills(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-primary text-xs font-mono"
                />
              </div>

              {parsedJD.responsibilities.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-navy mb-1">
                    Key Responsibilities Extracted
                  </label>
                  <ul className="list-disc list-inside space-y-1 text-xs text-navy-muted">
                    {parsedJD.responsibilities.slice(0, 4).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t-2 border-slate-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-200 font-bold text-xs text-navy hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="btn-primary px-6 py-2.5 rounded-xl text-xs flex items-center gap-2"
          >
            {saving ? 'Recalculating...' : 'Save & Recalculate Analysis'}
          </button>
        </div>

      </div>
    </div>
  );
}

