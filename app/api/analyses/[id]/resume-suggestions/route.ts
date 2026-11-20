import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById, getResumeRevision, saveResumeRevision } from '@/lib/db';
import { generateResumeSuggestionsFromAnalysis } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const revision = getResumeRevision(params.id);
    if (!revision) {
      return NextResponse.json({ error: 'Resume revision not found' }, { status: 404 });
    }
    return NextResponse.json(revision);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysis = getAnalysisById(params.id);
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const revision = await generateResumeSuggestionsFromAnalysis(
      analysis.id,
      analysis.resume_id,
      analysis.parsed_resume,
      analysis.parsed_jd
    );

    saveResumeRevision(revision);

    return NextResponse.json({
      success: true,
      revision
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

