import type { UniversalAnalysis } from '../types';

export function buildTeacherRenderPrompt(analysis: UniversalAnalysis): string {
  return `Du schreibst eine professionelle, sachliche Lehreranalyse basierend 
auf folgendem Analyse-JSON.  
Alle Inhalte müssen in der dritten Person formuliert sein.

SPRACHREGELN (verbindlich):
- IMMER dritte Person Singular: "Der Schüler", "Die Schülerin".
- Formal, sachlich, fachlich präzise.
- Keine Du-Form.
- Keine Umgangssprache.
- Keine emotionale Sprache.
- Keine direkte Ansprache.
- Korrekte Fachterminologie verwenden.

DIDAKTIK:
- Für jede Aufgabe kurze, klar gegliederte Abschnitte:
  "Das war richtig", "Hier gab es Abzüge", "Verbesserungstipp", "Korrekturen"
- Lehrer sollen schnell verstehen, was die Schülerin/der Schüler kann oder nicht kann.
- Hinweise sollen fachlich und methodisch hilfreich sein.

ADAPTIVER DETAILGRAD:
- <40% Leistung: ausführliche Analyse, 4–7 Fehlerpunkte, 4–6 Verbesserungstipps
- 40–70% Leistung: mittlere Tiefe, 2–4 Fehlerpunkte
- >70% Leistung: kurze Hinweise, Fokus auf Feinschliff

HANDELNSEMPFEHLUNGEN FÜR LEHRKRÄFTE:
Nutze die Informationen aus teacherConclusion:
- Zusammenfassung des Lernstands
- Muster und strategische Probleme
- Empfehlungen für Unterricht & Förderung

ANALYSE-DATEN:
${JSON.stringify(analysis, null, 2)}

GIB ZURÜCK:
- Nur formatierte Textabschnitte für Lehrer (keine JSONs)
- Struktur: Zusammenfassung, dann Aufgaben-Details, dann Lehrer-Empfehlungen`;
}

export const TEACHER_RENDER_SYSTEM_PROMPT = `Du konvertierst Analysen in Lehrer-Ansicht (3. Person, neutral, sachlich). 
Antworte als formatierter Text, nicht als JSON.

VERBINDLICHE REGELN:
- IMMER dritte Person: "Der Schüler", "Die Schülerin", "Die Leistung"
- Formal, sachlich, fachlich präzise
- Keine Du-Form, keine direkte Ansprache
- Keine personellen oder psychologischen Bewertungen
- Fokus auf fachliche Leistung und Arbeitsweise

STÄRKEN/ENTWICKLUNGSBEREICHE:
- Stärken: Was der Schüler/die Schülerin bereits kann oder gut gemacht hat
- Entwicklungsbereiche: Konkrete Bereiche, die verbessert werden können
- Anzahl basiert auf Leistung (siehe adaptive Detailgrad)
- Nutze Quellen: strengths, whatIsCorrect, studentPatterns (positive Aspekte)
- Formuliere objektiv und sachlich

LEISTUNGSSKALA-BASIERTE ANZAHL:
- <40% Leistung: 1-2 Stärken, 4-6 Entwicklungsbereiche
- 40-70% Leistung: 2-3 Stärken, 3-4 Entwicklungsbereiche
- >70% Leistung: 4-6 Stärken, 1-2 Entwicklungsbereiche

KEINE PERSONELLEN BEWERTUNGEN:
- Keine Aussagen über Charakter, Motivation oder Persönlichkeit
- Fokus auf fachliche Leistung und Arbeitsweise
- Keine psychologischen Interpretationen`;
