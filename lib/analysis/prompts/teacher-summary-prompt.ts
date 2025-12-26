import type { MasterAnalysisInput } from '../types';

/**
 * Erstellt den pädagogischen Prompt für die Lehrer-Zusammenfassung
 * 
 * Dieser Prompt erzeugt eine übergreifende didaktische Einschätzung der Schülerleistung,
 * die nicht Aufgabe für Aufgabe auflistet, sondern Gesamteindruck, zentrale Stärken,
 * Entwicklungsbereiche und nächste Schritte beschreibt.
 */
export function buildTeacherSummaryPrompt(
  input: MasterAnalysisInput,
  tasksSummary: string, // Zusammenfassung der bereits analysierten Aufgaben mit Punkten
  detailFeedbacks: string // Bereits generierte Detail-Feedbacks pro Aufgabe
): string {
  const subjectContext = input.subject 
    ? `Du bist eine erfahrene Lehrkraft für ${input.subject}`
    : 'Du bist eine erfahrene Lehrkraft';
  
  const gradeLevelContext = input.className 
    ? ` in der Klasse ${input.className}`
    : '';

  return `
${subjectContext}${gradeLevelContext}.

Du erhältst:
- die Aufgabenstellung und Musterlösung jeder Teilaufgabe einer Klausur
- die Punkte pro Aufgabe
- die vom Schüler gegebenen Antworten
- bereits formulierte Detail-Feedbacks zu einzelnen Aufgaben (Stärken, Fehlvorstellungen, Tipps)

AUFGABE: Schreibe eine kompakte, didaktisch sinnvolle Gesamtbewertung der Schülerleistung in 8–12 Sätzen.

ANFORDERUNGEN AN DEN INHALT:

1. BEGINN (2–3 Sätze):
   - Beschreibe das allgemeine Leistungsniveau (z.B. "insgesamt solide Grundkenntnisse", "starke Leistung mit einzelnen Unsicherheiten", "es bestehen noch deutliche Lücken").
   - Gib einen Gesamteindruck der Arbeit.

2. ZENTRALE STÄRKEN (2–4 typische positive Beobachtungen):
   - Welche Kompetenzen sind gut ausgeprägt (z.B. Fachbegriffe, Verständnis von Zusammenhängen, Strukturierung der Antworten)?
   - Nenne übergreifende positive Muster aus verschiedenen Aufgaben.
   - Beschreibe, was der Schüler/die Schülerin durchgängig gut gemacht hat.

3. WICHTIGE ENTWICKLUNGSBEREICHE (3–5 konkrete, umsetzbare Hinweise):
   - Welche typischen Fehler oder Missverständnisse treten auf?
   - Welche Strategien sollte der Schüler üben (z.B. genaues Lesen der Aufgabenstellung, Strukturieren von Antworten, Verwenden von Fachsprache)?
   - Formuliere konkrete, umsetzbare Hinweise für die weitere Arbeit.

4. ABSCHLUSS (1–2 Sätze):
   - Fasse die nächsten Schritte zusammen (z.B. worauf der Schüler beim nächsten Thema/Klausur besonders achten sollte).
   - Gib eine motivierende, aber ehrliche Perspektive.

STILVORGABEN:
- Schreibe in sachlicher Lehrkraft-Perspektive ("Die Schülerin / der Schüler…", "Die Leistung zeigt…"), NICHT in der Du-Form.
- KEINE Aufzählung von Aufgaben ("In Aufgabe 1… In Aufgabe 2…"), sondern übergreifende Muster beschreiben.
- Kurze, klare Sätze; professionelle, ermutigende, aber ehrliche Tonalität.
- KEINE neuen Inhalte erfinden; stütze dich nur auf Informationen aus den vorhandenen Antworten und Feedbacks.

KONTEXT:

Aufgaben und Punkte:
${tasksSummary}

Detail-Feedbacks:
${detailFeedbacks}

Schreibe nun die Zusammenfassung (8–12 Sätze) im Feld "teacherConclusion.summary".`;
}

/**
 * Erstellt eine Zusammenfassung der Aufgaben mit Punkten für den Prompt
 */
export function buildTasksSummary(tasks: Array<{
  taskId: string;
  taskTitle: string;
  points: string;
  whatIsCorrect: string[];
  whatIsWrong: string[];
  improvementTips: string[];
}>): string {
  return tasks.map((task, idx) => {
    const [scored, max] = task.points.split('/').map(p => p.trim());
    return `Aufgabe ${task.taskTitle}: ${scored}/${max} Punkte
- Richtig: ${task.whatIsCorrect.length > 0 ? task.whatIsCorrect.slice(0, 2).join(', ') : 'Keine'}
- Verbesserungsbedarf: ${task.whatIsWrong.length > 0 ? task.whatIsWrong.slice(0, 2).join(', ') : 'Keine'}
- Tipps: ${task.improvementTips.length > 0 ? task.improvementTips.slice(0, 1).join(', ') : 'Keine'}`;
  }).join('\n\n');
}







