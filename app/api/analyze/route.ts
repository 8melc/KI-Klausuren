import { NextRequest, NextResponse } from 'next/server';
import { analyzeKlausur } from '@/lib/openai';
import { checkApiAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Auth-Check (während Entwicklung deaktiviert)
  const authError = await checkApiAuth();
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();
    const { klausurText, erwartungshorizont } = body;

    if (!klausurText || !erwartungshorizont) {
      return NextResponse.json(
        { error: 'Klausur-Text und Erwartungshorizont sind erforderlich' },
        { status: 400 }
      );
    }

    const analysis = await analyzeKlausur(klausurText, erwartungshorizont);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze' },
      { status: 500 }
    );
  }
}

