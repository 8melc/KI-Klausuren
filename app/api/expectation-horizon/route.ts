import { NextRequest, NextResponse } from 'next/server';
import { createClientFromRequest } from '@/lib/supabase/server';
import { executeWithRetry, isJWTExpiredError } from '@/lib/supabase/error-handler';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClientFromRequest(request);
    
    // 1. Versuche Session zu holen
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    // 2. Wenn keine Session, versuche zu refreshen
    let validSession = session;
    if (!validSession) {
      console.log('Keine Session gefunden, versuche zu refreshen...');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('Session refresh fehlgeschlagen:', refreshError);
        return NextResponse.json(
          { error: 'Deine Sitzung ist abgelaufen. Bitte melde dich neu an.' },
          { status: 401 }
        );
      }
      
      validSession = refreshData.session;
    }

    // 3. Hole User mit der gültigen Session
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
    const { error } = await executeWithRetry(
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


