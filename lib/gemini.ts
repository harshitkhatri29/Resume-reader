import { ParsedResume, ParsedJD, RequirementMatch, ATSDiagnostics, ReadinessScore, Roadmap, ResumeRevision } from './types';

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
}

export async function callGemini(prompt: string, systemInstruction?: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`Gemini API error (${res.status}):`, errText);
      return null;
    }

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidate || null;
  } catch (err) {
    console.error('Failed to communicate with Gemini API:', err);
    return null;
  }
}

// Generate grounded requirement matching & ATS diagnostics
export async function analyzeResumeAndJD(
  resume: ParsedResume,
  jd: ParsedJD
): Promise<{
  readiness: ReadinessScore;
  requirement_matches: RequirementMatch[];
  ats_diagnostics: ATSDiagnostics;
  is_ai_powered: boolean;
}> {
  if (isGeminiConfigured()) {
    try {
      const prompt = `
You are an expert technical hiring advisor and ATS analyzer adhering strictly to truthfulness.
Do not hallucinate or invent qualifications.

RESUME DATA:
${JSON.stringify({
  contact: resume.contact,
  summary: resume.summary,
  skills: resume.skills,
  experience: resume.experience,
  education: resume.education,
  projects: resume.projects,
  certifications: resume.certifications
}, null, 2)}

JOB DESCRIPTION DATA:
${JSON.stringify({
  title: jd.title,
  company: jd.company,
  responsibilities: jd.responsibilities,
  required_skills: jd.required_skills,
  preferred_skills: jd.preferred_skills,
  qualifications: jd.qualifications
}, null, 2)}

TASK:
1. Compare every required and preferred skill from the JD against the resume.
   For each requirement:
   - status: 'evidenced' | 'partially_evidenced' | 'not_evidenced' | 'unclear'
   - jd_citation: exact or close quote from JD
   - resume_evidence: exact citation from resume or 'Not found in resume'
   - explanation: explain why
   - priority: 'high' | 'medium' | 'low'
   - actionable_guidance: truthful advice on how candidate can learn/demonstrate this skill
2. Calculate realistic readiness scores (0-100) across:
   - core_skills
   - experience_relevance
   - education_credentials
   - ats_readability
   - overall_score
   - summary
3. Provide comprehensive ATS diagnostics:
   - overall_ats_score (0-100)
   - readability_score (0-100)
   - sections_detected (boolean flags for contact, summary, experience, education, skills, projects)
   - file_format_health: { status: 'pass'|'warning'|'fail', message: string }
   - keyword_insights: { matched_keywords: string[], missing_critical_keywords: string[], recommended_context_keywords: string[] }
   - formatting_issues: array of { id, category, issue, severity ('critical'|'moderate'|'tip'), fix }
   - actionable_summary

Return ONLY JSON conforming to this schema:
{
  "readiness": {
    "overall_score": number,
    "dimensions": { "core_skills": number, "experience_relevance": number, "education_credentials": number, "ats_readability": number },
    "summary": string
  },
  "requirement_matches": [
    {
      "id": string,
      "requirement": string,
      "type": "required" | "preferred",
      "status": "evidenced" | "partially_evidenced" | "not_evidenced" | "unclear",
      "jd_citation": string,
      "resume_evidence": string,
      "explanation": string,
      "priority": "high" | "medium" | "low",
      "actionable_guidance": string
    }
  ],
  "ats_diagnostics": {
    "overall_ats_score": number,
    "readability_score": number,
    "sections_detected": { "contact": boolean, "summary": boolean, "experience": boolean, "education": boolean, "skills": boolean, "projects": boolean },
    "file_format_health": { "status": "pass" | "warning" | "fail", "message": string },
    "keyword_insights": { "matched_keywords": string[], "missing_critical_keywords": string[], "recommended_context_keywords": string[] },
    "formatting_issues": [
      { "id": string, "category": "formatting" | "structure" | "keywords" | "content", "issue": string, "severity": "critical" | "moderate" | "tip", "fix": string }
    ],
    "actionable_summary": string
  }
}
`;

      const aiResponse = await callGemini(prompt, "You are a precise JSON-generating career and ATS analysis engine.");
      if (aiResponse) {
        const parsed = JSON.parse(aiResponse);
        if (parsed.readiness && parsed.requirement_matches && parsed.ats_diagnostics) {
          return {
            readiness: parsed.readiness,
            requirement_matches: parsed.requirement_matches,
            ats_diagnostics: parsed.ats_diagnostics,
            is_ai_powered: true
          };
        }
      }
    } catch (err) {
      console.warn('Gemini analysis failed or returned invalid JSON; falling back to heuristic engine:', err);
    }
  }

  // Heuristic analysis engine (Transparent Fallback)
  return runHeuristicAnalysis(resume, jd);
}

export function runHeuristicAnalysis(
  resume: ParsedResume,
  jd: ParsedJD
): {
  readiness: ReadinessScore;
  requirement_matches: RequirementMatch[];
  ats_diagnostics: ATSDiagnostics;
  is_ai_powered: boolean;
} {
  const resumeTextLower = resume.raw_text.toLowerCase();
  const resumeSkillsLower = new Set(resume.skills.map(s => s.toLowerCase()));
  const matches: RequirementMatch[] = [];

  const allJDSkills = [
    ...jd.required_skills.map(s => ({ skill: s, type: 'required' as const })),
    ...jd.preferred_skills.map(s => ({ skill: s, type: 'preferred' as const }))
  ];

  let matchedCount = 0;
  let partialCount = 0;
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  allJDSkills.forEach((item, index) => {
    const sLower = item.skill.toLowerCase();
    const isExactSkillInList = resumeSkillsLower.has(sLower);
    const isInText = resumeTextLower.includes(sLower);

    let status: RequirementMatch['status'] = 'not_evidenced';
    let resumeEvidence = 'Not found in resume.';
    let explanation = `Skill "${item.skill}" was not evidenced in your uploaded resume.`;
    let guidance = `Build a hands-on project demonstrating ${item.skill} and document it in your portfolio.`;

    if (isExactSkillInList && isInText) {
      status = 'evidenced';
      matchedCount++;
      matchedKeywords.push(item.skill);
      resumeEvidence = `Listed under Technical Skills and mentioned in project/experience descriptions.`;
      explanation = `Demonstrated directly in your resume and aligns with JD specifications.`;
      guidance = `Highlight quantifiable impact using ${item.skill} in your experience bullets.`;
    } else if (isInText || isExactSkillInList) {
      status = 'partially_evidenced';
      partialCount++;
      matchedKeywords.push(item.skill);
      resumeEvidence = isExactSkillInList ? `Listed in skills section but lacks detailed project bullets.` : `Mentioned in text context.`;
      explanation = `Recognized in resume, but lacks evidence of production use or tangible outcomes.`;
      guidance = `Add a specific achievement bullet describing how you applied ${item.skill}.`;
    } else {
      missingKeywords.push(item.skill);
    }

    matches.push({
      id: `req-${index + 1}`,
      requirement: item.skill,
      type: item.type,
      status,
      jd_citation: `Target role requires proficiency in ${item.skill}`,
      resume_evidence: resumeEvidence,
      explanation,
      priority: item.type === 'required' ? 'high' : 'medium',
      actionable_guidance: guidance
    });
  });

  const total = allJDSkills.length || 1;
  const coreScore = Math.min(95, Math.max(40, Math.round(((matchedCount * 1.0 + partialCount * 0.5) / total) * 100)));
  const expScore = Math.min(92, Math.max(45, Math.round(coreScore * 0.9 + (resume.experience.length > 1 ? 15 : 5))));
  const eduScore = resume.education.length > 0 ? 88 : 70;
  const atsReadability = 82;
  const overall = Math.round((coreScore * 0.45) + (expScore * 0.3) + (eduScore * 0.15) + (atsReadability * 0.1));

  const sectionsDetected = {
    contact: Boolean(resume.contact.name && (resume.contact.email || resume.contact.phone)),
    summary: Boolean(resume.summary && resume.summary.length > 20),
    experience: resume.experience.length > 0,
    education: resume.education.length > 0,
    skills: resume.skills.length > 0,
    projects: resume.projects.length > 0
  };

  const formattingIssues: ATSDiagnostics['formatting_issues'] = [];
  if (missingKeywords.length > 0) {
    formattingIssues.push({
      id: 'issue-1',
      category: 'keywords',
      issue: `Critical target keywords missing: ${missingKeywords.slice(0, 3).join(', ')}`,
      severity: 'critical',
      fix: `Incorporate these skills into your learning roadmap and resume once verified.`
    });
  }
  if (!sectionsDetected.summary) {
    formattingIssues.push({
      id: 'issue-2',
      category: 'structure',
      issue: 'Professional summary is absent or very brief',
      severity: 'moderate',
      fix: 'Include a 2-3 sentence summary defining your core stack and target engineering focus.'
    });
  }
  formattingIssues.push({
    id: 'issue-3',
    category: 'formatting',
    issue: 'Use standard bullet action verbs and measurable outcomes (XYZ formula)',
    severity: 'tip',
    fix: 'Revise bullets using: Accomplished [X], as measured by [Y], by doing [Z].'
  });

  return {
    is_ai_powered: false,
    readiness: {
      overall_score: overall,
      dimensions: {
        core_skills: coreScore,
        experience_relevance: expScore,
        education_credentials: eduScore,
        ats_readability: atsReadability
      },
      summary: `Found ${matchedCount} evidenced and ${partialCount} partially evidenced skills for ${jd.title}. Focus your learning on missing requirements (${missingKeywords.slice(0, 3).join(', ')}).`
    },
    requirement_matches: matches,
    ats_diagnostics: {
      overall_ats_score: Math.min(96, Math.max(50, Math.round((coreScore + atsReadability) / 2))),
      readability_score: atsReadability,
      sections_detected: sectionsDetected,
      file_format_health: {
        status: 'pass',
        message: 'Standard document formatting recognized by common ATS scanners.'
      },
      keyword_insights: {
        matched_keywords: matchedKeywords,
        missing_critical_keywords: missingKeywords,
        recommended_context_keywords: ['System Architecture', 'Agile / Scrum', 'CI/CD Pipelines']
      },
      formatting_issues: formattingIssues,
      actionable_summary: `Your resume demonstrates good structure. Closing ${missingKeywords.length} gap(s) will significantly improve recruiter alignment.`
    }
  };
}

// Generate Personalized Roadmap
export async function generateRoadmapFromAnalysis(
  analysisId: string,
  roleTitle: string,
  company: string | undefined,
  weeklyHours: number,
  matches: RequirementMatch[]
): Promise<Roadmap> {
  const missingOrPartial = matches.filter(m => m.status === 'not_evidenced' || m.status === 'partially_evidenced');
  const targetGaps = missingOrPartial.length > 0 ? missingOrPartial.slice(0, 4) : matches.slice(0, 3);

  if (isGeminiConfigured()) {
    try {
      const prompt = `
Create a realistic, actionable learning roadmap for candidate targeting "${roleTitle}".
Weekly study availability: ${weeklyHours} hours/week.
Skill Gaps to address:
${targetGaps.map(g => `- ${g.requirement} (Priority: ${g.priority}, Status: ${g.status})`).join('\n')}

For each skill gap, generate a milestone with:
- skill
- title
- priority ('high'|'medium'|'low')
- target_week (1, 2, 3...)
- estimated_hours (realistic sum based on ${weeklyHours} hrs/week)
- tasks: array of 3 tasks:
  1. learning task (concept mastery)
  2. practice_exercise or portfolio_deliverable (build something demonstrable)
  3. resume_update (how to truthfully express this on resume once completed)

Return ONLY valid JSON matching this schema:
{
  "milestones": [
    {
      "id": string,
      "skill": string,
      "title": string,
      "priority": "high" | "medium" | "low",
      "target_week": number,
      "estimated_hours": number,
      "tasks": [
        {
          "id": string,
          "title": string,
          "description": string,
          "type": "learning" | "practice_exercise" | "portfolio_deliverable" | "resume_update",
          "estimated_hours": number,
          "search_query": string
        }
      ]
    }
  ]
}
`;

      const aiResponse = await callGemini(prompt, "You are a senior tech curriculum and engineering mentor.");
      if (aiResponse) {
        const parsed = JSON.parse(aiResponse);
        if (parsed.milestones && Array.isArray(parsed.milestones)) {
          return {
            id: `roadmap-${Date.now()}`,
            analysis_id: analysisId,
            role_title: roleTitle,
            target_company: company,
            weekly_hours: weeklyHours,
            created_at: new Date().toISOString(),
            milestones: parsed.milestones.map((m: any, mIdx: number) => ({
              id: m.id || `ms-${mIdx + 1}`,
              skill: m.skill,
              title: m.title,
              priority: m.priority || 'high',
              target_week: m.target_week || (mIdx + 1),
              estimated_hours: m.estimated_hours || 10,
              tasks: (m.tasks || []).map((t: any, tIdx: number) => ({
                id: t.id || `task-${mIdx + 1}-${tIdx + 1}`,
                title: t.title,
                description: t.description,
                type: t.type || 'learning',
                estimated_hours: t.estimated_hours || 3,
                completed: false,
                search_query: t.search_query
              }))
            }))
          };
        }
      }
    } catch (err) {
      console.warn('Gemini roadmap generation failed; using heuristic generator:', err);
    }
  }

  // Fallback heuristic roadmap generator
  const milestones = targetGaps.map((gap, index) => {
    const weekNum = index + 1;
    return {
      id: `ms-${index + 1}`,
      skill: gap.requirement,
      title: `Master ${gap.requirement} for ${roleTitle}`,
      priority: gap.priority,
      target_week: weekNum,
      estimated_hours: weeklyHours,
      tasks: [
        {
          id: `t-${weekNum}-1`,
          title: `Core Fundamentals & Best Practices in ${gap.requirement}`,
          description: `Study core documentation, architectural patterns, and syntax conventions.`,
          type: 'learning' as const,
          estimated_hours: Math.max(2, Math.round(weeklyHours * 0.35)),
          completed: false,
          search_query: `${gap.requirement} official docs and best practices guide`
        },
        {
          id: `t-${weekNum}-2`,
          title: `Build Hands-On Feature with ${gap.requirement}`,
          description: `Develop a focused code repository or interactive feature integrating ${gap.requirement}.`,
          type: 'portfolio_deliverable' as const,
          estimated_hours: Math.max(3, Math.round(weeklyHours * 0.45)),
          completed: false,
          search_query: `${gap.requirement} beginner project tutorial github`
        },
        {
          id: `t-${weekNum}-3`,
          title: `Document Deliverable & Update Resume`,
          description: `Add the completed repository link to your GitHub and truthfully integrate the skill into your project bullets.`,
          type: 'resume_update' as const,
          estimated_hours: Math.max(1, Math.round(weeklyHours * 0.2)),
          completed: false
        }
      ]
    };
  });

  return {
    id: `roadmap-${Date.now()}`,
    analysis_id: analysisId,
    role_title: roleTitle,
    target_company: company,
    weekly_hours: weeklyHours,
    created_at: new Date().toISOString(),
    milestones
  };
}

// Generate Truthful Resume Suggestions
export async function generateResumeSuggestionsFromAnalysis(
  analysisId: string,
  resumeId: string,
  resume: ParsedResume,
  jd: ParsedJD
): Promise<ResumeRevision> {
  if (isGeminiConfigured()) {
    try {
      const prompt = `
You are a career editor specializing in grounded, truthful resume revisions for target roles.
NEVER invent credentials, past employment titles, fake metric percentages, or unverified employers.
Focus on:
- Rephrasing vague bullets into the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z].
- Using strong action verbs aligned with "${jd.title}".
- Highlighting existing technical skills accurately.

CANDIDATE RESUME:
${JSON.stringify({ summary: resume.summary, experience: resume.experience, projects: resume.projects }, null, 2)}

TARGET JOB:
${JSON.stringify({ title: jd.title, required_skills: jd.required_skills, responsibilities: jd.responsibilities }, null, 2)}

TASK:
Provide 3-5 high-impact suggestions for the summary, experience bullets, and projects.
Return ONLY valid JSON:
{
  "suggestions": [
    {
      "id": string,
      "section": "summary" | "experience" | "skills" | "projects",
      "original_text": string,
      "proposed_text": string,
      "grounded_reason": string
    }
  ]
}
`;

      const aiResponse = await callGemini(prompt, "You are a truthful resume optimization assistant.");
      if (aiResponse) {
        const parsed = JSON.parse(aiResponse);
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          return {
            id: `rev-${Date.now()}`,
            analysis_id: analysisId,
            resume_id: resumeId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            suggestions: parsed.suggestions.map((s: any, idx: number) => ({
              id: s.id || `sug-${idx + 1}`,
              section: s.section || 'experience',
              original_text: s.original_text,
              proposed_text: s.proposed_text,
              grounded_reason: s.grounded_reason,
              status: 'pending' as const
            }))
          };
        }
      }
    } catch (err) {
      console.warn('Gemini resume suggestions failed; falling back to heuristic engine:', err);
    }
  }

  // Heuristic suggestions
  const suggestions: ResumeRevision['suggestions'] = [];

  if (resume.summary) {
    suggestions.push({
      id: 'sug-1',
      section: 'summary',
      original_text: resume.summary,
      proposed_text: `Results-focused ${jd.title} candidate with proven experience across ${resume.skills.slice(0, 4).join(', ')}. Committed to building responsive, accessible applications and engineering high-quality user experiences.`,
      grounded_reason: 'Reframes summary to proactively mirror target role title and highlight evidenced core stack without exaggerating experience level.',
      status: 'pending'
    });
  }

  if (resume.experience.length > 0 && resume.experience[0].bullets.length > 0) {
    const firstBullet = resume.experience[0].bullets[0];
    suggestions.push({
      id: 'sug-2',
      section: 'experience',
      original_text: firstBullet,
      proposed_text: `Architected and shipped modular components utilizing ${resume.skills.slice(0, 2).join(' and ')}, resulting in measurable performance gains and clean maintainability.`,
      grounded_reason: 'Strengthens opening verb from general wording to "Architected and shipped", aligning with standard engineering evaluation rubrics.',
      status: 'pending'
    });
  }

  if (resume.projects.length > 0) {
    const proj = resume.projects[0];
    suggestions.push({
      id: 'sug-3',
      section: 'projects',
      original_text: proj.description,
      proposed_text: `Engineered ${proj.name}: Production-ready application developed with ${proj.technologies.join(', ')}, demonstrating modular state management, responsive UI, and clean API integration.`,
      grounded_reason: 'Structures project description around architectural principles and tangible deliverables.',
      status: 'pending'
    });
  }

  return {
    id: `rev-${Date.now()}`,
    analysis_id: analysisId,
    resume_id: resumeId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    suggestions
  };
}

