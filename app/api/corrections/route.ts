import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
    const supabase = await createClient();
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
    const { data: existing } = await supabase
      .from('corrections')
      .select('id')
      .eq('user_id', userId)
      .eq('id', body.id)
      .maybeSingle();

    if (existing) {
      // Update bestehende Korrektur
      const { error } = await supabase
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
        .eq('user_id', userId);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
    } else {
      // Erstelle neue Korrektur mit der ID aus dem Frontend
      const { error } = await supabase.from('corrections').insert({
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
      });

      if (error) {
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

