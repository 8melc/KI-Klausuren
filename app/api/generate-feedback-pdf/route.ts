import { NextResponse } from 'next/server';
import { generateFeedbackPdf } from '@/lib/generate-feedback-pdf';
import { checkApiAuth } from '@/lib/auth';

export async function POST(req: Request) {
  // Auth-Check (während Entwicklung deaktiviert)
  const authError = await checkApiAuth();
  if (authError) {
    return authError;
  }

  try {
    const { studentName, klausurTitle, date, gradingResult } = await req.json();

    if (!studentName || !klausurTitle || !gradingResult) {
      return NextResponse.json({ error: 'Fehlende Eingabedaten' }, { status: 400 });
    }

    console.log('Generiere Feedback-PDF via API...');
    const pdfBytes = await generateFeedbackPdf({
      studentName,
      klausurTitle,
      date: date || new Date().toLocaleDateString('de-DE'),
      gradingResult,
    });
    console.log('Feedback-PDF erstellt:', pdfBytes.length, 'bytes');

    const pdfBuffer = Buffer.from(pdfBytes);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${studentName.replace(/\s+/g, '_')}_Bewertung.pdf"`,
      },
    });
  } catch (error) {
    console.error('Feedback-PDF API error:', error);
    return NextResponse.json({ error: 'PDF-Generierung fehlgeschlagen' }, { status: 500 });
  }
}
