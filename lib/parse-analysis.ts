/**
 * Helper-Funktionen zum Parsen der strukturierten Analyse-Texte
 * basierend auf der Word-Vorlage
 */

export interface ParsedComment {
  dasWarRichtig?: string;
  hierGabEsAbzuege?: string;
  verbesserungstipp?: string;
}

export interface ParsedSummary {
  staerken?: string;
  entwicklungsbereiche?: string;
}

/**
 * Parst einen Kommentar-Text und extrahiert die Abschnitte
 * "DAS WAR RICHTIG", "HIER GAB ES ABZÜGE", "VERBESSERUNGSTIPP"
 */
export function parseComment(comment: string): ParsedComment {
  const result: ParsedComment = {};

  // Suche nach den Abschnitten (case-insensitive)
  const richtigMatch = comment.match(/DAS WAR RICHTIG[:\s]*([\s\S]*?)(?=HIER GAB ES ABZÜGE|VERBESSERUNGSTIPP|$)/i);
  const abzuegeMatch = comment.match(/HIER GAB ES ABZÜGE[:\s]*([\s\S]*?)(?=VERBESSERUNGSTIPP|DAS WAR RICHTIG|$)/i);
  const tippMatch = comment.match(/VERBESSERUNGSTIPP[:\s]*([\s\S]*?)(?=DAS WAR RICHTIG|HIER GAB ES ABZÜGE|$)/i);

  if (richtigMatch) {
    result.dasWarRichtig = richtigMatch[1].trim();
  }
  if (abzuegeMatch) {
    result.hierGabEsAbzuege = abzuegeMatch[1].trim();
  }
  if (tippMatch) {
    result.verbesserungstipp = tippMatch[1].trim();
  }

  // Falls keine Struktur gefunden wurde, verwende den gesamten Text als Fallback
  if (!result.dasWarRichtig && !result.hierGabEsAbzuege && !result.verbesserungstipp) {
    // Versuche alternative Schreibweisen
    const richtigAlt = comment.match(/(?:richtig|korrekt|gut|stärke)[:\s]*([\s\S]*?)(?=abzug|fehler|verbesserung|$)/i);
    const abzuegeAlt = comment.match(/(?:abzug|fehler|schwäche|problem)[:\s]*([\s\S]*?)(?=verbesserung|richtig|$)/i);
    const tippAlt = comment.match(/(?:verbesserung|tipp|hinweis)[:\s]*([\s\S]*?)$/i);

    if (richtigAlt) result.dasWarRichtig = richtigAlt[1].trim();
    if (abzuegeAlt) result.hierGabEsAbzuege = abzuegeAlt[1].trim();
    if (tippAlt) result.verbesserungstipp = tippAlt[1].trim();
  }

  return result;
}

/**
 * Parst eine Zusammenfassung und extrahiert "DEINE STÄRKEN" und "DEINE NÄCHSTEN SCHRITTE"
 */
export function parseSummary(summary: string): ParsedSummary {
  const result: ParsedSummary = {};

  // Suche nach den Abschnitten (case-insensitive)
  const staerkenMatch = summary.match(/(?:DEINE STÄRKEN|STÄRKEN|STRENGTHS)[:\s]*([\s\S]*?)(?=DEINE NÄCHSTEN SCHRITTE|ENTWICKLUNGSBEREICHE|NÄCHSTE SCHRITTE|$)/i);
  const entwicklungsMatch = summary.match(/(?:DEINE NÄCHSTEN SCHRITTE|ENTWICKLUNGSBEREICHE|NÄCHSTE SCHRITTE|DEVELOPMENT)[:\s]*([\s\S]*?)(?=DEINE STÄRKEN|STÄRKEN|$)/i);

  if (staerkenMatch) {
    result.staerken = staerkenMatch[1].trim();
  }
  if (entwicklungsMatch) {
    result.entwicklungsbereiche = entwicklungsMatch[1].trim();
  }

  return result;
}

