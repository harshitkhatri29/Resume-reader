import { NextRequest, NextResponse } from 'next/server';
import { deleteAnalysis, getAllAnalyses } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const all = getAllAnalyses();
    const target = all.find(a => a.resume_id === params.id || a.id === params.id);
    if (!target) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    deleteAnalysis(target.id);

    return NextResponse.json({
      success: true,
      message: 'Resume and associated analysis permanently deleted.'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

