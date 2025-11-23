import { NextResponse } from 'next/server';
import { extractHandwrittenPdfText } from '@/lib/handwritten-pdf';
import { checkApiAuth } from '@/lib/auth';

export async function POST(req: Request) {
  // Auth-Check (während Entwicklung deaktiviert)
  const authError = await checkApiAuth();
  if (authError) {
    return authError;
  }

  try {
    const arrayBuffer = await req.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    if (uint8.length === 0) {
      return NextResponse.json({ error: 'Keine PDF-Daten im Request-Body gefunden' }, { status: 400 });
    }

    console.log('Starte Handschrift-Extraktion via API...');
    const text = await extractHandwrittenPdfText(uint8);
    console.log('Extraktion erfolgreich:', text.length, 'Zeichen');

    return NextResponse.json({ text }, { status: 200 });
  } catch (error) {
    console.error('Extract-Klausur API error:', error);
    return NextResponse.json({ error: 'Handschrift-Extraktion fehlgeschlagen' }, { status: 500 });
  }
}
