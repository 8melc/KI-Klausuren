import { createClient } from '@/lib/supabase/server';
import { executeWithRetry, isJWTExpiredError } from '@/lib/supabase/error-handler';

export interface DashboardStats {
  activeExpectationHorizons: number
  completedCorrections: number
  runningAnalyses: number
  recentCorrections: Array<{
    id: string
    subject: string
    topic: string
    date: string
    students: number
  }>
}

/**
 * Lädt Dashboard-Statistiken für den aktuellen User
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        activeExpectationHorizons: 0,
        completedCorrections: 0,
        runningAnalyses: 0,
        recentCorrections: [],
      }
    }

  // Zähle aktive Erwartungshorizonte
  const { count: expectationCount, error: expectationError } = await executeWithRetry(() =>
    supabase
      .from('expectation_horizons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
  );

  if (isJWTExpiredError(expectationError)) {
    console.warn('Session expired while loading dashboard stats');
  }

  // Zähle abgeschlossene Korrekturen (gesamt)
  const { count: correctionsCount, error: correctionsError } = await executeWithRetry(() =>
    supabase
      .from('corrections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed')
  );

  if (isJWTExpiredError(correctionsError)) {
    console.warn('Session expired while loading dashboard stats');
  }

  // Zähle laufende Analysen
  const { count: runningCount, error: runningError } = await executeWithRetry(() =>
    supabase
      .from('corrections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'processing')
  );

  if (isJWTExpiredError(runningError)) {
    console.warn('Session expired while loading dashboard stats');
  }

  // Hole letzte Korrekturen (gruppiert nach Fach und Datum)
  const { data: recentCorrectionsData, error: recentError } = await executeWithRetry(() =>
    supabase
      .from('corrections')
      .select('id, course_subject, course_grade_level, created_at, student_name')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(20)
  );

  if (isJWTExpiredError(recentError)) {
    console.warn('Session expired while loading dashboard stats');
  }

  // Gruppiere nach Fach und Datum
  const groupedCorrections = new Map<string, { count: number; date: Date; subject: string; grade: string }>()
  
  recentCorrectionsData?.forEach((correction) => {
    const key = `${correction.course_subject}-${new Date(correction.created_at).toLocaleDateString('de-DE')}`
    const existing = groupedCorrections.get(key)
    
    if (existing) {
      existing.count += 1
    } else {
      groupedCorrections.set(key, {
        count: 1,
        date: new Date(correction.created_at),
        subject: correction.course_subject || 'Unbekannt',
        grade: correction.course_grade_level || '',
      })
    }
  })

  const recentCorrections = Array.from(groupedCorrections.values())
    .slice(0, 5)
    .map((item) => ({
      id: item.subject + item.date.toISOString(),
      subject: `${item.subject} ${item.grade ? item.grade : ''}`.trim(),
      topic: 'Klausur', // Könnte später aus analysis extrahiert werden
      date: item.date.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' }),
      students: item.count,
    }))

    return {
      activeExpectationHorizons: expectationCount || 0,
      completedCorrections: correctionsCount || 0,
      runningAnalyses: runningCount || 0,
      recentCorrections,
    }
  } catch (error) {
    // Falls Supabase nicht konfiguriert ist oder ein Fehler auftritt
    console.error('Error loading dashboard stats:', error)
    return {
      activeExpectationHorizons: 0,
      completedCorrections: 0,
      runningAnalyses: 0,
      recentCorrections: [],
    }
  }
}

