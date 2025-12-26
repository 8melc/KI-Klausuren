/**
 * Zentrale Funktion zum Erstellen eines strukturierten Feedback-Modells
 * 
 * Dieses Modell wird sowohl für:
 * - Word-Dokument-Export (.docx)
 * - Feedback-Vorschau (HTML/React)
 * 
 * verwendet, um sicherzustellen, dass beide exakt dasselbe anzeigen.
 */

import type { KlausurAnalyse } from './openai';
import type { CourseInfo } from '@/types/results';
import { getGradeInfo } from './grades';
import { mapToParsedAnalysis } from '@/types/analysis';
import {
  renderAndPolishStudentDocSections,
  renderStudentDocSections,
} from './renderers/student-renderer';
import { getDistributionConfig } from './analysis/strength-nextsteps-distribution';

export interface FeedbackTaskModel {
  taskId: string;
  taskTitle: string;
  points: string; // "2/5"
  erreichtePunkte: number;
  maxPunkte: number;
  
  // Strukturierte Bewertung in Du-Form
  whatYouDidWell: string[]; // "Das war richtig"
  whatNeedsImprovement: string[]; // "Hier kannst du noch verbessern"
  tipsForYou: string[]; // "Tipp für dich"
  corrections: string[]; // "Korrekturen"
}

export interface FeedbackSummaryModel {
  yourStrengths: string[]; // "DEINE STÄRKEN"
  yourNextSteps: string[]; // "DEINE NÄCHSTEN SCHRITTE"
  overallMessage?: string; // Optional: Gesamtbotschaft
}

export interface FeedbackModel {
  // Metadaten
  studentName: string;
  className?: string;
  subject?: string;
  gradeLevel?: string;
  schoolYear?: string;
  date: string;
  
  // Gesamtbewertung
  erreichtePunkte: number;
  gesamtpunkte: number;
  percentage: number;
  grade: string;
  
  // Zusammenfassung
  summary: FeedbackSummaryModel;
  
  // Aufgaben-Details
  tasks: FeedbackTaskModel[];
}

export interface BuildFeedbackModelOptions {
  /**
   * Ob Language-Polishing (OpenAI) angewendet werden soll.
   *
   * - true  → verwendet `renderAndPolishStudentDocSections` (mit OpenAI)
   * - false → verwendet `renderStudentDocSections` (ohne OpenAI)
   *
   * Standard: true (für Word-Export).
   * Für React-Vorschau unbedingt auf false setzen, damit kein OPENAI_API_KEY nötig ist.
   */
  polish?: boolean;
}

/**
 * Baut ein strukturiertes Feedback-Modell aus Analyse-Daten
 * 
 * @param analysis - Die KlausurAnalyse
 * @param courseInfo - Kurs-Informationen
 * @param studentName - Name des Schülers/der Schülerin
 * @returns FeedbackModel - Strukturiertes Modell für Export und Vorschau
 */
export async function buildFeedbackModel(
  analysis: KlausurAnalyse,
  courseInfo?: CourseInfo,
  studentName?: string,
  options?: BuildFeedbackModelOptions
): Promise<FeedbackModel> {
  const percentage = (analysis.erreichtePunkte / analysis.gesamtpunkte) * 100;
  const gradeLevel = courseInfo?.gradeLevel ? parseInt(courseInfo.gradeLevel, 10) || 10 : 10;
  const gradeInfo = getGradeInfo({ prozent: percentage, gradeLevel });
  const grade = gradeInfo.label;

  // Schritt 1: Konvertiere zu ParsedAnalysis
  const parsed = mapToParsedAnalysis(analysis, grade);

  // Schritt 2: Rendere Schüler-Ansicht
  // - Für Word-Export (Standard): mit Polishing (OpenAI) → schönere Texte
  // - Für React-Vorschau: OHNE Polishing → keine OpenAI-Abhängigkeit
  const polish = options?.polish ?? true;
  const studentView = polish
    ? await renderAndPolishStudentDocSections(parsed, gradeLevel)
    : renderStudentDocSections(parsed, gradeLevel);

  // Schritt 3: Verwende die gerenderten Texte als Basis
  let strengths: string[] = [...studentView.summary.yourStrengths];
  let nextSteps: string[] = [...studentView.summary.yourNextSteps];

  // Schritt 4: Wende Verteilungslogik an (wie im Word-Export)
  const distributionConfig = getDistributionConfig(percentage);

  // Stelle sicher, dass die Anzahl der Stärken/Nächste Schritte passt
  if (strengths.length < distributionConfig.strengthsCount.min) {
    const additional = ['Du hast die Aufgabenstellung grundlegend verstanden.'];
    strengths = [...strengths, ...additional].slice(0, distributionConfig.strengthsCount.max);
  }
  if (strengths.length > distributionConfig.strengthsCount.max) {
    strengths = strengths.slice(0, distributionConfig.strengthsCount.max);
  }

  if (nextSteps.length < distributionConfig.nextStepsCount.min) {
    const additional = ['Wiederhole die wichtigsten Fachbegriffe zu diesem Thema.'];
    nextSteps = [...nextSteps, ...additional].slice(0, distributionConfig.nextStepsCount.max);
  }
  if (nextSteps.length > distributionConfig.nextStepsCount.max) {
    nextSteps = nextSteps.slice(0, distributionConfig.nextStepsCount.max);
  }

  // Stelle sicher, dass mindestens die Mindestanzahl vorhanden ist
  if (strengths.length === 0) {
    strengths = ['Du hast die Aufgabenstellung grundlegend verstanden.'];
  }
  if (nextSteps.length === 0) {
    nextSteps = ['Wiederhole die wichtigsten Fachbegriffe zu diesem Thema.'];
  }

  // Schritt 5: Baue das finale Modell
  return {
    studentName: studentName || 'Unbekannt',
    className: courseInfo?.className,
    subject: courseInfo?.subject,
    gradeLevel: courseInfo?.gradeLevel,
    schoolYear: courseInfo?.schoolYear,
    date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    
    erreichtePunkte: analysis.erreichtePunkte,
    gesamtpunkte: analysis.gesamtpunkte,
    percentage: percentage,
    grade: grade,
    
    summary: {
      yourStrengths: strengths,
      yourNextSteps: nextSteps,
      overallMessage: studentView.summary.overallMessage,
    },
    
    tasks: studentView.tasks.map((task) => ({
      taskId: task.taskId,
      taskTitle: task.taskTitle,
      points: task.points,
      erreichtePunkte: parseInt(task.points.split('/')[0], 10),
      maxPunkte: parseInt(task.points.split('/')[1], 10),
      whatYouDidWell: task.whatYouDidWell,
      whatNeedsImprovement: task.whatNeedsImprovement,
      tipsForYou: task.tipsForYou,
      corrections: task.corrections,
    })),
  };
}

