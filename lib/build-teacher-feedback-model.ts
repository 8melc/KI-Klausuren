import type { KlausurAnalyse } from './openai';
import type { CourseInfo } from '@/types/results';
import { mapToParsedAnalysis } from '@/types/analysis';
import { renderTeacherResultSection } from './renderers/teacher-renderer';
import { parseSummary } from './parse-analysis';

export interface TeacherFeedbackTaskModel {
  id: string;
  label: string; // z.B. "1.1"
  pointsScored: number;
  pointsMax: number;
  whatWasGood: string[];
  whatToImprove: string[];
  tipsForYou?: string[];
  corrections?: string[];
}

export interface TeacherFeedbackSummaryModel {
  strengths: string[];
  developmentAreas: string[];
  rawSummary?: string; // Original-Fließtext aus analysis.zusammenfassung
}

export interface TeacherFeedbackModel {
  summary: TeacherFeedbackSummaryModel;
  tasks: TeacherFeedbackTaskModel[];
}

export async function buildTeacherFeedbackModel(
  analysis: KlausurAnalyse,
  courseInfo?: CourseInfo,
): Promise<TeacherFeedbackModel> {
  // Grade-Level nur für Notenberechnung im Lehrer-Renderer relevant
  const gradeLevel = courseInfo?.gradeLevel ? parseInt(courseInfo.gradeLevel, 10) || 10 : 10;

  // 1. Analyse in ParsedAnalysis umwandeln (wie bei ResultCard)
  const parsed = mapToParsedAnalysis(analysis, '');

  // 2. Lehrer-Ansicht rendern (sachliche 3.-Person-Sprache) - nur für Aufgaben-Details
  const teacherView = renderTeacherResultSection(parsed, gradeLevel);

  // 3. Summary aus analysis.zusammenfassung parsen (pädagogisch wertvoller als technische Zusammenfassung)
  const rawSummary = analysis.zusammenfassung || '';
  const parsedSummary = parseSummary(rawSummary);
  
  // Konvertiere Fließtext in Arrays (falls strukturiert)
  // Unterstützt verschiedene Formate: Bullet-Points (•, -, *), Nummerierungen (1., 2.), Zeilenumbrüche
  const splitIntoArray = (text: string): string[] => {
    if (!text) return [];
    
    // Versuche verschiedene Trennzeichen
    const separators = [
      /\n\s*[•\-\*]\s+/,  // Bullet-Points mit Zeilenumbruch
      /\n\s*\d+\.\s+/,     // Nummerierungen (1., 2., etc.)
      /\n\s*[-]\s+/,       // Einfache Striche
      /\n\n+/,             // Doppelte Zeilenumbrüche
      /[•\-\*]\s+/,        // Inline Bullet-Points
    ];
    
    for (const sep of separators) {
      const parts = text.split(sep).map((s) => s.trim()).filter((s) => s.length > 0);
      if (parts.length > 1) {
        return parts;
      }
    }
    
    // Falls keine Struktur gefunden, als einzelnes Element zurückgeben
    return text.trim() ? [text.trim()] : [];
  };
  
  const strengths: string[] = parsedSummary.staerken
    ? splitIntoArray(parsedSummary.staerken)
    : [];
  
  const developmentAreas: string[] = parsedSummary.entwicklungsbereiche
    ? splitIntoArray(parsedSummary.entwicklungsbereiche)
    : [];

  // Falls parseSummary nichts Brauchbares liefert, nutze technische Zusammenfassung als Fallback
  // (aber nur wenn wirklich nichts aus analysis.zusammenfassung extrahiert werden konnte)
  const summary: TeacherFeedbackSummaryModel = {
    strengths: strengths.length > 0 ? strengths : teacherView.summary.strengths,
    developmentAreas: developmentAreas.length > 0 ? developmentAreas : teacherView.summary.developmentAreas,
    rawSummary: rawSummary, // Original-Fließtext für Fallback
  };

  // 4. Aufgaben in TeacherFeedbackTaskModel überführen
  const tasks: TeacherFeedbackTaskModel[] = teacherView.tasks.map((task) => {
    // Punkte aus "2/5" extrahieren
    let pointsScored = 0;
    let pointsMax = 0;
    if (task.points) {
      const [scoredRaw, maxRaw] = task.points.split('/').map((part) => part.trim());
      pointsScored = parseInt(scoredRaw || '0', 10) || 0;
      pointsMax = parseInt(maxRaw || '0', 10) || 0;
    }

    return {
      id: task.taskId,
      label: task.taskTitle,
      pointsScored,
      pointsMax,
      whatWasGood: task.correctAspects ?? [],
      whatToImprove: task.deductions ?? [],
      tipsForYou: task.improvementHints ?? [],
      corrections: task.corrections ?? [],
    };
  });

  return {
    summary,
    tasks,
  };
}


