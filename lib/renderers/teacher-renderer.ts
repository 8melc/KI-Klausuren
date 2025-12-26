/**
 * Renderer für Lehrer-ResultCards
 * 
 * Wandelt ParsedAnalysis in UI-kompatible Strukturen um
 * Sprache: 3. Person, neutral, sachlich, formal
 */

import type { ParsedAnalysis, AnalysisTask } from '@/types/analysis';
import { getGradeInfo, getPerformanceLevel } from '../grades';

export interface TeacherTaskView {
  taskId: string;
  taskTitle: string;
  points: string; // "2/5"
  percentage: number;
  
  // Strukturierte Bewertung in 3. Person
  correctAspects: string[]; // Was war richtig
  deductions: string[]; // Abzüge
  improvementHints: string[]; // Verbesserungshinweise
  corrections: string[]; // Korrekturen
  pointsReasoning: string; // Begründung
  
  // Warnung für Zeichnungsaufgaben
  benoetigtManuelleKorrektur?: boolean;
  warnung?: string;
}

export interface TeacherSummaryView {
  strengths: string[];
  developmentAreas: string[];
  overallSummary: string;
}

/**
 * Rendert eine Aufgabe für die Lehrer-Ansicht
 */
export function renderTeacherTask(task: AnalysisTask): TeacherTaskView {
  return {
    taskId: task.taskId,
    taskTitle: task.taskTitle,
    points: `${task.erreichtePunkte}/${task.maxPunkte}`,
    percentage: (task.erreichtePunkte / task.maxPunkte) * 100,
    correctAspects: task.whatIsCorrect,
    deductions: task.whatIsWrong,
    improvementHints: task.improvementTips,
    corrections: task.korrekturen || [],
    pointsReasoning: ensureThirdPerson(task.pointsReasoning),
    benoetigtManuelleKorrektur: task.benoetigtManuelleKorrektur,
    warnung: task.warnung,
  };
}

/**
 * Rendert die Zusammenfassung für die Lehrer-Ansicht
 */
export function renderTeacherSummary(analysis: ParsedAnalysis): TeacherSummaryView {
  return {
    strengths: analysis.strengths.map(ensureThirdPerson),
    developmentAreas: analysis.nextSteps.map(ensureThirdPerson),
    overallSummary: ensureThirdPerson(analysis.summary),
  };
}

/**
 * Stellt sicher, dass der Text in 3. Person formuliert ist
 * Konvertiert Du-Form zu 3. Person
 */
function ensureThirdPerson(text: string): string {
  if (!text) return text;
  
  // Ersetze Du-Form durch 3. Person
  let converted = text
    .replace(/\bdu\b/gi, 'der/die Schüler/in')
    .replace(/\bdein\b/gi, 'des/der Schüler/in')
    .replace(/\bdeine\b/gi, 'des/der Schüler/in')
    .replace(/\bdir\b/gi, 'dem/der Schüler/in')
    .replace(/\bdich\b/gi, 'den/die Schüler/in')
    .replace(/\bdu\s+solltest\b/gi, 'es wäre sinnvoll, wenn')
    .replace(/\bdu\s+sollst\b/gi, 'es wäre sinnvoll, wenn')
    .replace(/\bachte\s+auf\b/gi, 'es sollte beachtet werden')
    .replace(/\bversuche\b/gi, 'es sollte versucht werden')
    .replace(/\bverwende\b/gi, 'es sollte verwendet werden')
    .replace(/\bverbessere\b/gi, 'es sollte verbessert werden');
  
  // Stelle sicher, dass Sätze mit "Der/die Schüler/in" beginnen, wenn nötig
  if (!converted.match(/^(Der|Die|Der\/die|Es|Die Leistung|Die Antwort)/i)) {
    // Falls der Satz nicht mit 3. Person beginnt, versuche ihn anzupassen
    converted = converted.replace(/^(.+?)(\.|$)/, (match, content) => {
      if (!content.match(/^(Der|Die|Der\/die|Es|Die Leistung|Die Antwort)/i)) {
        return `Die Schülerleistung zeigt, dass ${content.toLowerCase()}`;
      }
      return match;
    });
  }
  
  return converted;
}

/**
 * Rendert die komplette Analyse für Lehrer-Ansicht
 */
export function renderTeacherResultSection(analysis: ParsedAnalysis, gradeLevel: number = 10) {
  // WICHTIG: Berechne Prozentsatz aus korrekten Punkten (nicht aus analysis.prozent, das könnte falsch sein)
  const percentage = analysis.gesamtpunkte > 0 
    ? (analysis.erreichtePunkte / analysis.gesamtpunkte) * 100 
    : analysis.prozent;
  const gradeInfo = getGradeInfo({ prozent: percentage, gradeLevel });
  const grade = gradeInfo.label;
  const performanceLevel = getPerformanceLevel(percentage);

  return {
    summary: renderTeacherSummary(analysis),
    tasks: analysis.aufgaben.map(renderTeacherTask),
    overall: {
      points: `${analysis.erreichtePunkte}/${analysis.gesamtpunkte}`,
      percentage: percentage, // Verwende berechneten Prozentsatz, nicht analysis.prozent
      note: grade,
      grade: grade,
      performanceLevel: performanceLevel,
    },
  };
}

