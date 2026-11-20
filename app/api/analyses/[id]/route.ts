import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById, deleteAnalysis, getRoadmapByAnalysisId, getResumeRevision } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysis = getAnalysisById(params.id);
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const roadmap = getRoadmapByAnalysisId(params.id);
    const revision = getResumeRevision(params.id);

    return NextResponse.json({
      analysis,
      roadmap,
      revision
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = deleteAnalysis(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Analysis and linked data deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

