import type { UniversalAnalysis } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateAnalysis(analysis: any): ValidationResult {
  const errors: string[] = [];

  // Meta-Validierung
  if (!analysis.meta) {
    errors.push('meta fehlt');
  } else {
    const meta = analysis.meta;
    if (!meta.studentName) errors.push('meta.studentName fehlt');
    if (!meta.class) errors.push('meta.class fehlt');
    if (!meta.subject) errors.push('meta.subject fehlt');
    if (!meta.date) errors.push('meta.date fehlt');
    if (typeof meta.maxPoints !== 'number') errors.push('meta.maxPoints muss eine Zahl sein');
    if (typeof meta.achievedPoints !== 'number') errors.push('meta.achievedPoints muss eine Zahl sein');
    if (!meta.grade) errors.push('meta.grade fehlt');
  }

  // Tasks-Validierung
  if (!Array.isArray(analysis.tasks)) {
    errors.push('tasks muss ein Array sein');
  } else {
    analysis.tasks.forEach((task: any, index: number) => {
      if (!task.taskId) errors.push(`tasks[${index}].taskId fehlt`);
      if (!task.taskTitle) errors.push(`tasks[${index}].taskTitle fehlt`);
      if (!task.points) errors.push(`tasks[${index}].points fehlt`);
      if (!Array.isArray(task.whatIsCorrect)) errors.push(`tasks[${index}].whatIsCorrect muss ein Array sein`);
      if (!Array.isArray(task.whatIsWrong)) errors.push(`tasks[${index}].whatIsWrong muss ein Array sein`);
      if (!Array.isArray(task.improvementTips)) errors.push(`tasks[${index}].improvementTips muss ein Array sein`);
      if (!Array.isArray(task.teacherCorrections)) errors.push(`tasks[${index}].teacherCorrections muss ein Array sein`);
      if (!Array.isArray(task.studentFriendlyTips)) errors.push(`tasks[${index}].studentFriendlyTips muss ein Array sein`);
    });
  }

  // Strengths & NextSteps
  if (!Array.isArray(analysis.strengths)) errors.push('strengths muss ein Array sein');
  if (!Array.isArray(analysis.nextSteps)) errors.push('nextSteps muss ein Array sein');

  // TeacherConclusion-Validierung
  if (!analysis.teacherConclusion) {
    errors.push('teacherConclusion fehlt');
  } else {
    const tc = analysis.teacherConclusion;
    if (!tc.summary) errors.push('teacherConclusion.summary fehlt');
    if (!Array.isArray(tc.studentPatterns)) errors.push('teacherConclusion.studentPatterns muss ein Array sein');
    if (!Array.isArray(tc.learningNeeds)) errors.push('teacherConclusion.learningNeeds muss ein Array sein');
    if (!Array.isArray(tc.recommendedActions)) errors.push('teacherConclusion.recommendedActions muss ein Array sein');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Bereinigt und normalisiert die Analyse
 */
export function normalizeAnalysis(analysis: any): UniversalAnalysis {
  return {
    meta: {
      studentName: analysis.meta?.studentName || '',
      class: analysis.meta?.class || '',
      subject: analysis.meta?.subject || '',
      date: analysis.meta?.date || new Date().toISOString().split('T')[0],
      maxPoints: analysis.meta?.maxPoints || 0,
      achievedPoints: analysis.meta?.achievedPoints || 0,
      grade: analysis.meta?.grade || '',
    },
    tasks: (analysis.tasks || []).map((task: any) => ({
      taskId: task.taskId || '',
      taskTitle: task.taskTitle || '',
      points: task.points || '0/0',
      whatIsCorrect: Array.isArray(task.whatIsCorrect) ? task.whatIsCorrect : [],
      whatIsWrong: Array.isArray(task.whatIsWrong) ? task.whatIsWrong : [],
      improvementTips: Array.isArray(task.improvementTips) ? task.improvementTips : [],
      teacherCorrections: Array.isArray(task.teacherCorrections) ? task.teacherCorrections : [],
      studentFriendlyTips: Array.isArray(task.studentFriendlyTips) ? task.studentFriendlyTips : [],
      studentAnswerSummary: task.studentAnswerSummary || '',
    })),
    strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
    nextSteps: Array.isArray(analysis.nextSteps) ? analysis.nextSteps : [],
    teacherConclusion: {
      summary: analysis.teacherConclusion?.summary || '',
      studentPatterns: Array.isArray(analysis.teacherConclusion?.studentPatterns)
        ? analysis.teacherConclusion.studentPatterns
        : [],
      learningNeeds: Array.isArray(analysis.teacherConclusion?.learningNeeds)
        ? analysis.teacherConclusion.learningNeeds
        : [],
      recommendedActions: Array.isArray(analysis.teacherConclusion?.recommendedActions)
        ? analysis.teacherConclusion.recommendedActions
        : [],
    },
  };
}
