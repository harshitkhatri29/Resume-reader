import { NextResponse } from 'next/server';
import { isGeminiConfigured } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    gemini_configured: isGeminiConfigured()
  });
}

