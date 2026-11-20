'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileText,
  Briefcase,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  ChevronRight,
  ArrowRight,
  Edit3,
  Loader2,
  Copy
} from 'lucide-react';

const SAMPLE_JDS = [
  {
    title: 'Frontend Engineer',
    company: 'Vercel / TechCorp',
    text: `Position: Frontend Engineer
Company: TechCorp
Location: Remote (US / Canada)
Level: Mid-Level

About the Role:
We are seeking a Frontend Engineer proficient with React and TypeScript to build fast, accessible user interfaces. You will collaborate with design and backend teams to deliver high-impact web products.

Responsibilities:
• Architect, build, and maintain responsive web applications using React, Next.js, and TypeScript
• Implement automated unit and component testing with Jest and React Testing Library
• Collaborate with backend engineers to integrate GraphQL and RESTful APIs
• Optimize applications for maximum speed, accessibility (WCAG AA), and Core Web Vitals (LCP, CLS, INP)
• Participate in code reviews and advocate for clean frontend architecture

Requirements:
• 2+ years experience building web applications with modern React
• Strong proficiency in TypeScript, ES6+ JavaScript, HTML5, and Tailwind CSS
• Hands-on experience with Next.js App Router and server-rendered components
• Working knowledge of Git, CI/CD workflows, and component testing (Jest/RTL)
• Solid understanding of browser rendering and web performance optimization

Preferred Skills:
• Experience with State Management (Zustand, Redux)
• Familiarity with Figma and design systems
• Prior experience at a high-growth SaaS startup`
  },
  {
    title: 'Full Stack Developer',
    company: 'Stripe Ecosystem Partner',
    text: `Job Title: Full Stack Developer
Company: CloudScale
Location: Hybrid / San Francisco

Responsibilities:
• Develop scalable web applications across the entire stack using Node.js, Express, React, and PostgreSQL
• Design efficient database schemas, SQL queries, and ORM migrations (Prisma)
• Build robust RESTful APIs and secure authentication flows (JWT, OAuth)
• Deploy services using Docker and cloud infrastructure (AWS/GCP)
• Monitor application performance and troubleshoot production issues

Qualifications:
• 2+ years of full stack software engineering experience
• Proficiency in TypeScript/JavaScript, React, Node.js, and SQL
• Understanding of containerization (Docker) and REST architecture
• Strong unit and integration testing skills (Jest/Supertest)
• Bachelor's degree in Computer Science or equivalent practical experience`
  }
];

const SAMPLE_RESUME_TEXT = `Alex Chen
alex.chen@example.com | +1 (555) 234-5678 | San Francisco, CA
GitHub: github.com/alexchen-dev | LinkedIn: linkedin.com/in/alexchen-dev

PROFESSIONAL SUMMARY
Passionate Junior Frontend Developer with 1.5 years experience building accessible, responsive web applications using React, JavaScript, and Tailwind CSS. Eager to deepen TypeScript and Next.js expertise.

TECHNICAL SKILLS
• Languages & Frameworks: React, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, Redux Toolkit, Jest (Basic)
• Developer Tools: Git, GitHub, REST APIs, Webpack, Vite, Figma, npm, VS Code

WORK EXPERIENCE
PixelCraft Studio — Junior Frontend Developer
Jan 2023 – Present | San Francisco, CA
• Built reusable React components for 4 client websites, improving page load speed by 28%
• Collaborated with UX designers in Figma to translate wireframes into mobile-first responsive interfaces with Tailwind CSS
• Implemented client-side form validation and integrated RESTful backend APIs with error handling

CodeCamp Freelance — Web Development Intern
Jun 2022 – Dec 2022 | Remote
• Maintained landing pages and fixed UI bugs using HTML5, modern CSS, and vanilla JavaScript
• Integrated Google Analytics tracking scripts and improved accessibility audit scores

EDUCATION
University of California, Davis
B.S. in Computer Science (2022)

KEY PROJECTS
DevBoard — Kanban Task Manager
• Interactive drag-and-drop task dashboard built with React and LocalStorage persistence.
• Clean responsive UI styled with Tailwind CSS; automated GitHub Actions workflow.`;

export default function AnalyzePage() {
  const router = useRouter();

  const [jdText, setJdText] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [targetCompany, setTargetCompany] = useState('');

  const [resumeMode, setResumeMode] = useState<'upload' | 'paste'>('upload');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  // File drag-and-drop handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError(null);
    const validExtensions = ['pdf', 'docx', 'txt'];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (!ext || !validExtensions.includes(ext)) {
      setError('Please upload a valid PDF, DOCX, or TXT resume document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setResumeFile(file);
  };

  const handleApplySampleJD = (sample: typeof SAMPLE_JDS[0]) => {
    setJdText(sample.text);
    setRoleTitle(sample.title);
    setTargetCompany(sample.company);
  };

  const handleApplySampleResume = () => {
    setResumeMode('paste');
    setResumeText(SAMPLE_RESUME_TEXT);
    setResumeFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!jdText.trim()) {
      setError('Please provide a Job Description.');
      return;
    }

    if (resumeMode === 'upload' && !resumeFile) {
      setError('Please choose a resume file to upload, or switch to paste resume text.');
      return;
    }

    if (resumeMode === 'paste' && !resumeText.trim()) {
      setError('Please paste your resume content.');
      return;
    }

    setLoading(true);
    setLoadingStep('Parsing documents and normalizing technical skills...');

    try {
      const formData = new FormData();
      formData.append('jd', jdText);
      formData.append('title', roleTitle);
      formData.append('company', targetCompany);

      if (resumeMode === 'upload' && resumeFile) {
        formData.append('resume', resumeFile);
      } else {
        formData.append('resume_text', resumeText);
      }

      setLoadingStep('Running requirement evidence matching & ATS checks...');

      const res = await fetch('/api/analyses', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process analysis');
      }

      setLoadingStep('Generating learning milestones and grounded suggestions...');
      router.push(`/analysis/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong during analysis.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Readiness Assessment</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy">
          Compare Resume with Job Description
        </h1>
        <p className="text-sm text-navy-muted">
          Our parser extracts structured requirements and evaluates your evidence directly against the job requirements.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-coral-light border-2 border-coral/30 flex items-start gap-3 text-coral-dark text-sm font-semibold max-w-4xl mx-auto">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Input Error</p>
            <p className="font-medium text-xs text-coral-dark/90 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Two-Panel Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left Panel: Job Description */}
          <div className="card-playful p-6 sm:p-8 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">
                    JD
                  </div>
                  <h2 className="text-xl font-extrabold text-navy">Target Job Description</h2>
                </div>
              </div>

              {/* Sample JD Quick Fill buttons */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-navy-muted">Quick Fill with Sample JD:</span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_JDS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplySampleJD(sample)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-navy flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>{sample.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Meta fields */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-navy-muted mb-1">
                    Job Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={e => setRoleTitle(e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-navy-muted mb-1">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetCompany}
                    onChange={e => setTargetCompany(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none text-xs font-semibold"
                  />
                </div>
              </div>

              {/* JD Textarea */}
              <div>
                <label className="block text-xs font-bold text-navy mb-1.5">
                  Job Description Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={13}
                  value={jdText}
                  onChange={e => setJdText(e.target.value)}
                  placeholder="Paste the full job posting requirements, responsibilities, and qualifications here..."
                  className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none text-xs font-mono leading-relaxed resize-y"
                  required
                />
              </div>
            </div>

            <div className="text-xs text-navy-muted font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>We extract required vs preferred skills, seniority, and responsibilities.</span>
            </div>
          </div>

          {/* Right Panel: Resume Upload */}
          <div className="card-playful p-6 sm:p-8 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-mint text-navy border border-navy/20 flex items-center justify-center font-bold text-sm">
                    CV
                  </div>
                  <h2 className="text-xl font-extrabold text-navy">Your Resume</h2>
                </div>

                {/* Toggle Upload vs Paste */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setResumeMode('upload')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      resumeMode === 'upload' ? 'bg-white shadow-sm text-navy' : 'text-slate-500 hover:text-navy'
                    }`}
                  >
                    File Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeMode('paste')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      resumeMode === 'paste' ? 'bg-white shadow-sm text-navy' : 'text-slate-500 hover:text-navy'
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              {/* Sample Resume Quick Load */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-navy-muted">Quick Load Sample Candidate:</span>
                <div>
                  <button
                    type="button"
                    onClick={handleApplySampleResume}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-navy flex items-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3 h-3 text-slate-500" />
                    <span>Alex Chen — Junior Frontend (Sample)</span>
                  </button>
                </div>
              </div>

              {/* Mode: File Upload */}
              {resumeMode === 'upload' ? (
                <div className="space-y-3 pt-1">
                  <label
                    htmlFor="resume-upload"
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      resumeFile
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-slate-300 hover:border-primary bg-slate-50/60 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {resumeFile ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto">
                          <FileCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-navy">{resumeFile.name}</p>
                          <p className="text-xs text-slate-500 font-medium">
                            {(resumeFile.size / 1024).toFixed(1)} KB • Click to change file
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary-light border border-primary/20 text-primary flex items-center justify-center mx-auto">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-extrabold text-sm text-navy">
                            Click to upload or drag &amp; drop
                          </p>
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            PDF or DOCX documents up to 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </label>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-navy-muted">
                    <p className="font-semibold text-navy">Privacy Safeguard:</p>
                    <p className="mt-0.5">
                      Your document text is stored only for this analysis session and can be deleted at any time with one click.
                    </p>
                  </div>
                </div>
              ) : (
                /* Mode: Paste Text */
                <div>
                  <label className="block text-xs font-bold text-navy mb-1.5">
                    Resume Text Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={13}
                    value={resumeText}
                    onChange={e => setResumeText(e.target.value)}
                    placeholder="Paste the full text of your resume here (Summary, Skills, Experience, Education, Projects)..."
                    className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none text-xs font-mono leading-relaxed resize-y"
                    required
                  />
                </div>
              )}
            </div>

            <div className="text-xs text-navy-muted font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>We parse contact, summary, skills, experience bullets, and education.</span>
            </div>
          </div>

        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 max-w-7xl pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto btn-primary text-base px-8 py-4 rounded-2xl flex items-center justify-center gap-3 shadow-chunky hover:shadow-chunky-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{loadingStep || 'Processing Analysis...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-white" />
                <span>Run Complete Readiness Analysis</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
}

