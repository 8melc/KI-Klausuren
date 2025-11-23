import { NextRequest, NextResponse } from 'next/server';
import { createPDF } from '@/lib/pdf-generator';
import { checkApiAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Auth-Check (während Entwicklung deaktiviert)
  const authError = await checkApiAuth();
  if (authError) {
    return authError;
  }

  try {
    const body = await request.json();
    const { text, corrections } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text ist erforderlich' },
        { status: 400 }
      );
    }

    const pdfBuffer = await createPDF({
      text,
      corrections: corrections || [],
    });

    // PDF als Base64 zurückgeben für Frontend-Download
    const base64 = pdfBuffer.toString('base64');

    return NextResponse.json({
      pdf: base64,
      filename: 'korrigierte_klausur.pdf',
    });
  } catch (error) {
    console.error('Generate PDF error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
