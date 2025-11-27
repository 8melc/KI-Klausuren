import { NextRequest, NextResponse } from 'next/server';
import { analyzeKlausur, analyzeKlausurUniversal } from '@/lib/openai';
import { checkApiAuth, getCurrentUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { MasterAnalysisInput } from '@/lib/analysis/types';

export async function POST(request: NextRequest) {
  // Auth-Check (während Entwicklung deaktiviert)
  const authError = await checkApiAuth();
  if (authError) {
    return authError;
  }

  // Hole aktuellen User
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const supabase = await createClient();

  // Prüfe Credits
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
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

    // Verwende neue universelle Analyse wenn useUniversal=true, sonst alte für Rückwärtskompatibilität
    let analysis;
    if (useUniversal) {
      const input: MasterAnalysisInput = {
        klausurText,
        erwartungshorizont,
        subject,
        studentName,
        className,
      };
      analysis = await analyzeKlausurUniversal(input);
    } else {
      // Alte Funktion für Rückwärtskompatibilität
      analysis = await analyzeKlausur(klausurText, erwartungshorizont);
    }

    // Nach erfolgreicher Analyse: Verbrauche 1 Credit via RPC
    const { error: creditError } = await supabase.rpc('add_credits', {
      user_id: user.id,
      amount: -1,
    });

    if (creditError) {
      console.error('Fehler beim Verbrauchen des Credits:', creditError);
      // Analyse war erfolgreich, aber Credit-Verbrauch fehlgeschlagen
      // Logge Fehler, aber gib Analyse trotzdem zurück
    }

    // Hole verbleibende Credits
    const { data: updatedUser } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single();

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

