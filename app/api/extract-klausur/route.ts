import { NextRequest, NextResponse } from 'next/server';
import { extractHandwrittenPdfText } from '@/lib/handwritten-pdf';
import { checkApiAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const authError = await checkApiAuth();
  if (authError) {
    return authError;
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Nur PDF-Dateien sind erlaubt' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    if (uint8.length === 0) {
      return NextResponse.json({ error: 'Leere Datei' }, { status: 400 });
    }

    const text = await extractHandwrittenPdfText(uint8);

    return NextResponse.json(
      {
        text,
        filename: file.name,
        size: file.size,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Extract-Klausur API error:', error);
    return NextResponse.json({ error: 'Handschrift-Extraktion fehlgeschlagen' }, { status: 500 });
  }
}
