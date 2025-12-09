import { NextRequest, NextResponse } from 'next/server';
import { createClientFromRequest } from '@/lib/supabase/server';
import { executeWithRetry, isJWTExpiredError } from '@/lib/supabase/error-handler';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClientFromRequest(request);
    
    // Hole User - getUser() refresht automatisch die Session, wenn nötig
    // Kein manueller refreshSession() Aufruf, da das zu "Invalid Refresh Token" Fehlern führen kann
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const { fileName, content } = await request.json();

    if (!fileName || !content) {
      return NextResponse.json(
        { error: 'Dateiname und Inhalt erforderlich' },
        { status: 400 }
      );
    }

    // Speichere Erwartungshorizont
    type ExpectationHorizonInsertResult = unknown;
    const { error } = await executeWithRetry<ExpectationHorizonInsertResult>(
      async (client) => {
        const sb = client ?? supabase;
        return await sb.from('expectation_horizons').insert({
          user_id: user.id,
          file_name: fileName,
          content: content,
        });
      },
      supabase
    );

    if (error) {
      if (isJWTExpiredError(error)) {
        return NextResponse.json(
          { error: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.' },
          { status: 401 }
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving expectation horizon:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern des Erwartungshorizonts' },
      { status: 500 }
    );
  }
}


