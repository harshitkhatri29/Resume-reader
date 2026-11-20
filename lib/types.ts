export type SkillStatus = 'evidenced' | 'partially_evidenced' | 'not_evidenced' | 'unclear';
export type PriorityLevel = 'high' | 'medium' | 'low';
export type TaskType = 'learning' | 'practice_exercise' | 'portfolio_deliverable' | 'resume_update';

export interface ParsedContact {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface ParsedExperience {
  company: string;
  role: string;
  duration?: string;
  location?: string;
  bullets: string[];
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  year?: string;
  details?: string;
}

export interface ParsedProject {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface ParsedResume {
  contact: ParsedContact;
  summary?: string;
  skills: string[];
  experience: ParsedExperience[];
  education: ParsedEducation[];
  projects: ParsedProject[];
  certifications: string[];
  raw_text: string;
}

export interface ParsedJD {
  title: string;
  company?: string;
  level?: string;
  location?: string;
  summary?: string;
  responsibilities: string[];
  required_skills: string[];
  preferred_skills: string[];
  qualifications: string[];
  raw_text: string;
}

export interface RequirementMatch {
  id: string;
  requirement: string;
  type: 'required' | 'preferred';
  status: SkillStatus;
  jd_citation: string;
  resume_evidence: string;
  explanation: string;
  priority: PriorityLevel;
  actionable_guidance: string;
}

export interface ATSFormattingIssue {
  id: string;
  category: 'formatting' | 'structure' | 'keywords' | 'content';
  issue: string;
  severity: 'critical' | 'moderate' | 'tip';
  fix: string;
}

export interface ATSDiagnostics {
  overall_ats_score: number;
  readability_score: number;
  sections_detected: {
    contact: boolean;
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
  };
  file_format_health: {
    status: 'pass' | 'warning' | 'fail';
    message: string;
  };
  keyword_insights: {
    matched_keywords: string[];
    missing_critical_keywords: string[];
    recommended_context_keywords: string[];
  };
  formatting_issues: ATSFormattingIssue[];
  actionable_summary: string;
}

export interface ReadinessScore {
  overall_score: number;
  dimensions: {
    core_skills: number;
    experience_relevance: number;
    education_credentials: number;
    ats_readability: number;
  };
  summary: string;
}

export interface RoadmapTask {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  estimated_hours: number;
  completed: boolean;
  completed_at?: string;
  evidence_notes?: string;
  evidence_url?: string;
  search_query?: string;
  suggested_topics?: string[];
}

export interface RoadmapMilestone {
  id: string;
  skill: string;
  title: string;
  priority: PriorityLevel;
  target_week: number;
  estimated_hours: number;
  tasks: RoadmapTask[];
}

export interface Roadmap {
  id: string;
  analysis_id: string;
  role_title: string;
  target_company?: string;
  weekly_hours: number;
  created_at: string;
  milestones: RoadmapMilestone[];
}

export interface ResumeSuggestion {
  id: string;
  section: 'summary' | 'experience' | 'skills' | 'projects';
  original_text: string;
  proposed_text: string;
  grounded_reason: string;
  status: 'pending' | 'accepted' | 'rejected';
  user_edited_text?: string;
}

export interface ResumeRevision {
  id: string;
  analysis_id: string;
  resume_id: string;
  suggestions: ResumeSuggestion[];
  final_markdown?: string;
  created_at: string;
  updated_at: string;
}

export interface Analysis {
  id: string;
  resume_id: string;
  job_target_id: string;
  role_title: string;
  target_company?: string;
  created_at: string;
  status: 'completed' | 'processing' | 'failed';
  is_ai_powered: boolean;
  parsed_resume: ParsedResume;
  parsed_jd: ParsedJD;
  readiness: ReadinessScore;
  requirement_matches: RequirementMatch[];
  ats_diagnostics: ATSDiagnostics;
}

export interface DashboardSummary {
  total_analyses: number;
  average_readiness: number;
  active_roadmaps_count: number;
  completed_tasks_count: number;
  total_tasks_count: number;
  recent_analyses: Array<{
    id: string;
    role_title: string;
    target_company?: string;
    readiness_score: number;
    created_at: string;
    matched_count: number;
    missing_count: number;
  }>;
}

