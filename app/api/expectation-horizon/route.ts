import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
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
    const { error } = await supabase.from('expectation_horizons').insert({
      user_id: user.id,
      file_name: fileName,
      content: content,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving expectation horizon:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern des Erwartungshorizonts' },
      { status: 500 }
    );
  }
}


