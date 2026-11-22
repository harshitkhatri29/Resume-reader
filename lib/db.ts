import fs from 'fs';
import path from 'path';
import { Analysis, Roadmap, ResumeRevision, DashboardSummary, RequirementMatch } from './types';

interface DatabaseSchema {
  analyses: Record<string, Analysis>;
  roadmaps: Record<string, Roadmap>;
  revisions: Record<string, ResumeRevision>;
}

// Global in-memory cache for serverless environments
declare global {
  var __SKILL_BRIDGE_DB__: DatabaseSchema | undefined;
}

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = IS_SERVERLESS ? path.join('/tmp', 'skillbridge') : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_SEED: DatabaseSchema = {
  analyses: {
    'demo-analysis-1': {
      id: 'demo-analysis-1',
      resume_id: 'resume-demo-1',
      job_target_id: 'jd-demo-1',
      role_title: 'Frontend Engineer',
      target_company: 'Vercel / TechCorp',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: 'completed',
      is_ai_powered: true,
      parsed_resume: {
        contact: {
          name: 'Alex Chen',
          email: 'alex.chen@example.com',
          phone: '+1 (555) 234-5678',
          location: 'San Francisco, CA',
          github: 'github.com/alexchen-dev',
          linkedin: 'linkedin.com/in/alexchen-dev'
        },
        summary: 'Passionate Junior Frontend Developer with 1.5 years experience building accessible, responsive web applications using React, JavaScript, and Tailwind CSS. Eager to deepen TypeScript and Next.js expertise.',
        skills: [
          'React', 'JavaScript (ES6+)', 'HTML5', 'CSS3', 'Tailwind CSS',
          'Git', 'REST APIs', 'Redux Toolkit', 'Jest (Basic)', 'Figma'
        ],
        experience: [
          {
            company: 'PixelCraft Studio',
            role: 'Junior Frontend Developer',
            duration: 'Jan 2023 – Present',
            location: 'San Francisco, CA',
            bullets: [
              'Built reusable React components for 4 client websites, improving page load speed by 28%',
              'Collaborated with UX designers in Figma to translate wireframes into mobile-first responsive interfaces',
              'Implemented client-side form validation and integrated RESTful backend APIs'
            ]
          },
          {
            company: 'CodeCamp Freelance',
            role: 'Web Development Intern',
            duration: 'Jun 2022 – Dec 2022',
            location: 'Remote',
            bullets: [
              'Maintained landing pages and fixed UI bugs using HTML5, modern CSS, and vanilla JavaScript',
              'Integrated Google Analytics tracking scripts and improved accessibility audit scores'
            ]
          }
        ],
        education: [
          {
            institution: 'University of California, Davis',
            degree: 'B.S. in Computer Science',
            year: '2022',
            details: 'Dean\'s Honor List, coursework in Data Structures, Algorithms, Web Architecture'
          }
        ],
        projects: [
          {
            name: 'DevBoard - Kanban Task Manager',
            description: 'Interactive drag-and-drop task dashboard built with React and LocalStorage persistence.',
            technologies: ['React', 'Tailwind CSS', 'Drag & Drop API'],
            link: 'https://github.com/alexchen-dev/devboard'
          }
        ],
        certifications: ['Meta Front-End Developer Professional Certificate (Coursera)'],
        raw_text: 'Alex Chen\nalex.chen@example.com | San Francisco, CA\n...'
      },
      parsed_jd: {
        title: 'Frontend Engineer',
        company: 'Vercel / TechCorp',
        level: 'Mid-Level',
        location: 'Remote / US',
        summary: 'We are seeking a Frontend Engineer with solid React and TypeScript skills, experience with Next.js App Router, state management, and modern testing to build high-performance web applications.',
        responsibilities: [
          'Architect and deliver production-grade user interfaces using Next.js, React, and TypeScript',
          'Implement automated unit and component tests with Jest and React Testing Library',
          'Collaborate with product and backend teams to integrate GraphQL and REST APIs',
          'Optimize Core Web Vitals (LCP, CLS, INP) for consumer-facing apps'
        ],
        required_skills: [
          'React', 'TypeScript', 'Next.js', 'HTML/CSS/Tailwind', 'REST/GraphQL APIs', 'Git'
        ],
        preferred_skills: [
          'Core Web Vitals Optimization', 'Jest / React Testing Library', 'CI/CD Pipelines', 'State Management (Zustand/Redux)'
        ],
        qualifications: [
          '2+ years of professional web development experience',
          'Proficiency with TypeScript and React component architecture',
          'Demonstrated understanding of web performance and accessibility (WCAG)'
        ],
        raw_text: 'Job Title: Frontend Engineer\nCompany: TechCorp...'
      },
      readiness: {
        overall_score: 72,
        dimensions: {
          core_skills: 75,
          experience_relevance: 68,
          education_credentials: 90,
          ats_readability: 82
        },
        summary: 'Strong foundational alignment for Frontend Engineer. React, Tailwind, and REST integration are solidly evidenced. The primary gaps are professional TypeScript depth, Next.js App Router experience, and automated component testing.'
      },
      requirement_matches: [
        {
          id: 'req-1',
          requirement: 'React Component Architecture',
          type: 'required',
          status: 'evidenced',
          jd_citation: 'Architect and deliver production-grade user interfaces using React',
          resume_evidence: 'Built reusable React components for 4 client websites at PixelCraft Studio; Built DevBoard with React',
          explanation: 'Demonstrated professional React experience and personal projects directly match the role requirement.',
          priority: 'high',
          actionable_guidance: 'Highlight custom hooks and performance patterns in your project descriptions.'
        },
        {
          id: 'req-2',
          requirement: 'TypeScript Proficiency',
          type: 'required',
          status: 'partially_evidenced',
          jd_citation: 'Proficiency with TypeScript and React component architecture',
          resume_evidence: 'Resume mentions "JavaScript (ES6+)" and eager to deepen TypeScript; no specific TypeScript projects cited.',
          explanation: 'You have solid modern JavaScript foundations, but no explicit TypeScript usage is shown in bullet points.',
          priority: 'high',
          actionable_guidance: 'Migrate one of your open-source projects (e.g., DevBoard) to strict TypeScript and add TypeScript to your technical skills list.'
        },
        {
          id: 'req-3',
          requirement: 'Next.js App Router Experience',
          type: 'required',
          status: 'not_evidenced',
          jd_citation: 'Experience with Next.js App Router and server-rendered components',
          resume_evidence: 'Not found in resume text.',
          explanation: 'No Next.js or SSR framework experience is evidenced in your work history or projects.',
          priority: 'high',
          actionable_guidance: 'Build a small full-stack or API-integrated demo using Next.js 14/15 App Router and deploy it on Vercel.'
        },
        {
          id: 'req-4',
          requirement: 'Automated Testing (Jest / React Testing Library)',
          type: 'preferred',
          status: 'partially_evidenced',
          jd_citation: 'Implement automated unit and component tests with Jest and React Testing Library',
          resume_evidence: 'Resume lists "Jest (Basic)" in skills, but no testing metrics or achievements in experience bullets.',
          explanation: 'Skill is listed as a keyword, but lack of concrete project evidence will make interviewers question your test coverage experience.',
          priority: 'medium',
          actionable_guidance: 'Add unit tests for key React components in your GitHub repo and document test coverage.'
        },
        {
          id: 'req-5',
          requirement: 'Tailwind CSS & Responsive UI',
          type: 'required',
          status: 'evidenced',
          jd_citation: 'HTML/CSS/Tailwind and responsive mobile-first layouts',
          resume_evidence: 'PixelCraft Studio: "translated wireframes into mobile-first responsive interfaces with Tailwind CSS"',
          explanation: 'Directly supported by verified workplace achievements.',
          priority: 'medium',
          actionable_guidance: 'Keep this bullet highlighted; it provides solid credibility.'
        },
        {
          id: 'req-6',
          requirement: 'Web Performance & Core Web Vitals',
          type: 'preferred',
          status: 'partially_evidenced',
          jd_citation: 'Optimize Core Web Vitals (LCP, CLS, INP) for consumer-facing apps',
          resume_evidence: 'Resume mentions "improving page load speed by 28%", but does not mention specific Core Web Vitals metrics.',
          explanation: 'Great speed improvement bullet, but grounding it in specific metrics like LCP or Lighthouse scores strengthens it.',
          priority: 'medium',
          actionable_guidance: 'Clarify the 28% speed improvement in your resume: "improving Lighthouse performance score from 68 to 96 and reducing LCP by 1.2s".'
        }
      ],
      ats_diagnostics: {
        overall_ats_score: 82,
        readability_score: 85,
        sections_detected: {
          contact: true,
          summary: true,
          experience: true,
          education: true,
          skills: true,
          projects: true
        },
        file_format_health: {
          status: 'pass',
          message: 'Clean single-column structure with standard ATS header tags.'
        },
        keyword_insights: {
          matched_keywords: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Git', 'REST APIs', 'Redux', 'Figma'],
          missing_critical_keywords: ['TypeScript', 'Next.js', 'React Testing Library', 'Core Web Vitals'],
          recommended_context_keywords: ['SSR', 'Component Lifecycle', 'Lighthouse', 'CI/CD']
        },
        formatting_issues: [
          {
            id: 'fmt-1',
            category: 'keywords',
            issue: 'High-priority JD requirement "TypeScript" is missing from your Skills list',
            severity: 'critical',
            fix: 'Add TypeScript once you have completed migration of a sample project to reflect truthful competency.'
          },
          {
            id: 'fmt-2',
            category: 'content',
            issue: 'Experience bullets could benefit from stronger metric framing (XYZ formula)',
            severity: 'moderate',
            fix: 'Quantify impact where possible: e.g. "reduced bundle size by 24% by lazy-loading heavy vendor assets".'
          },
          {
            id: 'fmt-3',
            category: 'structure',
            issue: 'Summary statement contains tentative phrasing ("eager to deepen")',
            severity: 'tip',
            fix: 'Replace tentative phrases with active, confident value statements.'
          }
        ],
        actionable_summary: 'Your resume passes standard ATS parsing filters with flying colors. Addressing the missing TypeScript and Next.js keywords through demonstrated project experience will boost your match confidence.'
      }
    }
  },
  roadmaps: {
    'demo-analysis-1': {
      id: 'roadmap-demo-1',
      analysis_id: 'demo-analysis-1',
      role_title: 'Frontend Engineer',
      target_company: 'Vercel / TechCorp',
      weekly_hours: 8,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      milestones: [
        {
          id: 'ms-1',
          skill: 'TypeScript for React Developers',
          title: 'Master Strict TypeScript in React Applications',
          priority: 'high',
          target_week: 1,
          estimated_hours: 10,
          tasks: [
            {
              id: 't-1-1',
              title: 'Learn Generics, Utility Types, and Strict Typing',
              description: 'Review Partial, Pick, Omit, Record, and typing React Props, Event Handlers, and custom Hooks.',
              type: 'learning',
              estimated_hours: 3,
              completed: true,
              completed_at: new Date(Date.now() - 86400000).toISOString(),
              evidence_notes: 'Completed Total TypeScript beginner tutorial and typed custom useFetch hook.',
              search_query: 'Total TypeScript beginner tutorial and React TypeScript cheat sheet'
            },
            {
              id: 't-1-2',
              title: 'Migrate DevBoard Project from JS to Strict TypeScript',
              description: 'Add tsconfig.json with strict: true. Convert all .jsx files to .tsx without using "any".',
              type: 'practice_exercise',
              estimated_hours: 4,
              completed: true,
              completed_at: new Date(Date.now() - 43200000).toISOString(),
              evidence_url: 'https://github.com/alexchen-dev/devboard/tree/ts-migration',
              evidence_notes: 'Created PR #4 migrating 14 components to .tsx with zero type errors.',
              search_query: 'Migrating React create-react-app or Vite project to TypeScript step by step'
            },
            {
              id: 't-1-3',
              title: 'Update Resume Skills Section with TypeScript',
              description: 'Truthfully list TypeScript under your technical skills now that you have demonstrable project code.',
              type: 'resume_update',
              estimated_hours: 1,
              completed: false,
              search_query: 'How to list TypeScript on frontend resume truthfully'
            }
          ]
        },
        {
          id: 'ms-2',
          skill: 'Next.js App Router',
          title: 'Build Fullstack React App with Next.js 14 App Router',
          priority: 'high',
          target_week: 2,
          estimated_hours: 12,
          tasks: [
            {
              id: 't-2-1',
              title: 'Understand Server Components vs Client Components',
              description: 'Learn Server-Side Rendering (SSR), Static Site Generation (SSG), Suspense streaming, and Server Actions.',
              type: 'learning',
              estimated_hours: 4,
              completed: false,
              search_query: 'Next.js official documentation learn App Router server components'
            },
            {
              id: 't-2-2',
              title: 'Deliver a Portfolio Fullstack App on Vercel',
              description: 'Create a responsive web app with Route Handlers, metadata for SEO, and dynamic routes. Deploy live.',
              type: 'portfolio_deliverable',
              estimated_hours: 6,
              completed: false,
              search_query: 'Next.js 14 tutorial fullstack project deployed to Vercel'
            },
            {
              id: 't-2-3',
              title: 'Document Project on GitHub with Architecture Diagram',
              description: 'Write a comprehensive README explaining technical decisions, SSR benefits, and Lighthouse score.',
              type: 'practice_exercise',
              estimated_hours: 2,
              completed: false
            }
          ]
        },
        {
          id: 'ms-3',
          skill: 'Automated Testing',
          title: 'Implement Jest and React Testing Library Component Tests',
          priority: 'medium',
          target_week: 3,
          estimated_hours: 8,
          tasks: [
            {
              id: 't-3-1',
              title: 'Write Unit Tests for User Interactions and Accessibility',
              description: 'Test button clicks, form submissions, and accessible role queries (getByRole).',
              type: 'practice_exercise',
              estimated_hours: 4,
              completed: false,
              search_query: 'Testing JavaScript applications React Testing Library best practices'
            },
            {
              id: 't-3-2',
              title: 'Set Up GitHub Actions CI to Run Tests on Pull Requests',
              description: 'Create a simple .github/workflows/ci.yml pipeline that runs npm test on every push.',
              type: 'portfolio_deliverable',
              estimated_hours: 3,
              completed: false
            }
          ]
        }
      ]
    }
  },
  revisions: {
    'demo-analysis-1': {
      id: 'rev-demo-1',
      analysis_id: 'demo-analysis-1',
      resume_id: 'resume-demo-1',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 43200000).toISOString(),
      suggestions: [
        {
          id: 'sug-1',
          section: 'summary',
          original_text: 'Passionate Junior Frontend Developer with 1.5 years experience building accessible, responsive web applications using React, JavaScript, and Tailwind CSS. Eager to deepen TypeScript and Next.js expertise.',
          proposed_text: 'Results-driven Frontend Developer with 1.5+ years building accessible, high-performance web applications using React, TypeScript, and Tailwind CSS. Proven track record of improving web performance and shipping responsive UI components.',
          grounded_reason: 'Replaces passive "eager to deepen" with active phrasing while reflecting your active TypeScript learning without fabricating past employment titles.',
          status: 'accepted'
        },
        {
          id: 'sug-2',
          section: 'experience',
          original_text: 'Built reusable React components for 4 client websites, improving page load speed by 28%',
          proposed_text: 'Architected reusable, modular React component library for 4 client web apps, reducing page load latency by 28% and boosting Lighthouse performance scores.',
          grounded_reason: 'Adds structural technical terms ("architected modular component library", "Lighthouse scores") that match the JD wording while preserving truthful historical metrics.',
          status: 'accepted'
        },
        {
          id: 'sug-3',
          section: 'experience',
          original_text: 'Implemented client-side form validation and integrated RESTful backend APIs',
          proposed_text: 'Engineered robust client-side form workflows with asynchronous validation, integrating secure RESTful backend endpoints with comprehensive error-handling states.',
          grounded_reason: 'Clarifies engineering depth around API integration and error handling, directly answering the JD requirement for production-grade REST communication.',
          status: 'pending'
        },
        {
          id: 'sug-4',
          section: 'projects',
          original_text: 'Interactive drag-and-drop task dashboard built with React and LocalStorage persistence.',
          proposed_text: 'Engineered DevBoard: Full-typed Kanban task dashboard featuring strict TypeScript, React, Tailwind CSS, and resilient browser state synchronization.',
          grounded_reason: 'Incorporates newly completed TypeScript migration from Milestone 1 of your roadmap.',
          status: 'pending'
        }
      ]
    }
  }
};

function ensureDataDir() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (err) {
      // Read-only filesystem fallback
    }
  }

  export function getDatabase(): DatabaseSchema {
    if (globalThis.__SKILL_BRIDGE_DB__) {
      return globalThis.__SKILL_BRIDGE_DB__;
    }

    ensureDataDir();
      try {
        if (fs.existsSync(DB_FILE)) {
          const raw = fs.readFileSync(DB_FILE, 'utf-8');
          const parsed = JSON.parse(raw);
          const schema: DatabaseSchema = {
            analyses: parsed.analyses || INITIAL_SEED.analyses,
            roadmaps: parsed.roadmaps || INITIAL_SEED.roadmaps,
            revisions: parsed.revisions || INITIAL_SEED.revisions
          };
          globalThis.__SKILL_BRIDGE_DB__ = schema;
          return schema;
        }
      } catch (err) {
        console.error('Error reading database file, using in-memory store:', err);
      }

      // Clone initial seed so mutations don't corrupt the constant
      const seedClone: DatabaseSchema = JSON.parse(JSON.stringify(INITIAL_SEED));
      globalThis.__SKILL_BRIDGE_DB__ = seedClone;

      try {
        ensureDataDir();
        fs.writeFileSync(DB_FILE, JSON.stringify(seedClone, null, 2), 'utf-8');
      } catch (err) {
        // Ignore if filesystem is not writable
      }

      return seedClone;
    }

    export function saveDatabase(data: DatabaseSchema): void {
      globalThis.__SKILL_BRIDGE_DB__ = data;
      ensureDataDir();
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      } catch (err) {
        console.warn('Filesystem write not permitted, data kept in memory:', err);
      }
    }

    // Analysis operations
    export function getAllAnalyses(): Analysis[] {
      const db = getDatabase();
      return Object.values(db.analyses).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    export function getAnalysisById(id: string): Analysis | null {
      const db = getDatabase();
      return db.analyses[id] || null;
    }

    export function saveAnalysis(analysis: Analysis): Analysis {
      const db = getDatabase();
      db.analyses[analysis.id] = analysis;
      saveDatabase(db);
      return analysis;
    }

    export function updateAnalysis(id: string, updates: Partial<Analysis>): Analysis | null {
      const db = getDatabase();
      if (!db.analyses[id]) return null;
      db.analyses[id] = { ...db.analyses[id], ...updates };
      saveDatabase(db);
      return db.analyses[id];
    }

    export function deleteAnalysis(id: string): boolean {
      const db = getDatabase();
      if (!db.analyses[id]) return false;
      delete db.analyses[id];
      delete db.roadmaps[id];
      delete db.revisions[id];
      saveDatabase(db);
      return true;
    }

    // Roadmap operations
    export function getRoadmapByAnalysisId(analysisId: string): Roadmap | null {
      const db = getDatabase();
      return db.roadmaps[analysisId] || null;
    }

    export function getRoadmapById(id: string): Roadmap | null {
      const db = getDatabase();
      const roadmaps = Object.values(db.roadmaps);
      return roadmaps.find(r => r.id === id) || null;
    }

    export function getAllRoadmaps(): Roadmap[] {
      const db = getDatabase();
      return Object.values(db.roadmaps);
    }

    export function saveRoadmap(roadmap: Roadmap): Roadmap {
      const db = getDatabase();
      db.roadmaps[roadmap.analysis_id] = roadmap;
      saveDatabase(db);
      return roadmap;
    }

    export function updateRoadmapTask(
      roadmapId: string,
      taskId: string,
      updates: Partial<Roadmap['milestones'][0]['tasks'][0]>
    ): Roadmap | null {
      const db = getDatabase();
      const roadmapEntry = Object.entries(db.roadmaps).find(
        ([, r]) => r.id === roadmapId || r.analysis_id === roadmapId
      );
      if (!roadmapEntry) return null;

      const [key, roadmap] = roadmapEntry;
      let taskFound = false;

      for (const milestone of roadmap.milestones) {
        const taskIndex = milestone.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
          milestone.tasks[taskIndex] = {
            ...milestone.tasks[taskIndex],
            ...updates
          };
          taskFound = true;
          break;
        }
      }

      if (taskFound) {
        db.roadmaps[key] = roadmap;
        saveDatabase(db);
        return roadmap;
      }
      return null;
    }

    // Resume Revision operations
    export function getResumeRevision(analysisId: string): ResumeRevision | null {
      const db = getDatabase();
      return db.revisions[analysisId] || null;
    }

    export function saveResumeRevision(revision: ResumeRevision): ResumeRevision {
      const db = getDatabase();
      db.revisions[revision.analysis_id] = revision;
      saveDatabase(db);
      return revision;
    }

    export function updateResumeSuggestion(
      analysisId: string,
      suggestionId: string,
      status: 'pending' | 'accepted' | 'rejected',
      userEditedText?: string
    ): ResumeRevision | null {
      const db = getDatabase();
      const revision = db.revisions[analysisId];
      if (!revision) return null;

      const sugIndex = revision.suggestions.findIndex(s => s.id === suggestionId);
      if (sugIndex === -1) return null;

      revision.suggestions[sugIndex].status = status;
      if (userEditedText !== undefined) {
        revision.suggestions[sugIndex].user_edited_text = userEditedText;
      }
      revision.updated_at = new Date().toISOString();

      db.revisions[analysisId] = revision;
      saveDatabase(db);
      return revision;
    }

    // Dashboard summary computation
    export function getDashboardSummary(): DashboardSummary {
      const db = getDatabase();
      const analyses = Object.values(db.analyses);
      const roadmaps = Object.values(db.roadmaps);

      let totalTasks = 0;
      let completedTasks = 0;

      for (const r of roadmaps) {
        for (const m of r.milestones) {
          for (const t of m.tasks) {
            totalTasks++;
            if (t.completed) completedTasks++;
          }
        }
      }

      const avgReadiness = analyses.length > 0
        ? Math.round(analyses.reduce((acc, a) => acc + (a.readiness?.overall_score || 0), 0) / analyses.length)
        : 0;

      const recentAnalyses = analyses.slice(0, 5).map(a => {
        const matchedCount = a.requirement_matches.filter(m => m.status === 'evidenced').length;
        const missingCount = a.requirement_matches.filter(m => m.status === 'not_evidenced').length;
        return {
          id: a.id,
          role_title: a.role_title,
          target_company: a.target_company,
          readiness_score: a.readiness?.overall_score || 0,
          created_at: a.created_at,
          matched_count: matchedCount,
          missing_count: missingCount
        };
      });

      return {
        total_analyses: analyses.length,
        average_readiness: avgReadiness,
        active_roadmaps_count: roadmaps.length,
        completed_tasks_count: completedTasks,
        total_tasks_count: totalTasks,
        recent_analyses: recentAnalyses
      };
    }

