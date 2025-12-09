import { NextRequest, NextResponse } from 'next/server';
import { createClientFromRequest } from '@/lib/supabase/server';
import { executeWithRetry, isJWTExpiredError } from '@/lib/supabase/error-handler';
import type { CourseInfo, ResultStatus } from '@/types/results';
import type { KlausurAnalyse } from '@/lib/openai';

// Mappt Frontend-Status zu Datenbank-Status
function mapStatusToDb(status: ResultStatus): string {
  switch (status) {
    case 'Analyse läuft…':
      return 'processing';
    case 'Bereit':
      return 'completed';
    case 'Fehler':
      return 'error';
    default:
      return 'pending';
  }
}

interface SaveCorrectionRequest {
  id: string;
  studentName: string;
  fileName: string;
  course: CourseInfo;
  status: ResultStatus;
  analysis?: KlausurAnalyse;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClientFromRequest(request);
    
    // 1. Versuche Session zu holen
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError);
    }

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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
    }

    if (!user) {
      console.warn('No user found - returning 401');
      // Während Entwicklung: erlaube auch ohne Auth (für Testing)
      // In Production sollte das entfernt werden
      const AUTH_REQUIRED = process.env.AUTH_REQUIRED !== 'false';
      if (AUTH_REQUIRED) {
        return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
      }
    }

    const body: SaveCorrectionRequest = await request.json();
    console.log('Saving correction:', { id: body.id, fileName: body.fileName, status: body.status });

    // Prüfe ob Korrektur bereits existiert
    // Type Guard: user muss hier definiert sein
    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    
    const userId = user.id;
    const { data: existing, error: queryError } = await executeWithRetry(() =>
      supabase
        .from('corrections')
        .select('id')
        .eq('user_id', userId)
        .eq('id', body.id)
        .maybeSingle()
    );

    if (queryError) {
      if (isJWTExpiredError(queryError)) {
        return NextResponse.json(
          { error: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.' },
          { status: 401 }
        );
      }
      console.error('Supabase query error:', queryError);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Korrektur' },
        { status: 500 }
      );
    }

    if (existing) {
      // Update bestehende Korrektur
      const { error } = await executeWithRetry(() =>
        supabase
          .from('corrections')
          .update({
            student_name: body.studentName,
            file_name: body.fileName,
            course_subject: body.course.subject,
            course_grade_level: body.course.gradeLevel,
            course_class_name: body.course.className,
            course_school_year: body.course.schoolYear,
            status: mapStatusToDb(body.status),
            analysis: body.analysis || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', body.id)
          .eq('user_id', userId)
          .select()
      );

      if (error) {
        if (isJWTExpiredError(error)) {
          return NextResponse.json(
            { error: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.' },
            { status: 401 }
          );
        }
        console.error('Supabase update error:', error);
        throw error;
      }
    } else {
      // Erstelle neue Korrektur mit der ID aus dem Frontend
      const { error } = await executeWithRetry(() =>
        supabase.from('corrections').insert({
          id: body.id,
          user_id: userId,
          student_name: body.studentName,
          file_name: body.fileName,
          course_subject: body.course.subject,
          course_grade_level: body.course.gradeLevel,
          course_class_name: body.course.className,
          course_school_year: body.course.schoolYear,
          status: mapStatusToDb(body.status),
          analysis: body.analysis || null,
        })
      );

      if (error) {
        if (isJWTExpiredError(error)) {
          return NextResponse.json(
            { error: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.' },
            { status: 401 }
          );
        }
        console.error('Supabase insert error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      console.log('Korrektur erfolgreich gespeichert:', body.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error saving correction:', error);
    console.error('Error message:', error?.message);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { 
        error: 'Fehler beim Speichern der Korrektur',
        details: error?.message || 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

