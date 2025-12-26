/**
 * Erstellt eine verdichtete, pädagogische Zusammenfassung aus Task-Feedbacks
 * für die Lehrer-Ansicht auf der Results-Seite
 * 
 * Ruft die API-Route auf, da OpenAI nur serverseitig verfügbar ist
 */

import type { TeacherTaskView } from './renderers/teacher-renderer';

export interface TeacherSummaryOutput {
  strengthsSummary: string[]; // 3-5 Sätze
  developmentAreasSummary: string[]; // 0-5 Sätze, nur bei Note > 3 oder wenn genügend Material
}

/**
 * Erstellt eine verdichtete Zusammenfassung aus allen Task-Feedbacks
 * Ruft die API-Route auf, da OpenAI nur serverseitig verfügbar ist
 */
export async function buildTeacherSummaryFromTasks(
  tasks: TeacherTaskView[],
  percentage: number,
): Promise<TeacherSummaryOutput> {
  try {
    const response = await fetch('/api/build-teacher-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tasks, percentage }),
    });

    if (!response.ok) {
      throw new Error(`API-Fehler: ${response.statusText}`);
    }

    const result = await response.json() as TeacherSummaryOutput;
    return result;
  } catch (error) {
    console.error('Fehler beim Erstellen der Lehrer-Zusammenfassung:', error);
    
    // KEIN Fallback mehr - wir wollen keine rohen Task-Daten
    // Die API-Route sollte immer funktionieren, da sie serverseitig läuft
    // Falls sie fehlschlägt, geben wir leere Arrays zurück
    // Die UI zeigt dann "Keine zusammenfassende Bewertung vorhanden"
    return {
      strengthsSummary: [],
      developmentAreasSummary: [],
    };
  }
}

