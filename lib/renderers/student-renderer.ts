/**
 * Renderer für Schüler-DOCX-Dokument
 * 
 * Wandelt ParsedAnalysis in schülerfreundliche, motivierende Texte um
 * Sprache: Du-Form, freundlich, konstruktiv, motivierend
 */

import type { ParsedAnalysis, AnalysisTask } from '@/types/analysis';
import { polishLanguage, polishMultipleTexts } from '../language-polisher';
import { getGradeInfo, getPerformanceLevel } from '../grades';

export interface StudentTaskView {
  taskId: string;
  taskTitle: string;
  points: string; // "2/5"
  
  // Strukturierte Bewertung in Du-Form
  whatYouDidWell: string[]; // Was du richtig gemacht hast
  whatNeedsImprovement: string[]; // Was verbessert werden kann
  tipsForYou: string[]; // Tipps für dich
  corrections: string[]; // Korrekturen
}

export interface StudentSummaryView {
  yourStrengths: string[]; // DEINE STÄRKEN
  yourNextSteps: string[]; // DEINE NÄCHSTEN SCHRITTE
  overallMessage: string; // Motivierende Gesamtbotschaft
  grade?: string;
  performanceLevel?: string;
}

/**
 * Rendert eine Aufgabe für die Schüler-Ansicht (Du-Form, motivierend)
 */
export function renderStudentTask(task: AnalysisTask): StudentTaskView {
  return {
    taskId: task.taskId,
    taskTitle: task.taskTitle,
    points: `${task.erreichtePunkte}/${task.maxPunkte}`,
    whatYouDidWell: task.whatIsCorrect.map(convertToSecondPerson),
    whatNeedsImprovement: task.whatIsWrong.map(convertToSecondPersonFriendly),
    tipsForYou: task.improvementTips.map(convertToSecondPerson),
    corrections: (task.korrekturen || []).map(convertToSecondPerson),
  };
}

/**
 * Neue Version von renderStudentSummary – nutzt die Filter
 */
export function renderStudentSummary(
  analysis: ParsedAnalysis,
  useFiltering: boolean = true,
  gradeLevel: number = 10
): StudentSummaryView {
  const percentage = (analysis.erreichtePunkte / analysis.gesamtpunkte) * 100;
  const gradeInfo = getGradeInfo({ prozent: percentage, gradeLevel });
  const grade = gradeInfo.label;
  const performanceLevel = getPerformanceLevel(percentage);

  let strengths = analysis.strengths.map(convertToSecondPerson);
  let nextSteps = analysis.nextSteps.map(convertToSecondPerson);

  if (useFiltering) {
    strengths = filterStrengths(strengths, analysis.aufgaben);
    nextSteps = filterNextSteps(nextSteps, analysis.aufgaben, []);
  }

  return {
    yourStrengths: strengths,
    yourNextSteps: nextSteps,
    overallMessage: convertToSecondPerson(analysis.summary),
    grade: grade,
    performanceLevel: performanceLevel,
  };
}

/**
 * Konvertiert 3. Person zu Du-Form (freundlich, motivierend)
 */
function convertToSecondPerson(text: string): string {
  if (!text) return text;
  
  let converted = text
    .replace(/\bder\/die\s+schüler\/in\b/gi, 'du')
    .replace(/\bder\s+schüler\b/gi, 'du')
    .replace(/\bdie\s+schülerin\b/gi, 'du')
    .replace(/\bdes\/der\s+schüler\/in\b/gi, 'dein')
    .replace(/\bdes\s+schülers\b/gi, 'dein')
    .replace(/\bder\s+schülerin\b/gi, 'dein')
    .replace(/\bdem\/der\s+schüler\/in\b/gi, 'dir')
    .replace(/\bdem\s+schüler\b/gi, 'dir')
    .replace(/\bder\s+schülerin\b/gi, 'dir')
    .replace(/\bden\/die\s+schüler\/in\b/gi, 'dich')
    .replace(/\bden\s+schüler\b/gi, 'dich')
    .replace(/\bdie\s+schülerin\b/gi, 'dich')
    .replace(/\bes\s+wäre\s+sinnvoll,\s+wenn\b/gi, 'du solltest')
    .replace(/\bes\s+sollte\s+beachtet\s+werden\b/gi, 'du solltest beachten')
    .replace(/\bes\s+sollte\s+versucht\s+werden\b/gi, 'versuche')
    .replace(/\bes\s+sollte\s+verwendet\s+werden\b/gi, 'verwende')
    .replace(/\bes\s+sollte\s+verbessert\s+werden\b/gi, 'verbessere')
    .replace(/\bdie\s+schülerleistung\s+zeigt,\s+dass\b/gi, 'du zeigst')
    .replace(/\bdie\s+leistung\s+weist\s+auf\b/gi, 'deine Leistung zeigt')
    .replace(/\bdie\s+antwort\s+verdeutlicht\b/gi, 'deine Antwort zeigt');
  
  // Stelle sicher, dass Sätze mit "Du" beginnen, wenn nötig
  if (!converted.match(/^(Du|Dein|Deine|Dir|Dich)/i)) {
    converted = converted.replace(/^(.+?)(\.|$)/, (match, content) => {
      if (!content.match(/^(Du|Dein|Deine|Dir|Dich)/i)) {
        return `Du ${content.toLowerCase()}`;
      }
      return match;
    });
  }
  
  return converted;
}

/**
 * Konvertiert zu freundlicher Du-Form (ohne negative Wertungen)
 */
function convertToSecondPersonFriendly(text: string): string {
  let converted = convertToSecondPerson(text);
  
  // Ersetze negative Formulierungen durch konstruktive
  converted = converted
    .replace(/\bfehler\b/gi, 'Verbesserungspotenzial')
    .replace(/\bfalsch\b/gi, 'noch nicht vollständig')
    .replace(/\bschlecht\b/gi, 'verbesserungswürdig')
    .replace(/\bmangelhaft\b/gi, 'noch ausbaufähig')
    .replace(/\bunvollständig\b/gi, 'noch nicht vollständig')
    .replace(/\bfehlt\b/gi, 'könnte noch ergänzt werden');
  
  return converted;
}

/**
 * Bereinigt Text von Satzabbrüchen und Fragmenten ("Du c", "London.", etc.)
 */
function cleanTextFragment(text: string): string {
  if (!text || typeof text !== "string") return "";

  let cleaned = text.trim();

  // Entferne komplett unbrauchbare Satzfragmente
  if (/^Du c$/i.test(cleaned)) return "";
  if (/^Du [A-Z]\.?$/i.test(cleaned)) return "";
  if (/^Du hast [A-Z][a-z]*\.?$/i.test(cleaned) && cleaned.length < 20) return "";

  // Repariere typische Fehlerfragmente
  cleaned = cleaned
    .replace(/^Du hast London\.?$/gi, "Du hast die London-Kräfte korrekt beschrieben.")
    .replace(/^Du hast korrekt London\.?$/gi, "Du hast die London-Kräfte korrekt beschrieben.")
    .replace(/London\.$/gi, "die London-Kräfte korrekt beschrieben.")
    .replace(/^Du solltest das Wort\.?$/gi, "Du solltest die Fachbegriffe genauer verwenden.")
    .replace(/unvollständig.*$/gi, "")
    .trim();

  // Satz unvollständig? → Vervollständigen
  if (cleaned.length < 10) return "";

  if (!/[.!?]$/.test(cleaned)) {
    if (cleaned.startsWith("Du hast")) cleaned += " korrekt gemacht.";
    else if (cleaned.startsWith("Du solltest")) cleaned += ".";
    else cleaned += ".";
  }

  return cleaned;
}

/**
 * Filtert Stärken: Nur aus whatIsCorrect – niemals Fehler, niemals Unsicherheiten
 */
function filterStrengths(strengths: string[], tasks: AnalysisTask[]): string[] {
  const valid = new Set<string>();

  // 1. Aus den Aufgaben extrahieren
  tasks.forEach(task => {
    task.whatIsCorrect?.forEach(entry => {
      const cleaned = cleanTextFragment(convertToSecondPerson(entry));
      if (
        cleaned &&
        cleaned.length > 10 &&
        !/fehler|falsch|nicht|fehlte|unsicher/gi.test(cleaned)
      ) {
        valid.add(cleaned);
      }
    });
  });

  // 2. Aus den übergebenen strengths
  strengths.forEach(s => {
    const cleaned = cleanTextFragment(s);
    if (
      cleaned &&
      cleaned.length > 10 &&
      !/fehler|falsch|nicht|fehlte|versucht/gi.test(cleaned)
    ) {
      valid.add(cleaned);
    }
  });

  return Array.from(valid);
}

/**
 * Filtert Nächste Schritte: Nur aus improvementTips + learningNeeds
 */
function filterNextSteps(
  nextSteps: string[],
  tasks: AnalysisTask[],
  learningNeeds: string[]
): string[] {
  const valid = new Set<string>();

  // 1. improvementTips aus Aufgaben
  tasks.forEach(task => {
    task.improvementTips?.forEach(tip => {
      let cleaned = cleanTextFragment(convertToSecondPerson(tip));
      if (!cleaned) return;
      if (/falsch|fehler|nicht.*gemacht|fehlte/gi.test(cleaned)) return;

      // Erwachsenensprache zu schülerfreundlich umwandeln
      cleaned = cleaned
        .replace(/Diskrepanz/gi, "Unterschied")
        .replace(/Materialnutzung/gi, "Material")
        .replace(/auffällig/gi, "wichtig");

      // Handlungssprache erzeugen
      if (!/(übe|wiederhole|achte|lerne|vertiefe)/gi.test(cleaned)) {
        cleaned = "Übe, " + cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
      }

      valid.add(cleaned);
    });
  });

  // 2. learningNeeds aus Lehrerfazit
  learningNeeds.forEach(need => {
    const cleaned = cleanTextFragment(convertToSecondPerson(need));
    if (cleaned && cleaned.length > 10) valid.add(cleaned);
  });

  // 3. nextSteps aus Analyse
  nextSteps.forEach(step => {
    const cleaned = cleanTextFragment(step);
    if (
      cleaned &&
      cleaned.length > 10 &&
      !/fehler|falsch|nicht.*gemacht/gi.test(cleaned)
    ) {
      valid.add(cleaned);
    }
  });

  return Array.from(valid);
}

/**
 * Poliert alle Textfelder einer StudentTaskView
 */
async function polishStudentTaskView(task: StudentTaskView): Promise<StudentTaskView> {
  try {
    // Parallele Verarbeitung aller Textfelder
    const [
      polishedWhatYouDidWell,
      polishedWhatNeedsImprovement,
      polishedTipsForYou,
      polishedCorrections,
    ] = await Promise.all([
      polishMultipleTexts(task.whatYouDidWell),
      polishMultipleTexts(task.whatNeedsImprovement),
      polishMultipleTexts(task.tipsForYou),
      polishMultipleTexts(task.corrections),
    ]);

    return {
      ...task,
      whatYouDidWell: polishedWhatYouDidWell,
      whatNeedsImprovement: polishedWhatNeedsImprovement,
      tipsForYou: polishedTipsForYou,
      corrections: polishedCorrections,
    };
  } catch (error) {
    console.warn('Fehler beim Polishing der Task-Textfelder, verwende Originaltexte:', error);
    return task; // Fallback: Original-Task
  }
}

/**
 * Poliert alle Textfelder einer StudentSummaryView
 */
async function polishStudentSummaryView(summary: StudentSummaryView): Promise<StudentSummaryView> {
  try {
    // Parallele Verarbeitung aller Textfelder
    const [
      polishedStrengths,
      polishedNextSteps,
      polishedOverallMessage,
    ] = await Promise.all([
      polishMultipleTexts(summary.yourStrengths),
      polishMultipleTexts(summary.yourNextSteps),
      polishLanguage(summary.overallMessage),
    ]);

    return {
      yourStrengths: polishedStrengths,
      yourNextSteps: polishedNextSteps,
      overallMessage: polishedOverallMessage,
    };
  } catch (error) {
    console.warn('Fehler beim Polishing der Summary-Textfelder, verwende Originaltexte:', error);
    return summary; // Fallback: Original-Summary
  }
}

/**
 * Rendert die komplette Analyse für Schüler-Ansicht (synchron, ohne Polishing)
 */
export function renderStudentDocSections(analysis: ParsedAnalysis, gradeLevel: number = 10) {
  const percentage = (analysis.erreichtePunkte / analysis.gesamtpunkte) * 100;
  const gradeInfo = getGradeInfo({ prozent: percentage, gradeLevel });
  const grade = gradeInfo.label;
  const performanceLevel = getPerformanceLevel(percentage);

  return {
    summary: renderStudentSummary(analysis, true, gradeLevel),
    tasks: analysis.aufgaben.map(renderStudentTask),
    overall: {
      points: `${analysis.erreichtePunkte}/${analysis.gesamtpunkte}`,
      percentage: analysis.prozent,
      note: grade,
      grade: grade,
      performanceLevel: performanceLevel,
    },
  };
}

/**
 * Rendert und poliert die komplette Analyse für Schüler-Ansicht
 * Pipeline: analysis → renderStudentDocSections() → polishAllTexts() → return polishedView
 */
export async function renderAndPolishStudentDocSections(analysis: ParsedAnalysis, gradeLevel: number = 10) {
  // Schritt 1: Rendern (synchron)
  const rendered = renderStudentDocSections(analysis, gradeLevel);

  // Schritt 2: Polishing (asynchron, parallel)
  try {
    const [polishedSummary, polishedTasks] = await Promise.all([
      polishStudentSummaryView(rendered.summary),
      Promise.all(rendered.tasks.map((task) => polishStudentTaskView(task))),
    ]);

    return {
      summary: polishedSummary,
      tasks: polishedTasks,
      overall: rendered.overall,
    };
  } catch (error) {
    console.warn('Fehler beim Polishing der gesamten Student-Doc-Sections, verwende ungepolte Version:', error);
    return rendered; // Fallback: Ungepolte Version
  }
}

