import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById, getResumeRevision } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const revision = getResumeRevision(params.id);
    const analysis = getAnalysisById(params.id);

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const resume = analysis.parsed_resume;
    const acceptedSuggestions = revision?.suggestions.filter(s => s.status === 'accepted') || [];

    // Apply summary revision if accepted
    let summaryText = resume.summary || '';
    const summarySug = acceptedSuggestions.find(s => s.section === 'summary');
    if (summarySug) {
      summaryText = summarySug.user_edited_text || summarySug.proposed_text;
    }

    // Compile Markdown formatted resume
    let markdown = `# ${resume.contact.name}\n`;
    const contactParts = [
      resume.contact.email,
      resume.contact.phone,
      resume.contact.location,
      resume.contact.linkedin,
      resume.contact.github
    ].filter(Boolean);
    markdown += `${contactParts.join(' | ')}\n\n`;

    if (summaryText) {
      markdown += `## Professional Summary\n${summaryText}\n\n`;
    }

    markdown += `## Technical Skills\n${resume.skills.join(', ')}\n\n`;

    markdown += `## Professional Experience\n`;
    for (const exp of resume.experience) {
      markdown += `### ${exp.role} — ${exp.company}\n`;
      if (exp.duration || exp.location) {
        markdown += `*${[exp.duration, exp.location].filter(Boolean).join(' | ')}*\n`;
      }
      for (const bullet of exp.bullets) {
        // Check if there is an accepted rewrite for this bullet
        const rewrite = acceptedSuggestions.find(
          s => s.section === 'experience' && s.original_text.trim() === bullet.trim()
        );
        const textToUse = rewrite ? (rewrite.user_edited_text || rewrite.proposed_text) : bullet;
        markdown += `- ${textToUse}\n`;
      }
      markdown += `\n`;
    }

    if (resume.projects && resume.projects.length > 0) {
      markdown += `## Key Projects\n`;
      for (const proj of resume.projects) {
        const rewrite = acceptedSuggestions.find(
          s => s.section === 'projects' && (s.original_text.includes(proj.name) || proj.description.includes(s.original_text))
        );
        const descToUse = rewrite ? (rewrite.user_edited_text || rewrite.proposed_text) : proj.description;
        markdown += `### ${proj.name} (${proj.technologies.join(', ')})\n`;
        markdown += `${descToUse}\n\n`;
      }
    }

    if (resume.education && resume.education.length > 0) {
      markdown += `## Education\n`;
      for (const edu of resume.education) {
        markdown += `### ${edu.degree} — ${edu.institution}\n`;
        if (edu.year || edu.details) {
          markdown += `*${[edu.year, edu.details].filter(Boolean).join(' | ')}*\n`;
        }
      }
      markdown += `\n`;
    }

    if (resume.certifications && resume.certifications.length > 0) {
      markdown += `## Certifications\n`;
      for (const cert of resume.certifications) {
        markdown += `- ${cert}\n`;
      }
    }

    return NextResponse.json({
      success: true,
      filename: `${resume.contact.name.replace(/\s+/g, '_')}_Resume_Optimized.md`,
      content: markdown
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Export failed' }, { status: 500 });
  }
}

