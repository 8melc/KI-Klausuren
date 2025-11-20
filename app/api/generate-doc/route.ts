import { NextResponse } from 'next/server';
import { generateFeedbackDoc } from '@/lib/generate-feedback-doc';

export async function POST(req: Request) {
  try {
    const { klausurName, analysis } = await req.json();

    if (!analysis) {
      return NextResponse.json({ error: 'Analyse-Daten fehlen' }, { status: 400 });
    }

    const docBuffer = await generateFeedbackDoc({
      klausurName: klausurName || 'Klausur',
      analysis,
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
