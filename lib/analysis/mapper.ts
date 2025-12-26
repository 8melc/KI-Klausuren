import type { KlausurAnalyse } from '../openai';
import type { UniversalAnalysis } from './types';
import { getGradeInfo, getPerformanceLevel } from '../grades';

/**
 * Mappt KlausurAnalyse zu UniversalAnalysis
 * Für die neue AI-Pipeline
 */
export function mapToUniversalAnalysis(
  analysis: KlausurAnalyse,
  meta: {
    studentName: string;
    className: string;
    subject: string;
    schoolYear: string;
    gradeLevel?: number;
  }
): UniversalAnalysis {
  const percentage = (analysis.erreichtePunkte / analysis.gesamtpunkte) * 100;
  const gradeLevel = meta.gradeLevel || 10;
  const gradeInfo = getGradeInfo({ prozent: percentage, gradeLevel });
  const gradeLabel = gradeInfo.label;
  const perf = getPerformanceLevel(percentage);
  
  return {
    meta: {
      studentName: meta.studentName,
      class: meta.className,
      subject: meta.subject,
      date: new Date().toISOString().split('T')[0],
      maxPoints: analysis.gesamtpunkte,
      achievedPoints: analysis.erreichtePunkte,
      grade: gradeLabel,
      performanceLevel: perf,
    },
    tasks: analysis.aufgaben.map((task, idx) => ({
      taskId: `task-${idx + 1}`,
      taskTitle: task.aufgabe,
      points: `${task.erreichtePunkte}/${task.maxPunkte}`,
      whatIsCorrect: parseWhatIsCorrect(task.kommentar),
      whatIsWrong: parseWhatIsWrong(task.kommentar),
      improvementTips: parseImprovementTips(task.kommentar),
      teacherCorrections: task.korrekturen || [],
      studentFriendlyTips: [],
      studentAnswerSummary: '',
    })),
    strengths: [], // Wird von renderForStudent generiert
    nextSteps: [], // Wird von renderForStudent generiert
    teacherConclusion: {
      summary: analysis.zusammenfassung,
      studentPatterns: [],
      learningNeeds: [],
      recommendedActions: [],
    },
  };
}

function parseWhatIsCorrect(block: string): string[] {
  const match = block.match(
    /DAS WAR RICHTIG[:\s]*([\s\S]*?)(?:HIER GAB ES ABZÜGE|VERBESSERUNGSTIPP|$)/i
  );
  if (!match) return [];
  return match[1]
    .split(/[•\-\*]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function parseWhatIsWrong(block: string): string[] {
  const match = block.match(
    /HIER GAB ES ABZÜGE[:\s]*([\s\S]*?)(?:VERBESSERUNGSTIPP|$)/i
  );
  if (!match) return [];
  return match[1]
    .split(/[•\-\*]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function parseImprovementTips(block: string): string[] {
  const match = block.match(/VERBESSERUNGSTIPP[:\s]*([\s\S]*?)$/i);
  if (!match) return [];
  return match[1]
    .split(/[•\-\*]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

