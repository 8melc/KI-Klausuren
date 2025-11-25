import { createClient } from '@/lib/supabase/server'

export interface DashboardStats {
  activeExpectationHorizons: number
  completedCorrections: number
  exportedReports: number
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
        exportedReports: 0,
        recentCorrections: [],
      }
    }

  // Zähle aktive Erwartungshorizonte
  const { count: expectationCount } = await supabase
    .from('expectation_horizons')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Zähle abgeschlossene Korrekturen (dieses Monat)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: correctionsCount } = await supabase
    .from('corrections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('created_at', startOfMonth.toISOString())

  // Zähle Exporte (alle abgeschlossenen Korrekturen)
  const { count: exportsCount } = await supabase
    .from('corrections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  // Hole letzte Korrekturen (gruppiert nach Fach und Datum)
  const { data: recentCorrectionsData } = await supabase
    .from('corrections')
    .select('id, course_subject, course_grade_level, created_at, student_name')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(20)

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
      exportedReports: exportsCount || 0,
      recentCorrections,
    }
  } catch (error) {
    // Falls Supabase nicht konfiguriert ist oder ein Fehler auftritt
    console.error('Error loading dashboard stats:', error)
    return {
      activeExpectationHorizons: 0,
      completedCorrections: 0,
      exportedReports: 0,
      recentCorrections: [],
    }
  }
}

