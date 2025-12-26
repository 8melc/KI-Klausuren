/**
 * Konfiguration für die Sprache und den Stil der KI-Analyse
 * 
 * Diese Datei steuert, wie ChatGPT die Klausuren analysiert und formuliert.
 */

export interface AnalysisLanguageConfig {
  // Adressat: Wer liest die Analyse?
  audience: 'teacher' | 'student';
  
  // Perspektive
  perspective?: 'third-person' | 'second-person';
  
  // Sprachstil
  tone: 'formal' | 'constructive' | 'encouraging' | 'neutral' | 'neutral-formal';
  
  // Detaillierungsgrad
  detailLevel: 'brief' | 'moderate' | 'detailed' | 'comprehensive' | 'adaptive';
  
  // Positivität
  positivity?: 'low' | 'medium' | 'high';
  
  // Komplexität
  complexity?: 'low' | 'medium' | 'high';
  
  // Direktheit
  directness?: 'low' | 'medium' | 'high';
  
  // Spezifische Anweisungen
  specificInstructions?: string;
}

/**
 * Generiert verbindliche Sprachregeln für Lehrer-Ansicht
 */
export function generateTeacherLanguageRules(): string {
  return `SPRACHREGELN FÜR LEHRKRAFTANSICHT (verbindlich):
- IMMER dritte Person Singular (z.B. 'Der Schüler', 'Die Schülerin').
- NIEMALS Du-Form oder direkte Anrede.
- Ton: neutral, sachlich, formal, fachlich präzise.
- Keine Umgangssprache, keine persönliche Tonalität.
- Formulierungsbeispiele:
  'Die Schülerin zeigt ...', 
  'Der Schüler weist ... auf.', 
  'Die Antwort verdeutlicht ...',
  'Es wird deutlich, dass ...'.
- Verbesserungstipps IMMER neutral:
  'Es wäre sinnvoll, wenn ...'
  'Zur Verbesserung sollte ... berücksichtigt werden.'
- Keine direkten Aufforderungen ('Du solltest', 'Achte darauf').
- Alle Texte müssen vollständige Sätze enthalten, keine 1-Wort-Stichpunkte.`;
}

/**
 * Generiert adaptiven Detailgrad-Block basierend auf erreichten Punkten
 */
export function generateAdaptiveDetailLevel(erreichtePunkte: number, maxPunkte: number): string {
  const prozent = (erreichtePunkte / maxPunkte) * 100;
  
  if (prozent < 40) {
    return `ADAPTIVER DETAILGRAD (verbindlich) - Leistungsniveau: unter 40%
- Sehr ausführliche Analyse erforderlich
- Mindestens 3–6 Fehlerpunkte in 'korrekturen' oder 'hierGabEsAbzuege'
- Mindestens 3–5 Verbesserungstipps in 'verbesserungstipp'
- Detaillierte Erklärungen zu Missverständnissen
- Ausführliche Begründung der Punktevergabe
- Konkrete Beispiele für Fehler und Verbesserungen`;
  } else if (prozent >= 40 && prozent < 70) {
    return `ADAPTIVER DETAILGRAD (verbindlich) - Leistungsniveau: 40-70%
- Mittlere Tiefe der Analyse
- 2–4 Fehlerpunkte in 'korrekturen' oder 'hierGabEsAbzuege'
- 2–4 Verbesserungstipps in 'verbesserungstipp'
- Ausgewogene Darstellung von Stärken und Schwächen
- Klare Begründung der Punktevergabe`;
  } else {
    return `ADAPTIVER DETAILGRAD (verbindlich) - Leistungsniveau: über 70%
- Kurze, präzise Analyse
- 1–2 Fehlerpunkte in 'korrekturen' oder 'hierGabEsAbzuege'
- 1–2 Verbesserungstipps in 'verbesserungstipp'
- Fokus auf Feinschliff und Optimierung
- Betonung der Stärken mit gezielten Verbesserungsvorschlägen`;
  }
}

/**
 * Generiert Sprach-Anweisungen für den Prompt basierend auf der Konfiguration
 */
export function generateLanguageInstructions(config: AnalysisLanguageConfig): string {
  const instructions: string[] = [];

  // Adressat-spezifische Anweisungen
  if (config.audience === 'teacher') {
    // Verwende die verbindlichen Sprachregeln
    instructions.push(generateTeacherLanguageRules());
  } else {
    instructions.push(
      'SPRACHE: Verwende die Du-Form für direkte Ansprache des Schülers.',
      'Formuliere konstruktiv und ermutigend.',
      'Verwende "Du", "Dein", "Dir" für persönliche Ansprache.'
    );
  }

  // Ton-Anweisungen
  switch (config.tone) {
    case 'formal':
      instructions.push(
        'TON: Verwende formale, fachliche Sprache.',
        'Vermeide umgangssprachliche Ausdrücke.',
        'Nutze präzise Fachbegriffe.'
      );
      break;
    case 'constructive':
      instructions.push(
        'TON: Formuliere konstruktiv und lösungsorientiert.',
        'Fokussiere auf Verbesserungsmöglichkeiten, nicht nur auf Fehler.',
        'Zeige Wege zur Weiterentwicklung auf.'
      );
      break;
    case 'encouraging':
      instructions.push(
        'TON: Sei ermutigend und wertschätzend.',
        'Betone positive Aspekte deutlich.',
        'Formuliere Kritik als Entwicklungsmöglichkeit.'
      );
      break;
    case 'neutral':
      instructions.push(
        'TON: Verwende einen neutralen, sachlichen Ton.',
        'Weder zu streng noch zu nachsichtig.',
        'Objektive Beschreibung der Leistung.'
      );
      break;
  }

  // Detaillierungsgrad (nur wenn nicht 'adaptive')
  if (config.detailLevel !== 'adaptive') {
    switch (config.detailLevel) {
      case 'brief':
        instructions.push('DETAILLIERUNGSGRAD: Kurz und prägnant. Fokussiere auf die wichtigsten Punkte.');
        break;
      case 'moderate':
        instructions.push('DETAILLIERUNGSGRAD: Ausgewogen. Wichtige Aspekte detailliert, Nebensächliches kurz.');
        break;
      case 'detailed':
        instructions.push('DETAILLIERUNGSGRAD: Detailliert. Gib konkrete Beispiele und Begründungen.');
        break;
      case 'comprehensive':
        instructions.push('DETAILLIERUNGSGRAD: Umfassend. Analysiere jeden Aspekt gründlich mit Beispielen.');
        break;
    }
  }
  // 'adaptive' wird später basierend auf der Punktzahl generiert

  // Spezifische Anweisungen
  if (config.specificInstructions) {
    instructions.push(`SPEZIFISCHE ANWEISUNGEN: ${config.specificInstructions}`);
  }

  return instructions.join('\n');
}

/**
 * Standard-Konfiguration für Lehrer-Ansicht
 */
export const TEACHER_CONFIG: AnalysisLanguageConfig = {
  audience: 'teacher',
  perspective: 'third-person',
  tone: 'neutral-formal',
  detailLevel: 'adaptive',
  positivity: 'low',
  complexity: 'high',
  directness: 'high',
  specificInstructions: 'Formuliere für Lehrkräfte, die die Analyse zur Unterrichtsplanung nutzen. Alle Texte müssen professionell, sachlich, neutral und für Lehrkräfte verständlich geschrieben sein.',
};

/**
 * Standard-Konfiguration für Schüler-Dokument
 */
export const STUDENT_CONFIG: AnalysisLanguageConfig = {
  audience: 'student',
  tone: 'constructive',
  detailLevel: 'moderate',
  specificInstructions: 'Formuliere ermutigend, aber ehrlich. Zeige konkrete Verbesserungsschritte auf.',
};

