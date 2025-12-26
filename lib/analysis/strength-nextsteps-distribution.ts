/**
 * Leistungsbasierte Verteilungslogik für Stärken und Nächste Schritte
 * 
 * Steuert das Verhältnis von Stärken zu Nächsten Schritten basierend auf
 * der erreichten Punktzahl (relative Leistung).
 */

export interface DistributionConfig {
  strengthsCount: { min: number; max: number };
  nextStepsCount: { min: number; max: number };
  tone: string;
  description: string;
}

/**
 * Berechnet die Verteilungskonfiguration basierend auf der relativen Punktzahl
 * 
 * @param percentage - Erreichte Punktzahl in Prozent (0-100)
 * @returns Verteilungskonfiguration mit Min/Max-Werten und Ton
 */
export function getDistributionConfig(percentage: number): DistributionConfig {
  if (percentage < 30) {
    // Sehr schwache Leistung (< 30%)
    return {
      strengthsCount: { min: 1, max: 2 },
      nextStepsCount: { min: 4, max: 6 },
      tone: 'stark ermutigend, "Du kannst dir Schritt für Schritt ... aufbauen"',
      description: 'Trost + klare Orientierung',
    };
  } else if (percentage < 50) {
    // Schwache bis mittlere Leistung (30-50%)
    return {
      strengthsCount: { min: 2, max: 3 },
      nextStepsCount: { min: 3, max: 4 },
      tone: 'wertschätzend, aber klar: "Hier kannst du dich deutlich verbessern ..."',
      description: 'Balance → klar benennen, was schon geht, aber deutlich aufarbeiten',
    };
  } else if (percentage < 70) {
    // Befriedigende Leistung (50-70%)
    return {
      strengthsCount: { min: 3, max: 4 },
      nextStepsCount: { min: 2, max: 3 },
      tone: '"Du hast schon viel verstanden, jetzt geht es um Feinschliff."',
      description: 'Stabilisieren + zielgenau verbessern',
    };
  } else {
    // Gute bis sehr gute Leistung (70-100%)
    return {
      strengthsCount: { min: 4, max: 6 },
      nextStepsCount: { min: 1, max: 2 },
      tone: 'stark lobend, "Du arbeitest auf einem hohen Niveau, als nächstes kannst du ..."',
      description: 'Anerkennung + kleine Entwicklungsimpulse',
    };
  }
}

/**
 * Berechnet die relative Punktzahl aus erreichten und maximalen Punkten
 * 
 * @param achievedPoints - Erreichte Punkte
 * @param maxPoints - Maximale Punkte
 * @returns Prozentzahl (0-100)
 */
export function calculatePercentage(achievedPoints: number, maxPoints: number): number {
  if (maxPoints === 0) return 0;
  return Math.round((achievedPoints / maxPoints) * 100);
}

/**
 * Validiert und korrigiert die Anzahl von Stärken und Nächsten Schritten
 * basierend auf der Verteilungslogik
 * 
 * @param strengths - Aktuelle Stärken-Array
 * @param nextSteps - Aktuelles Nächste-Schritte-Array
 * @param percentage - Relative Punktzahl
 * @returns Objekt mit validierten Arrays und Flag, ob Korrektur nötig war
 */
export function validateDistribution(
  strengths: string[],
  nextSteps: string[],
  percentage: number
): {
  strengths: string[];
  nextSteps: string[];
  needsCorrection: boolean;
  config: DistributionConfig;
} {
  const config = getDistributionConfig(percentage);
  let needsCorrection = false;

  // Prüfe Stärken
  if (strengths.length < config.strengthsCount.min) {
    needsCorrection = true;
  }
  if (strengths.length > config.strengthsCount.max) {
    needsCorrection = true;
  }

  // Prüfe Nächste Schritte
  if (nextSteps.length < config.nextStepsCount.min) {
    needsCorrection = true;
  }
  if (nextSteps.length > config.nextStepsCount.max) {
    needsCorrection = true;
  }

  return {
    strengths,
    nextSteps,
    needsCorrection,
    config,
  };
}

/**
 * Generiert Anweisungen für die KI basierend auf der Verteilungslogik
 * 
 * @param percentage - Relative Punktzahl
 * @returns Prompt-Text mit verbindlichen Anweisungen
 */
export function generateDistributionInstructions(percentage: number): string {
  const config = getDistributionConfig(percentage);
  
  return `ERSTELLE IMMER EINEN BALANCIERTEN ZWEISPALTIGEN ÜBERBLICK:

Spalte 1: "DEINE STÄRKEN"
Spalte 2: "DEINE NÄCHSTEN SCHRITTE"

Die Anzahl der Bulletpoints in beiden Spalten hängt von der relativen Leistung ab.

AKTUELLE LEISTUNG: ${percentage}%

VERBINDLICHE VERTEILUNG:
- Stärken: ${config.strengthsCount.min}-${config.strengthsCount.max} Bulletpoints
- Nächste Schritte: ${config.nextStepsCount.min}-${config.nextStepsCount.max} Bulletpoints

TON: ${config.tone}

DIESE VERTEILUNG IST VERBINDLICH UND MUSS GENAU EINGEHALTEN WERDEN.

Die Inhalte sollen:
- direkt aus der Analyse (strengths, whatIsCorrect, improvementTips, nextSteps, learningNeeds) abgeleitet werden
- fachlich korrekt sein
- in der Du-Form formuliert werden
- konkrete Handlungen beschreiben (was der Schüler/die Schülerin ÜBEN, WIEDERHOLEN oder ÄNDERN kann)

Formuliere für "DEINE NÄCHSTEN SCHRITTE" KEINE Fehlerbeschreibungen,
sondern positive, umsetzbare Lernschritte.

Beispiele für "DEINE NÄCHSTEN SCHRITTE":
- "Übe die Unterschiede zwischen ... noch genauer."
- "Wiederhole die Fachbegriffe zu ..."
- "Trainiere, deine Antworten in ganzen Sätzen zu formulieren."
- "Achte beim nächsten Mal darauf, die Frage vollständig zu beantworten."

NICHT: "Du hast die Schichten des Bodens nicht benannt."
SONDERN: "Wiederhole die Schichten des Bodens (z. B. Oberboden, Unterboden) und lerne, welche Aufgaben sie haben."`;
}

