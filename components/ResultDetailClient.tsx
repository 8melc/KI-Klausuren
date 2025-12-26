'use client';

import { useMemo } from 'react';
import TeacherFeedbackDocument from '@/components/TeacherFeedbackDocument';
import { RawStoredResult, StoredResultEntry, CourseInfo } from '@/types/results';

// KRITISCH: Muss exakt mit correction/page.tsx und results/page.tsx übereinstimmen
const STORAGE_KEY = 'correctionpilot-results';

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
    if (!raw) {
      console.log('[ResultDetailClient] Keine Daten im localStorage gefunden');
      return null;
    }
    try {
      const list: RawStoredResult[] = JSON.parse(raw);
      console.log('[ResultDetailClient] Gefundene Einträge:', list.length);
      
      // URL-decode die ID, falls sie encoded ist
      const decodedId = decodeURIComponent(id);
      console.log('[ResultDetailClient] Gesuchte ID (original):', id);
      console.log('[ResultDetailClient] Gesuchte ID (decoded):', decodedId);
      
      // Versuche zuerst mit decoded ID, dann mit original ID
      let found = list.find((item) => item.id === decodedId);
      if (!found) {
        found = list.find((item) => item.id === id);
      }
      
      if (!found) {
        console.log('[ResultDetailClient] Eintrag mit ID nicht gefunden:', decodedId);
        console.log('[ResultDetailClient] Verfügbare IDs:', list.map(item => item.id));
        return null;
      }
      console.log('[ResultDetailClient] Eintrag gefunden:', found);
      console.log('[ResultDetailClient] Analysis vorhanden:', !!found.analysis);
      console.log('[ResultDetailClient] Analysis-Struktur:', found.analysis ? {
        hasAufgaben: Array.isArray(found.analysis.aufgaben),
        aufgabenLength: found.analysis.aufgaben?.length,
        hasGesamtpunkte: 'gesamtpunkte' in (found.analysis || {}),
        hasErreichtePunkte: 'erreichtePunkte' in (found.analysis || {}),
        keys: Object.keys(found.analysis || {})
      } : 'null');
      return hydrateEntry(found);
    } catch (error) {
      console.error('[ResultDetailClient] Fehler beim Parsen:', error);
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
          <p className="text-center text-gray-600">Die Analyse läuft noch. Bitte warte kurz.</p>
        </div>
      </section>
    );
  }

  // Zusätzliche Prüfung: Ist aufgaben ein Array?
  if (!Array.isArray(entry.analysis.aufgaben)) {
    console.error('[ResultDetailClient] analysis.aufgaben ist kein Array:', entry.analysis.aufgaben);
    return (
      <section className="page-section">
        <div className="container">
          <p className="text-center text-gray-600">
            Die Analyse-Daten haben ein ungültiges Format. Bitte öffne die Browser-Konsole für Details.
          </p>
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
