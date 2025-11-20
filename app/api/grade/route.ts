import { NextResponse } from 'next/server';
import { gradeKlausur } from '@/lib/grade-klausur';

export async function POST(req: Request) {
  try {
    const { expectationHorizon, gradingRubric, examText, studentAnswers } = await req.json();

    if (!expectationHorizon || !examText || !studentAnswers) {
      return NextResponse.json({ error: 'Fehlende Eingabedaten' }, { status: 400 });
    }

    console.log('Starte Bewertung API...');
    const result = await gradeKlausur({
      expectationHorizon,
      gradingRubric: gradingRubric ?? '',
      examText,
      studentAnswers,
    });
    console.log('Bewertung abgeschlossen:', result.totalPoints, '/', result.maxPoints);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Grading API error:', error);
    return NextResponse.json({ error: 'Bewertung fehlgeschlagen' }, { status: 500 });
  }
}
