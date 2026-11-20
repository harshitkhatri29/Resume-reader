import { NextRequest, NextResponse } from 'next/server';
import { updateResumeSuggestion } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { suggestionId, status, userEditedText } = body;

    if (!suggestionId || !status) {
      return NextResponse.json({ error: 'Missing suggestionId or status' }, { status: 400 });
    }

    const updated = updateResumeSuggestion(params.id, suggestionId, status, userEditedText);
    if (!updated) {
      return NextResponse.json({ error: 'Revision or suggestion not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      revision: updated
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

