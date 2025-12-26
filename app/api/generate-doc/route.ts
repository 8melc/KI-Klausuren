import { NextResponse } from 'next/server';
import { generateFeedbackDoc } from '@/lib/generate-feedback-doc';
import { getCurrentUser } from '@/lib/auth';

// Input-Validierung: Maximale Größen um Server-Crashes zu verhindern
const MAX_TEXT_LENGTH = 1000000; // ~1 MB Text
const MAX_KLASUR_NAME_LENGTH = 200;

export async function POST(req: Request) {
  try {
    // Auth-Check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { klausurName, analysis, courseInfo } = await req.json();

    // Input-Validierung
    if (!analysis) {
      return NextResponse.json({ error: 'Analyse-Daten fehlen' }, { status: 400 });
    }

    // Größen-Validierung: Verhindert Server-Crashes bei riesigen Datenmengen
    if (klausurName && typeof klausurName === 'string' && klausurName.length > MAX_KLASUR_NAME_LENGTH) {
      return NextResponse.json(
        { error: `Klausurname zu lang (max. ${MAX_KLASUR_NAME_LENGTH} Zeichen)` },
        { status: 400 }
      );
    }

    // Prüfe ob analysis ein Objekt ist und nicht zu groß
    if (typeof analysis === 'object' && analysis !== null) {
      const analysisString = JSON.stringify(analysis);
      if (analysisString.length > MAX_TEXT_LENGTH) {
        return NextResponse.json(
          { error: 'Analyse-Daten zu groß. Bitte verwende kürzere Texte.' },
          { status: 400 }
        );
      }
    }

    const docBuffer = await generateFeedbackDoc({
      klausurName: klausurName || 'Klausur',
      analysis,
      courseInfo,
    });

    const safeName = (klausurName || 'Klausur').replace(/[^a-zA-Z0-9_-]+/g, '_');

    return new NextResponse(docBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeName}_Bewertung.docx"`,
      },
    });
  } catch (error) {
    console.error('Generate DOC error:', error);
    return NextResponse.json({ error: 'Word-Dokument konnte nicht erstellt werden' }, { status: 500 });
  }
}
