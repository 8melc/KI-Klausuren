'use client';

import { useMemo } from 'react';
import TeacherFeedbackDocument from '@/components/TeacherFeedbackDocument';
import { RawStoredResult, StoredResultEntry, STORAGE_KEY, CourseInfo } from '@/types/results';

const hydrateEntry = (item: RawStoredResult): StoredResultEntry => {
  const course: CourseInfo = {
    subject: item.course?.subject ?? item.subject ?? '–',
    gradeLevel: item.course?.gradeLevel ?? item.gradeLevel ?? '–',
    className: item.course?.className ?? item.className ?? '–',
    schoolYear: item.course?.schoolYear ?? item.schoolYear ?? 'Nicht angegeben',
  };

  return {
    id: item.id ?? '',
    studentName: item.studentName ?? 'Schüler/in',
    status: item.status ?? 'Fehler',
    fileName: item.fileName ?? 'Klausur',
    analysis: item.analysis,
    course,
  };
};

export default function ResultDetailClient({ id }: { id: string }) {
  const entry = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const list: RawStoredResult[] = JSON.parse(raw);
      const found = list.find((item) => item.id === id);
      if (!found) return null;
      return hydrateEntry(found);
    } catch {
      return null;
    }
  }, [id]);

  if (!entry) {
    return (
      <section className="page-section">
        <div className="container">
          <p className="text-center text-gray-600">Keine Analyse für diese Klausur vorhanden.</p>
        </div>
      </section>
    );
  }

  if (!entry.analysis) {
    return (
      <section className="page-section">
        <div className="container">
          <p className="text-center text-gray-600">Die Analyse läuft noch. Bitte warten Sie kurz.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container">
        <TeacherFeedbackDocument entry={entry} />
      </div>
    </section>
  );
}
