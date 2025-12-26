import { NextRequest, NextResponse } from 'next/server';
import { createClientFromRequest } from '@/lib/supabase/server';

// Whitelist der erlaubten Felder
const ALLOWED_FIELDS = ['name', 'school', 'subjects', 'bundesland'] as const;
const MAX_STRING_LENGTH = 500; // Max Länge für String-Felder
const MAX_SUBJECTS = 50; // Max Anzahl Fächer

export async function POST(req: NextRequest) {
  try {
    const supabase = createClientFromRequest(req);

    // 1. Auth JWT vorhanden und gültig (401 wenn nicht)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('[Profile Update] Auth error:', userError);
      return NextResponse.json(
        { error: 'Nicht authentifiziert', details: userError.message },
        { status: 401 }
      );
    }
    if (!user) {
      console.error('[Profile Update] User not authenticated');
      return NextResponse.json(
        { error: 'Nicht authentifiziert. Bitte melde dich erneut an.' },
        { status: 401 }
      );
    }

    // Request-Body parsen
    const body = await req.json();

    // 2. Whitelisted Felder nur (400 bei extra keys)
    const bodyKeys = Object.keys(body);
    const extraKeys = bodyKeys.filter(key => !ALLOWED_FIELDS.includes(key as any));
    if (extraKeys.length > 0) {
      console.warn('[Profile Update] Extra keys detected:', extraKeys);
      return NextResponse.json(
        { 
          error: 'Ungültige Felder im Request',
          details: `Folgende Felder sind nicht erlaubt: ${extraKeys.join(', ')}`,
          allowedFields: ALLOWED_FIELDS
        },
        { status: 400 }
      );
    }

    // 3. Datentypen validiert (arrays, strings length)
    const updateData: Record<string, unknown> = {};
    
    // Validierung und Bereinigung der Felder
    if ('name' in body) {
      if (body.name !== null && body.name !== undefined) {
        if (typeof body.name !== 'string') {
          return NextResponse.json(
            { error: 'name muss ein String sein' },
            { status: 400 }
          );
        }
        if (body.name.length > MAX_STRING_LENGTH) {
          return NextResponse.json(
            { error: `name darf maximal ${MAX_STRING_LENGTH} Zeichen lang sein` },
            { status: 400 }
          );
        }
      }
      updateData.name = body.name || null;
    }

    if ('school' in body) {
      if (body.school !== null && body.school !== undefined) {
        if (typeof body.school !== 'string') {
          return NextResponse.json(
            { error: 'school muss ein String sein' },
            { status: 400 }
          );
        }
        if (body.school.length > MAX_STRING_LENGTH) {
          return NextResponse.json(
            { error: `school darf maximal ${MAX_STRING_LENGTH} Zeichen lang sein` },
            { status: 400 }
          );
        }
      }
      updateData.school = body.school || null;
    }

    if ('bundesland' in body) {
      if (body.bundesland !== null && body.bundesland !== undefined) {
        if (typeof body.bundesland !== 'string') {
          return NextResponse.json(
            { error: 'bundesland muss ein String sein' },
            { status: 400 }
          );
        }
        if (body.bundesland.length > MAX_STRING_LENGTH) {
          return NextResponse.json(
            { error: `bundesland darf maximal ${MAX_STRING_LENGTH} Zeichen lang sein` },
            { status: 400 }
          );
        }
      }
      updateData.bundesland = body.bundesland || null;
    }

    if ('subjects' in body) {
      if (body.subjects !== null && body.subjects !== undefined) {
        if (!Array.isArray(body.subjects)) {
          return NextResponse.json(
            { error: 'subjects muss ein Array sein' },
            { status: 400 }
          );
        }
        if (body.subjects.length > MAX_SUBJECTS) {
          return NextResponse.json(
            { error: `subjects darf maximal ${MAX_SUBJECTS} Einträge enthalten` },
            { status: 400 }
          );
        }
        // Prüfe, dass alle Array-Elemente Strings sind
        if (!body.subjects.every((s: unknown) => typeof s === 'string')) {
          return NextResponse.json(
            { error: 'Alle Einträge in subjects müssen Strings sein' },
            { status: 400 }
          );
        }
        // Prüfe Länge jedes Strings
        if (body.subjects.some((s: string) => s.length > MAX_STRING_LENGTH)) {
          return NextResponse.json(
            { error: `Jeder Eintrag in subjects darf maximal ${MAX_STRING_LENGTH} Zeichen lang sein` },
            { status: 400 }
          );
        }
      }
      updateData.subjects = body.subjects || [];
    }

    // Prüfe, ob überhaupt Felder zum Aktualisieren vorhanden sind
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Keine aktualisierbaren Felder angegeben' },
        { status: 400 }
      );
    }

    // updated_at setzen
    updateData.updated_at = new Date().toISOString();

    console.log('[Profile Update] Request:', { userId: user.id, updateFields: Object.keys(updateData) });

    // 4. auth.uid() mit target user id übereinstimmend (403 bei Mismatch)
    // RLS deckt das bereits ab, aber explizite Prüfung für besseres Error-Handling
    // (wird durch .eq('id', user.id) sichergestellt)

    // Versuche ein Update auf public.users
    const { data: updatedRows, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select('id')
      .maybeSingle();

    if (updateError) {
      console.error('[Profile Update] Database error:', updateError);
      
      // 5. RLS-Policy-Fehler (42501) = 403
      if (updateError.code === '42501') {
        return NextResponse.json(
          {
            error: 'Keine Berechtigung zum Aktualisieren des Profils',
            details: 'Du kannst nur dein eigenes Profil aktualisieren',
            code: updateError.code,
          },
          { status: 403 }
        );
      }
      
      // Detailliertere Fehlermeldung basierend auf dem Fehlertyp
      let errorMessage = 'Fehler beim Speichern des Profils';
      let statusCode = 500;
      
      if (updateError.code === '23503') {
        errorMessage = 'Ungültige Benutzer-ID. Bitte melde dich erneut an.';
        statusCode = 400;
      } else if (updateError.message) {
        errorMessage = `Fehler beim Speichern: ${updateError.message}`;
      }
      
      return NextResponse.json(
        {
          error: errorMessage,
          details: updateError.message,
          code: updateError.code,
        },
        { status: statusCode }
      );
    }

    // Falls kein Eintrag existierte, lege einen neuen an (Fallback)
    // note: ggf. trigger/foreign keys berücksichtigen
    if (!updatedRows) {
      console.warn('[Profile Update] No user record found for update, attempting to create...');
      const insertPayload: Record<string, unknown> = {
        id: user.id,
        credits: 0, // Default credits
        ...updateData,
      };
      const { data: inserted, error: insertError } = await supabase
        .from('users')
        .insert(insertPayload)
        .select('id')
        .maybeSingle();

      if (insertError) {
        console.error('[Profile Update] Insert error:', insertError);
        
        if (insertError.code === '42501') {
          return NextResponse.json(
            {
              error: 'Keine Berechtigung zum Erstellen des Profils',
              details: insertError.message,
              code: insertError.code,
            },
            { status: 403 }
          );
        }
        
        return NextResponse.json(
          {
            error: 'Fehler beim Erstellen des Profils. Bitte kontaktiere den Support.',
            details: insertError.message,
            code: insertError.code,
          },
          { status: 500 }
        );
      }
      console.log('[Profile Update] Profile created successfully:', inserted);
      return NextResponse.json({ ok: true, status: 'inserted' }, { status: 201 });
    }

    console.log('[Profile Update] Profile updated successfully');
    return NextResponse.json({ ok: true, status: 'updated' }, { status: 200 });
  } catch (err: any) {
    console.error('[Profile Update] Unexpected error:', err);
    
    // Prüfe, ob es ein JSON-Parsing-Fehler ist
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Ungültige JSON-Daten im Request' },
        { status: 400 }
      );
    }
    
    // 6. Fehlercodes und Logs für Debugging (400/401/403/500)
    return NextResponse.json(
      {
        error: 'Interner Serverfehler',
        details: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}

// 7. Optional: Rate limit + CSRF protection
// TODO: Rate limiting kann später mit z.B. @upstash/ratelimit hinzugefügt werden
// TODO: CSRF-Protection kann mit next-csrf oder ähnlichen Libraries implementiert werden
