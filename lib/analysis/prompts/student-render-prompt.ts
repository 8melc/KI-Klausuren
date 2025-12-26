import type { UniversalAnalysis } from '../types';
import { generateDistributionInstructions, calculatePercentage } from '../strength-nextsteps-distribution';

export function buildStudentRenderPrompt(analysis: UniversalAnalysis): string {
  // Berechne relative Leistung für Verteilungslogik
  const percentage = calculatePercentage(analysis.meta.achievedPoints, analysis.meta.maxPoints);
  const relativeLeistung = analysis.meta.maxPoints > 0 
    ? analysis.meta.achievedPoints / analysis.meta.maxPoints 
    : 0;

  // Bestimme Anzahl basierend auf relativer Leistung
  let strengthsCount: { min: number; max: number };
  let nextStepsCount: { min: number; max: number };

  if (relativeLeistung < 0.30) {
    strengthsCount = { min: 1, max: 2 };
    nextStepsCount = { min: 4, max: 5 };
  } else if (relativeLeistung < 0.50) {
    strengthsCount = { min: 2, max: 3 };
    nextStepsCount = { min: 3, max: 4 };
  } else if (relativeLeistung < 0.70) {
    strengthsCount = { min: 3, max: 4 };
    nextStepsCount = { min: 2, max: 3 };
  } else {
    strengthsCount = { min: 4, max: 5 };
    nextStepsCount = { min: 1, max: 2 };
  }

  return `DU-REPORT FÜR SCHÜLER*INNEN – VERBINDLICHE REGELN

1. SPRACHE:
- perfekte Rechtschreibung
- perfekte Grammatik
- keine Satzabbrüche
- kurze, klare Sätze (max. 15 Worte)
- du-Form, freundlich, einfach
- Korrekte Konjugation: "du hast", "du zeigst", "du nennst", "du erklärst"

2. STÄRKEN:
- dürfen KEINE Fehler enthalten
- dürfen KEINE halben Sätze aus der Analyse kopieren
- müssen vollständig sein:
  Beispiel: "Du hast die Strukturformeln korrekt gezeichnet."
- beziehe Stärken nur aus whatIsCorrect und analysis.strengths
- KEINE "Es wurde versucht"-Formulierungen
- KEINE Unsicherheiten ("vielleicht", "möglicherweise")
- Formuliere in Du-Form: "Du hast ... korrekt beschrieben", "Du hast die wichtigsten Fachbegriffe verwendet"

3. NÄCHSTE SCHRITTE:
- KEINE Fehlerbeschreibungen
- KEINE langen verschachtelten Sätze
- KEINE Erwachsenensprache ("Diskrepanz" etc.)
- IMMER konkrete Lernhandlungen:
  - "Übe, die Strukturformeln sauber aufzubauen."
  - "Wiederhole den Unterschied zwischen Alkane und Alkene."
  - "Achte darauf, die Aufgaben ganz zu lesen."
- Kurze, klare Sätze (max. 15 Worte)
- Formuliere als positive Handlung (ÜBEN, WIEDERHOLEN, ACHTEN)

4. ANZAHL (VERBINDLICH):
Berechne relativeLeistung = erreichtePunkte / maximalPunkte.

AKTUELLE LEISTUNG: ${(relativeLeistung * 100).toFixed(1)}% (${analysis.meta.achievedPoints}/${analysis.meta.maxPoints} Punkte)

Wenn relativeLeistung < 0.30:
  - ${strengthsCount.min}–${strengthsCount.max} Stärken
  - ${nextStepsCount.min}–${nextStepsCount.max} Lernschritte

Wenn 0.30–0.50:
  - ${strengthsCount.min}–${strengthsCount.max} Stärken
  - ${nextStepsCount.min}–${nextStepsCount.max} Lernschritte

Wenn 0.50–0.70:
  - ${strengthsCount.min}–${strengthsCount.max} Stärken
  - ${nextStepsCount.min}–${nextStepsCount.max} Lernschritte

Wenn > 0.70:
  - ${strengthsCount.min}–${strengthsCount.max} Stärken
  - ${nextStepsCount.min}–${nextStepsCount.max} Lernschritte

DIESE ANZAHL MUSS GENAU EINGEHALTEN WERDEN.

5. OUTPUT:
Liefere ein JSON-Objekt im folgenden Format:

{
  "strengths": ["Vollständiger Satz in Du-Form", "Vollständiger Satz in Du-Form"],
  "nextSteps": ["Konkrete Lernhandlung", "Konkrete Lernhandlung"]
}

WICHTIG:
- Alle Sätze müssen vollständig sein (keine Satzabbrüche)
- Alle Sätze müssen grammatikalisch korrekt sein
- Alle Sätze müssen in Du-Form sein
- Stärken: Nur aus whatIsCorrect und analysis.strengths
- Nächste Schritte: Nur aus improvementTips, learningNeeds, nextSteps
- Keine Fehlerbeschreibungen in Nächsten Schritten
- Keine Erwachsenensprache

ANALYSE-DATEN:
${JSON.stringify(analysis, null, 2)}

GIB ZURÜCK: Nur das JSON-Objekt mit strengths und nextSteps Arrays.`;
}

export const STUDENT_RENDER_SYSTEM_PROMPT = `Du konvertierst Analysen in Schüler-Ansicht (Du-Form, motivierend, konstruktiv). 
Antworte AUSSCHLIESSLICH als JSON-Objekt mit strengths und nextSteps Arrays.

VERBINDLICHE REGELN:

1. SPRACHE:
- perfekte Rechtschreibung
- perfekte Grammatik
- keine Satzabbrüche
- kurze, klare Sätze (max. 15 Worte)
- du-Form, freundlich, einfach
- Korrekte Konjugation: "du hast", "du zeigst", "du nennst", "du erklärst"

2. STÄRKEN:
- dürfen KEINE Fehler enthalten
- dürfen KEINE halben Sätze aus der Analyse kopieren
- müssen vollständig sein (Beispiel: "Du hast die Strukturformeln korrekt gezeichnet.")
- beziehe Stärken nur aus whatIsCorrect und analysis.strengths
- KEINE "Es wurde versucht"-Formulierungen
- KEINE Unsicherheiten

3. NÄCHSTE SCHRITTE:
- KEINE Fehlerbeschreibungen
- KEINE langen verschachtelten Sätze
- KEINE Erwachsenensprache ("Diskrepanz" etc.)
- IMMER konkrete Lernhandlungen (ÜBEN, WIEDERHOLEN, ACHTEN)
- Kurze, klare Sätze (max. 15 Worte)

4. ANZAHL:
- Die Anzahl in strengths und nextSteps MUSS genau den Vorgaben im Prompt entsprechen
- Berechne relativeLeistung = erreichtePunkte / maximalPunkte
- Folge den Schwellenwerten (0.30, 0.50, 0.70)

5. OUTPUT:
- Nur JSON-Objekt: { "strengths": [...], "nextSteps": [...] }
- Keine zusätzlichen Erklärungen
- Keine formatierte Textausgabe`;
