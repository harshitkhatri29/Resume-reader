import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile, parseResumeText, parseJobDescription } from '@/lib/parser';
import { analyzeResumeAndJD, generateRoadmapFromAnalysis, generateResumeSuggestionsFromAnalysis } from '@/lib/gemini';
import { saveAnalysis, saveRoadmap, saveResumeRevision, getAllAnalyses } from '@/lib/db';
import { Analysis } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const analyses = getAllAnalyses();
    return NextResponse.json(analyses);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to retrieve analyses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get('resume') as File | null;
    const resumeTextRaw = formData.get('resume_text') as string | null;
    const jdText = formData.get('jd') as string | null;
    const targetTitle = (formData.get('title') as string | null) || '';
    const targetCompany = (formData.get('company') as string | null) || '';

    if (!jdText || jdText.trim().length < 15) {
      return NextResponse.json(
        { error: 'Please provide a valid Job Description (minimum 15 characters).' },
        { status: 400 }
      );
    }

    let resumeText = '';
    let filename = 'Pasted_Resume.txt';

    if (resumeFile && resumeFile.size > 0) {
      if (resumeFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'File size exceeds maximum limit of 10MB.' },
          { status: 400 }
        );
      }
      filename = resumeFile.name;
      const arrayBuffer = await resumeFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      resumeText = await extractTextFromFile(buffer, filename, resumeFile.type);
    } else if (resumeTextRaw && resumeTextRaw.trim().length > 20) {
      resumeText = resumeTextRaw.trim();
    } else {
      return NextResponse.json(
        { error: 'Please upload a resume file (PDF/DOCX) or paste your resume text.' },
        { status: 400 }
      );
    }

    if (!resumeText || resumeText.trim().length < 20) {
      return NextResponse.json(
        { error: 'Could not extract sufficient text from your resume. Please check the file or paste the text directly.' },
        { status: 422 }
      );
    }

    // 1. Structured parse of Resume & JD
    const parsedResume = parseResumeText(resumeText);
    const parsedJD = parseJobDescription(jdText);
    if (targetTitle.trim()) parsedJD.title = targetTitle.trim();
    if (targetCompany.trim()) parsedJD.company = targetCompany.trim();

    // 2. Perform Requirement Matching & ATS Diagnostics
    const { readiness, requirement_matches, ats_diagnostics, is_ai_powered } = await analyzeResumeAndJD(
      parsedResume,
      parsedJD
    );

    const analysisId = `analysis-${Date.now()}`;
    const resumeId = `res-${Date.now()}`;
    const jobTargetId = `jd-${Date.now()}`;

    const analysis: Analysis = {
      id: analysisId,
      resume_id: resumeId,
      job_target_id: jobTargetId,
      role_title: parsedJD.title,
      target_company: parsedJD.company,
      created_at: new Date().toISOString(),
      status: 'completed',
      is_ai_powered,
      parsed_resume: parsedResume,
      parsed_jd: parsedJD,
      readiness,
      requirement_matches,
      ats_diagnostics
    };

    saveAnalysis(analysis);

    // 3. Pre-generate Roadmap & Resume suggestions
    const roadmap = await generateRoadmapFromAnalysis(
      analysisId,
      parsedJD.title,
      parsedJD.company,
      8,
      requirement_matches
    );
    saveRoadmap(roadmap);

    const revision = await generateResumeSuggestionsFromAnalysis(
      analysisId,
      resumeId,
      parsedResume,
      parsedJD
    );
    saveResumeRevision(revision);

    return NextResponse.json({
      id: analysisId,
      analysis,
      roadmap,
      revision,
      is_ai_powered,
      message: 'Analysis successfully generated'
    });
  } catch (error: any) {
    console.error('Error generating analysis:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during analysis.' },
      { status: 500 }
    );
  }
}

