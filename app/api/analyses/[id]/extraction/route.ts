import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById, saveAnalysis } from '@/lib/db';
import { analyzeResumeAndJD } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysis = getAnalysisById(params.id);
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const body = await req.json();
    const { parsed_resume, parsed_jd } = body;

    if (parsed_resume) {
      analysis.parsed_resume = { ...analysis.parsed_resume, ...parsed_resume };
    }
    if (parsed_jd) {
      analysis.parsed_jd = { ...analysis.parsed_jd, ...parsed_jd };
      if (parsed_jd.title) analysis.role_title = parsed_jd.title;
      if (parsed_jd.company) analysis.target_company = parsed_jd.company;
    }

    // Re-run matching with corrected information
    const { readiness, requirement_matches, ats_diagnostics, is_ai_powered } = await analyzeResumeAndJD(
      analysis.parsed_resume,
      analysis.parsed_jd
    );

    analysis.readiness = readiness;
    analysis.requirement_matches = requirement_matches;
    analysis.ats_diagnostics = ats_diagnostics;
    analysis.is_ai_powered = is_ai_powered;

    saveAnalysis(analysis);

    return NextResponse.json({
      success: true,
      analysis,
      message: 'Extraction corrections saved and analysis recalculated.'
    });
  } catch (error: any) {
    console.error('Error updating extraction:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

