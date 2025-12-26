import { createClient } from '@/lib/supabase/server';
import { executeWithRetry, isJWTExpiredError } from '@/lib/supabase/error-handler';

export interface DashboardStats {
  activeExpectationHorizons: number
  completedCorrections: number
  runningAnalyses: number
  thisWeek: number
  recentCorrections: Array<{
    id: string
    subject: string
    grade: string
    topic: string
    date: string
    students: number
    status: 'completed' | 'processing' | 'error' | 'pending'
    completedWorks?: number
    errorMessage?: string
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
        thisWeek: 0,
        recentCorrections: [],
      }
    }

  // Zähle aktive Erwartungshorizonte
  const { count: expectationCount, error: expectationError } = await supabase
    .from('expectation_horizons')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (expectationError) {
    console.error('Fehler beim Laden der Dashboard-Zahlen (Erwartungshorizonte):', expectationError);
  }

  // Zähle abgeschlossene Korrekturen (gesamt)
  const { count: correctionsCount, error: correctionsError } = await supabase
    .from('corrections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed');

  if (correctionsError) {
    console.error('Fehler beim Laden der Dashboard-Zahlen (Korrekturen):', correctionsError);
  }

  // Zähle laufende Analysen
  const { count: runningCount, error: runningError } = await supabase
    .from('corrections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'processing');

  if (runningError) {
    console.error('Fehler beim Laden der Dashboard-Zahlen (laufende Analysen):', runningError);
  }

  // Zähle Korrekturen dieser Woche (letzte 7 Tage)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const { count: thisWeekCount, error: thisWeekError } = await supabase
    .from('corrections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('created_at', oneWeekAgo.toISOString());

  if (thisWeekError) {
    console.error('Fehler beim Laden der Dashboard-Zahlen (diese Woche):', thisWeekError);
  }

  // Hole letzte Korrekturen (alle Status, nicht nur completed)
  const { data: recentCorrectionsData, error: recentError } = await executeWithRetry(async () => {
    const result = await supabase
      .from('corrections')
      .select('id, course_subject, course_grade_level, created_at, student_name, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    return { data: result.data, error: result.error };
  });

  if (isJWTExpiredError(recentError)) {
    console.warn('Session expired while loading dashboard stats');
  }

  // Gruppiere nach Fach, Datum und Status
  const groupedCorrections = new Map<string, { 
    count: number; 
    date: Date; 
    subject: string; 
    grade: string;
    status: 'completed' | 'processing' | 'error' | 'pending';
    ids: string[];
  }>()
  
  recentCorrectionsData?.forEach((correction: { 
    id: string;
    course_subject: string | null; 
    created_at: string; 
    course_grade_level: string | null;
    status: string;
  }) => {
    const correctionDate = new Date(correction.created_at);
    const key = `${correction.course_subject}-${correctionDate.toLocaleDateString('de-DE')}-${correction.status}`
    const existing = groupedCorrections.get(key)
    
    if (existing) {
      existing.count += 1
      existing.ids.push(correction.id)
      // Verwende den neuesten Status, wenn unterschiedlich
      if (correction.status === 'error' || (correction.status === 'processing' && existing.status === 'completed')) {
        existing.status = correction.status as 'completed' | 'processing' | 'error' | 'pending'
      }
    } else {
      groupedCorrections.set(key, {
        count: 1,
        date: correctionDate,
        subject: correction.course_subject || 'Unbekannt',
        grade: correction.course_grade_level || '',
        status: (correction.status || 'pending') as 'completed' | 'processing' | 'error' | 'pending',
        ids: [correction.id],
      })
    }
  })

  const recentCorrections = Array.from(groupedCorrections.values())
    .sort((a, b) => b.date.getTime() - a.date.getTime()) // Sortiere nach Datum (neueste zuerst)
    .slice(0, 5)
    .map((item) => ({
      id: item.ids[0], // Verwende die erste ID als Haupt-ID
      subject: item.subject,
      grade: item.grade,
      topic: 'Klausur', // Könnte später aus analysis extrahiert werden
      date: item.date.toISOString(), // ISO format für Komponente
      students: item.count,
      status: item.status,
      completedWorks: item.status === 'completed' ? item.count : 0,
      errorMessage: item.status === 'error' ? 'Fehler bei der Verarbeitung' : undefined,
    }))

    return {
      activeExpectationHorizons: expectationCount ?? 0,
      completedCorrections: correctionsCount ?? 0,
      runningAnalyses: runningCount ?? 0,
      thisWeek: thisWeekCount ?? 0,
      recentCorrections,
    }
  } catch (error) {
    // Falls Supabase nicht konfiguriert ist oder ein Fehler auftritt
    console.error('Error loading dashboard stats:', error)
    return {
      activeExpectationHorizons: 0,
      completedCorrections: 0,
      runningAnalyses: 0,
      thisWeek: 0,
      recentCorrections: [],
    }
  }
}

