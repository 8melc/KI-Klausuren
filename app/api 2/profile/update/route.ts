import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    // 1. Authentifizierung prüfen
    const user = await getCurrentUser();
    if (!user) {
      console.error('❌ Profile update: Unauthorized - no user');
      return NextResponse.json(
        { error: 'Nicht authentifiziert. Bitte melde dich an.' },
        { status: 401 }
      );
    }

    console.log('🔐 Profile update: User authenticated:', user.id);

    // 2. Request Body parsen
    let body;
    try {
      body = await req.json();
      console.log('📥 Profile update: Request body received:', {
        hasName: !!body.name,
        hasSchool: !!body.school,
        hasSubjects: !!body.subjects,
        hasBundesland: !!body.bundesland,
        subjectsCount: Array.isArray(body.subjects) ? body.subjects.length : 0,
      });
    } catch (parseError) {
      console.error('❌ Profile update: Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Ungültige Anfrage. Bitte versuche es erneut.' },
        { status: 400 }
      );
    }

    const { name, school, subjects, bundesland } = body;

    // 3. Validierung (optional - erlaubt leere Werte, da diese optional sind)
    // Keine strikte Validierung nötig, da alle Felder optional sind

    // 4. Supabase Client erstellen
    const supabase = await createClient();

    // 5. Upsert profile data
    const updateData = {
      id: user.id,
      name: name || null,
      school: school || null,
      subjects: subjects || [],
      bundesland: bundesland || null,
      updated_at: new Date().toISOString(),
    };

    console.log('💾 Profile update: Attempting to upsert:', {
      id: updateData.id,
      hasName: !!updateData.name,
      hasSchool: !!updateData.school,
      subjectsCount: updateData.subjects.length,
      hasBundesland: !!updateData.bundesland,
    });

    const { data, error } = await supabase
      .from('user_profile')
      .upsert(updateData, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Profile update: Database error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      // Spezifischere Fehlermeldungen basierend auf Error-Code
      let errorMessage = 'Fehler beim Speichern des Profils';
      let statusCode = 500;

      if (error.code === '23505') {
        // Unique constraint violation
        errorMessage = 'Ein Profil mit dieser ID existiert bereits.';
        statusCode = 409;
      } else if (error.code === '23503') {
        // Foreign key violation
        errorMessage = 'Ungültige Benutzer-ID. Bitte melde dich erneut an.';
        statusCode = 400;
      } else if (error.code === '42501') {
        // Insufficient privilege (RLS Policy)
        errorMessage = 'Zugriff verweigert. Du kannst nur dein eigenes Profil bearbeiten.';
        statusCode = 403;
      } else if (error.message) {
        errorMessage = `Datenbankfehler: ${error.message}`;
      }

      return NextResponse.json(
        { error: errorMessage, details: error.message, code: error.code },
        { status: statusCode }
      );
    }

    console.log('✅ Profile update: Successfully saved:', {
      id: data?.id,
      name: data?.name,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('❌ Profile update: Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: 'Interner Serverfehler',
        message: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
      { status: 500 }
    );
  }
}
