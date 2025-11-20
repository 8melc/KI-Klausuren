import { NextRequest, NextResponse } from 'next/server';
import { extractPdfText } from '@/lib/pdf';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Keine Datei hochgeladen' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Nur PDF-Dateien sind erlaubt' },
        { status: 400 }
      );
    }

    // PDF in Buffer konvertieren
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const text = await extractPdfText(buffer);

    return NextResponse.json({ 
      text,
      filename: file.name,
      size: file.size 
    });
  } catch (error) {
    console.error('Extract error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract PDF' },
      { status: 500 }
    );
  }
}
