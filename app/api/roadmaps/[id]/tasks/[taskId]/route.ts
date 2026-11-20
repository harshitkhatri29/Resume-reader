import { NextRequest, NextResponse } from 'next/server';
import { updateRoadmapTask } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const body = await req.json();
    const { completed, evidence_notes, evidence_url } = body;

    const updates: Record<string, any> = {};
    if (typeof completed === 'boolean') {
      updates.completed = completed;
      updates.completed_at = completed ? new Date().toISOString() : undefined;
    }
    if (evidence_notes !== undefined) {
      updates.evidence_notes = evidence_notes;
    }
    if (evidence_url !== undefined) {
      updates.evidence_url = evidence_url;
    }

    const updatedRoadmap = updateRoadmapTask(params.id, params.taskId, updates);
    if (!updatedRoadmap) {
      return NextResponse.json({ error: 'Task or roadmap not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      roadmap: updatedRoadmap
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

