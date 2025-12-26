import { NextResponse } from 'next/server';
import { gradeKlausur } from '@/lib/grade-klausur';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { executeWithRetry, isJWTExpiredError } from '@/lib/supabase/error-handler';

type UserRow = { credits: number };

export async function POST(req: Request) {
  try {
    // 1. Auth-Check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Credits prüfen – ABER noch NICHT abziehen
    const supabase = await createClient();
    const {
      data: userData,
      error: userError,
    } = await executeWithRetry<UserRow | null>(async (client) => {
      const sb = client ?? supabase;
      return await sb
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();
    }, supabase);

    if (userError || !userData) {
      if (isJWTExpiredError(userError)) {
        return NextResponse.json(
          { error: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Fehler beim Laden der Credits.' },
        { status: 500 }
      );
    }

    if (userData.credits < 1) {
      return NextResponse.json(
        {
          error: 'Nicht genug Credits',
          credits: userData.credits,
          message: 'Du hast keine Credits mehr. Bitte kaufe ein Paket mit 25 Klausuren für 7,90 €.',
        },
        { status: 402 }
      );
    }

    // 3. Input-Validierung
    const { expectationHorizon, gradingRubric, examText, studentAnswers } = await req.json();

    if (!expectationHorizon || !examText || !studentAnswers) {
      return NextResponse.json({ error: 'Fehlende Eingabedaten' }, { status: 400 });
    }

    // Input-Größen-Validierung (verhindert Server-Crashes)
    const MAX_TEXT_LENGTH = 500000; // ~500 KB Text
    if (
      expectationHorizon.length > MAX_TEXT_LENGTH ||
      examText.length > MAX_TEXT_LENGTH ||
      studentAnswers.length > MAX_TEXT_LENGTH
    ) {
      return NextResponse.json(
        { error: 'Eingabedaten zu groß. Bitte verwende kürzere Texte.' },
        { status: 400 }
      );
    }

    // 4. Bewertung durchführen
    console.log('Starte Bewertung API...');
    const result = await gradeKlausur({
      expectationHorizon,
      gradingRubric: gradingRubric ?? '',
      examText,
      studentAnswers,
    });
    console.log('Bewertung abgeschlossen:', result.totalPoints, '/', result.maxPoints);

    // 5. Credits NUR JETZT, nach Erfolg, abziehen
    let creditDeducted = false;
    const { error: creditError } = await executeWithRetry(async (client) => {
      const sb = client ?? supabase;
      return await sb.rpc('add_credits', {
        user_id: user.id,
        amount: -1,
      });
    }, supabase);

    if (creditError) {
      if (isJWTExpiredError(creditError)) {
        console.warn('Session expired after grading, but grading was successful');
      } else {
        console.error('Fehler beim Verbrauchen des Credits', creditError);
      }
    } else {
      creditDeducted = true;
    }

    return NextResponse.json({
      ...result,
      creditUsed: creditDeducted,
    }, { status: 200 });
  } catch (error) {
    console.error('Grading API error:', error);
    return NextResponse.json({ error: 'Bewertung fehlgeschlagen' }, { status: 500 });
  }
}
