import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById, getRoadmapByAnalysisId, saveRoadmap } from '@/lib/db';
import { generateRoadmapFromAnalysis } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roadmap = getRoadmapByAnalysisId(params.id);
    if (!roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }
    return NextResponse.json(roadmap);
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

    const body = await req.json().catch(() => ({}));
    const weeklyHours = typeof body.weeklyHours === 'number' ? body.weeklyHours : 8;

    const roadmap = await generateRoadmapFromAnalysis(
      analysis.id,
      analysis.role_title,
      analysis.target_company,
      weeklyHours,
      analysis.requirement_matches
    );

    saveRoadmap(roadmap);

    return NextResponse.json({
      success: true,
      roadmap
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

