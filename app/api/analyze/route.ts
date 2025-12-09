import { NextRequest, NextResponse } from 'next/server';
import { analyzeKlausur, analyzeKlausurUniversal } from '@/lib/openai';
import { getCurrentUser } from '@/lib/auth';
import { createClientFromRequest } from '@/lib/supabase/server';
import { executeWithRetry, isJWTExpiredError } from '@/lib/supabase/error-handler';
import type { MasterAnalysisInput } from '@/lib/analysis/types';

export async function POST(request: NextRequest) {
  // Hole aktuellen User direkt (getUser() validiert Token gegen Supabase Server)
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Nicht eingeloggt. Bitte melde dich an.' },
      { status: 401 }
    );
  }

  const supabase = createClientFromRequest(request);

  // Prüfe Credits
  const { data: userData, error: userError } = await executeWithRetry(
    async (client) => {
      const sb = client ?? supabase;
      return await sb
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();
    },
    supabase
  );

  if (userError || !userData) {
    if (isJWTExpiredError(userError)) {
      return NextResponse.json(
        { error: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Fehler beim Laden der Credits' },
      { status: 500 }
    );
  }

  if (userData.credits < 1) {
    return NextResponse.json(
      { 
        error: 'Nicht genug Credits',
        credits: userData.credits,
        message: 'Du hast keine Credits mehr. Bitte kaufe ein Paket mit 25 Klausuren für €7.90.'
      },
      { status: 402 }
    );
  }

  try {
    const body = await request.json();
    const { klausurText, erwartungshorizont, subject, studentName, className, useUniversal } = body;

    if (!klausurText || !erwartungshorizont) {
      return NextResponse.json(
        { error: 'Klausur-Text und Erwartungshorizont sind erforderlich' },
        { status: 400 }
      );
    }

    console.log('Starte Analyse...', {
      klausurTextLength: klausurText.length,
      erwartungshorizontLength: erwartungshorizont.length,
      useUniversal: useUniversal || false,
      studentName: studentName || 'Unbekannt',
    });

    // Verwende neue universelle Analyse wenn useUniversal=true, sonst alte für Rückwärtskompatibilität
    let analysis;
    try {
      if (useUniversal) {
        const input: MasterAnalysisInput = {
          klausurText,
          erwartungshorizont,
          subject,
          studentName,
          className,
        };
        console.log('Verwende universelle Analyse...');
        analysis = await analyzeKlausurUniversal(input);
      } else {
        // Alte Funktion für Rückwärtskompatibilität
        console.log('Verwende alte Analyse-Funktion...');
        analysis = await analyzeKlausur(klausurText, erwartungshorizont);
      }
      console.log('Analyse erfolgreich abgeschlossen:', {
        aufgabenAnzahl: analysis.aufgaben?.length || analysis.tasks?.length || 0,
        erreichtePunkte: analysis.erreichtePunkte || analysis.meta?.achievedPoints || 0,
        maxPunkte: analysis.gesamtpunkte || analysis.meta?.maxPoints || 0,
      });
    } catch (analysisError) {
      console.error('Fehler während der Analyse:', analysisError);
      throw analysisError;
    }

    // Nach erfolgreicher Analyse: Verbrauche 1 Credit via RPC
    const { error: creditError } = await executeWithRetry(
      async (client) => {
        const sb = client ?? supabase;
        return await sb.rpc('add_credits', {
          user_id: user.id,
          amount: -1,
        });
      },
      supabase
    );

    if (creditError) {
      if (isJWTExpiredError(creditError)) {
        // Session expired - aber Analyse war erfolgreich
        // Gib Analyse zurück, aber Frontend sollte User zum Login weiterleiten
        console.warn('Session expired after analysis, but analysis was successful');
      } else {
        console.error('Fehler beim Verbrauchen des Credits:', creditError);
        // Analyse war erfolgreich, aber Credit-Verbrauch fehlgeschlagen
        // Logge Fehler, aber gib Analyse trotzdem zurück
      }
    }

    // Hole verbleibende Credits
    const { data: updatedUser } = await executeWithRetry(
      async (client) => {
        const sb = client ?? supabase;
        return await sb
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single();
      },
      supabase
    );

    const remainingCredits = updatedUser?.credits || 0;
    
    return NextResponse.json({
      ...analysis,
      credits: remainingCredits,
      creditUsed: true
    });
  } catch (error) {
    console.error('Analyze error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to analyze',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.stack : String(error))
          : undefined
      },
      { status: 500 }
    );
  }
}

