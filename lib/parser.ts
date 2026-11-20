import mammoth from 'mammoth';
import { ParsedResume, ParsedJD } from './types';

export async function extractTextFromFile(buffer: Buffer, filename: string, mimeType?: string): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } catch (err) {
      console.error('Error parsing DOCX with mammoth:', err);
      // Fallback: unzip and extract word/document.xml text
      return extractTextFromDocxZip(buffer);
    }
  }

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    try {
      // Dynamically import pdf-parse to avoid top-level bundle issues
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      if (data && data.text && data.text.trim().length > 20) {
        return data.text;
      }
    } catch (err) {
      console.warn('pdf-parse encountered an issue, trying raw stream fallback:', err);
    }
    // Resilient raw stream fallback
    return extractTextFromPdfBuffer(buffer);
  }

  // Plain text / markdown
  return buffer.toString('utf-8');
}

function extractTextFromDocxZip(buffer: Buffer): string {
  try {
    const str = buffer.toString('binary');
    const xmlMatch = str.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (xmlMatch) {
      return xmlMatch.map(t => t.replace(/<[^>]+>/g, '')).join(' ');
    }
  } catch {
    // ignore
  }
  return buffer.toString('utf-8');
}

function extractTextFromPdfBuffer(buffer: Buffer): string {
  try {
    const raw = buffer.toString('latin1');
    const matches = raw.match(/\((.*?)\)\s*T[jJ]|\[(.*?)\]\s*TJ/g);
    if (matches && matches.length > 0) {
      const extracted: string[] = [];
      for (const m of matches) {
        const textInParens = m.match(/\((.*?)\)/g);
        if (textInParens) {
          extracted.push(textInParens.map(p => p.slice(1, -1)).join(''));
        }
      }
      const combined = extracted.join(' ').replace(/\\r|\\n|\\t/g, ' ').replace(/\s+/g, ' ');
      if (combined.length > 50) return combined;
    }
  } catch (err) {
    console.error('Raw PDF fallback failed:', err);
  }
  return buffer.toString('utf-8').replace(/[^\x20-\x7E\n]/g, ' ');
}

// Deterministic heuristic extraction for resumes
export function parseResumeText(text: string): ParsedResume {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Extract contact info
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/);
  const githubMatch = text.match(/(?:github\.com\/|gh:)([a-zA-Z0-9_-]+)/i);
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/)([a-zA-Z0-9_-]+)/i);

  // Likely candidate name is first clean non-header line
  let name = 'Candidate';
  for (const line of lines.slice(0, 5)) {
    if (!line.includes('@') && !line.includes('http') && line.length < 40 && !/resume|curriculum|vitae/i.test(line)) {
      name = line.replace(/[^a-zA-Z\s.-]/g, '').trim();
      if (name.length > 2) break;
    }
  }

  // Common technical skills dictionary for heuristic matching
  const knownSkills = [
    'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'TypeScript', 'JavaScript',
    'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Sass', 'Less',
    'Node.js', 'Express', 'Python', 'Django', 'FastAPI', 'Flask', 'Go', 'Golang',
    'Java', 'Spring Boot', 'C#', '.NET', 'C++', 'Rust', 'PHP', 'Laravel', 'Ruby',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Prisma', 'GraphQL', 'REST APIs',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'GitHub Actions', 'Terraform',
    'Git', 'Linux', 'Jest', 'Mocha', 'Cypress', 'Playwright', 'Vitest', 'Selenium',
    'Webpack', 'Vite', 'Turbopack', 'Redux', 'Zustand', 'MobX', 'Figma', 'UI/UX',
    'Agile', 'Scrum', 'Jira', 'Microservices', 'System Design', 'Core Web Vitals'
  ];

  const extractedSkills = new Set<string>();
  for (const skill of knownSkills) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      extractedSkills.add(skill);
    }
  }

  // Parse sections
  const sections: { title: string; lines: string[] }[] = [];
  let currentSection = { title: 'header', lines: [] as string[] };

  for (const line of lines) {
    const isSectionHeader = /^(summary|professional summary|objective|experience|work experience|employment history|education|skills|technical skills|projects|key projects|certifications|awards)$/i.test(line.replace(/[:\-#]/g, '').trim());
    if (isSectionHeader) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { title: line.toLowerCase(), lines: [] };
    } else {
      currentSection.lines.push(line);
    }
  }
  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }

  // Extract Summary
  const summarySec = sections.find(s => /summary|objective/i.test(s.title));
  const summary = summarySec ? summarySec.lines.join(' ') : lines.slice(1, 4).join(' ');

  // Extract Experience
  const expSec = sections.find(s => /experience|employment|work/i.test(s.title));
  const experience: ParsedResume['experience'] = [];

  if (expSec && expSec.lines.length > 0) {
    let currentExp: { company: string; role: string; duration?: string; bullets: string[] } | null = null;
    for (const line of expSec.lines) {
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line);
      const isDateOrTitle = /\b(20\d\d|19\d\d|present|current)\b/i.test(line) || /engineer|developer|intern|lead|manager|specialist|analyst/i.test(line);

      if (!isBullet && isDateOrTitle && line.length < 80) {
        if (currentExp) experience.push(currentExp);
        const parts = line.split(/[|–—,-]/).map(p => p.trim());
        currentExp = {
          role: parts[0] || 'Software Engineer',
          company: parts[1] || 'Tech Company',
          duration: parts[2] || 'Recent',
          bullets: []
        };
      } else if (currentExp) {
        currentExp.bullets.push(line.replace(/^[•\-\*\d\.]+\s*/, ''));
      }
    }
    if (currentExp) experience.push(currentExp);
  }

  if (experience.length === 0) {
    // Fallback experience block
    experience.push({
      role: 'Software Developer / Projects',
      company: 'Experience & Open Source',
      duration: 'Recent',
      bullets: lines.filter(l => l.length > 30 && !l.includes('@')).slice(0, 3)
    });
  }

  // Extract Education
  const eduSec = sections.find(s => /education/i.test(s.title));
  const education: ParsedResume['education'] = [];
  if (eduSec && eduSec.lines.length > 0) {
    education.push({
      institution: eduSec.lines[0] || 'University / Institution',
      degree: eduSec.lines[1] || 'Degree in Computer Science or Related Field',
      details: eduSec.lines.slice(2).join(', ')
    });
  } else {
    education.push({
      institution: 'Higher Education / Relevant Coursework',
      degree: 'B.S. or Equivalent Experience'
    });
  }

  return {
    contact: {
      name: name || 'Applicant',
      email: emailMatch ? emailMatch[0] : undefined,
      phone: phoneMatch ? phoneMatch[0] : undefined,
      github: githubMatch ? `https://github.com/${githubMatch[1]}` : undefined,
      linkedin: linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : undefined,
      location: 'Remote / Available'
    },
    summary,
    skills: Array.from(extractedSkills).length > 0 ? Array.from(extractedSkills) : ['React', 'JavaScript', 'HTML/CSS', 'Git'],
    experience,
    education,
    projects: [
      {
        name: 'Technical Project Portfolio',
        description: 'Web application and software tools showcasing full-stack capabilities and modern UI.',
        technologies: Array.from(extractedSkills).slice(0, 4)
      }
    ],
    certifications: lines.filter(l => /certified|certificate|coursera|aws|meta|google/i.test(l)).slice(0, 3),
    raw_text: text
  };
}

// Deterministic heuristic extraction for Job Descriptions
export function parseJobDescription(text: string): ParsedJD {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let title = 'Software Engineer';
  for (const line of lines.slice(0, 5)) {
    if (/engineer|developer|architect|designer|manager|specialist|analyst/i.test(line) && line.length < 60) {
      title = line.replace(/^(job title|position|role):?/i, '').trim();
      break;
    }
  }

  // Extract common required and preferred skills
  const skillsCatalog = [
    'React', 'Next.js', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'Tailwind CSS',
    'Node.js', 'Python', 'Go', 'Java', 'C#', 'SQL', 'PostgreSQL', 'GraphQL', 'REST APIs',
    'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'CI/CD', 'Git', 'Jest', 'Cypress',
    'Microservices', 'System Design', 'Core Web Vitals', 'Responsive Design', 'Agile'
  ];

  const foundSkills = skillsCatalog.filter(s => {
    const regex = new RegExp(`\\b${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  });

  const required_skills = foundSkills.slice(0, Math.ceil(foundSkills.length * 0.65));
  const preferred_skills = foundSkills.slice(Math.ceil(foundSkills.length * 0.65));

  const responsibilities = lines
    .filter(l => (l.startsWith('•') || l.startsWith('-') || /^(develop|build|design|collaborate|lead|maintain|test|optimize)/i.test(l)) && l.length > 25)
    .slice(0, 5)
    .map(l => l.replace(/^[•\-\*\d\.]+\s*/, ''));

  return {
    title,
    company: 'Target Company',
    level: /senior|lead|staff/i.test(text) ? 'Senior' : /junior|intern|entry/i.test(text) ? 'Entry Level' : 'Mid-Level',
    responsibilities: responsibilities.length > 0 ? responsibilities : [
      'Build scalable web applications adhering to high engineering standards',
      'Collaborate with cross-functional teams to design intuitive customer experiences',
      'Maintain reliable test coverage and participate in code reviews'
    ],
    required_skills: required_skills.length > 0 ? required_skills : ['React', 'TypeScript', 'CSS', 'REST APIs'],
    preferred_skills: preferred_skills.length > 0 ? preferred_skills : ['Next.js', 'Automated Testing', 'CI/CD'],
    qualifications: [
      'Demonstrated experience with modern software engineering practices',
      'Strong problem-solving and communication skills',
      'Passion for building high-quality, performant software'
    ],
    raw_text: text
  };
}

