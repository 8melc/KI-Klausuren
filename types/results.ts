import type { KlausurAnalyse } from '@/lib/openai';

export interface CourseInfo {
  subject: string;
  gradeLevel: string;
  className: string;
  schoolYear: string;
}

export type ResultStatus = 'Analyse läuft…' | 'Bereit' | 'Fehler';

export interface StoredResultEntry {
  id: string;
  studentName: string;
  status: ResultStatus;
  course: CourseInfo;
  fileName: string;
  analysis?: KlausurAnalyse;
}

export const STORAGE_KEY = 'klausurAnalysen';

export type RawStoredResult = {
  id?: string;
  studentName?: string;
  status?: ResultStatus;
  fileName?: string;
  course?: Partial<CourseInfo>;
  analysis?: KlausurAnalyse;
  subject?: string;
  gradeLevel?: string;
  className?: string;
  schoolYear?: string;
};
