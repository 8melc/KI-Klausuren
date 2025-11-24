'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import DataResetButton from '@/components/DataResetButton';
import ProtectedRoute from '@/components/ProtectedRoute';
import TeacherFeedbackDocument from '@/components/TeacherFeedbackDocument';
import { getGradeInfo } from '@/lib/grades';
import { RawStoredResult, StoredResultEntry, STORAGE_KEY } from '@/types/results';

const readResults = (): StoredResultEntry[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      const candidate = item as RawStoredResult;
      const course = {
        subject: candidate.course?.subject ?? candidate.subject ?? '–',
        gradeLevel: candidate.course?.gradeLevel ?? candidate.gradeLevel ?? '–',
        className: candidate.course?.className ?? candidate.className ?? '–',
        schoolYear: candidate.course?.schoolYear ?? candidate.schoolYear ?? 'Nicht angegeben',
      };

      return {
        ...candidate,
        course,
      } as StoredResultEntry;
    });
  } catch (error) {
    console.error('Fehler beim Lesen der Ergebnisse:', error);
    return [];
  }
};

export default function ResultsPage() {
  const [results, setResults] = useState<StoredResultEntry[]>(() => readResults());
  const [filterSubject, setFilterSubject] = useState('Alle');
  const [filterGrade, setFilterGrade] = useState('Alle');
  const [filterClass, setFilterClass] = useState('Alle');
  const [openResultId, setOpenResultId] = useState<string | null>(null);

  const filteredResults = useMemo(
    () =>
      results.filter((entry) => {
        if (filterSubject !== 'Alle' && entry.course.subject !== filterSubject) return false;
        if (filterGrade !== 'Alle' && entry.course.gradeLevel !== filterGrade) return false;
        if (filterClass !== 'Alle' && entry.course.className !== filterClass) return false;
        return true;
      }),
    [results, filterSubject, filterGrade, filterClass],
  );

  const subjects = useMemo(() => Array.from(new Set(results.map((entry) => entry.course.subject))), [results]);
  const grades = useMemo(() => Array.from(new Set(results.map((entry) => entry.course.gradeLevel))), [results]);
  const classes = useMemo(() => Array.from(new Set(results.map((entry) => entry.course.className))), [results]);

  const refreshResults = () => {
    setResults(readResults());
  };

  const resetAllResults = () => {
    localStorage.removeItem(STORAGE_KEY);
    setResults([]);
    setOpenResultId(null);
  };

  const toggleResult = (id: string) => {
    setOpenResultId((current) => (current === id ? null : id));
  };

  return (
    <ProtectedRoute>
      <section className="results-section">
        <div className="container">
          <div className="results-header">
            <div>
              <h1 className="results-title">Alle Klausuren</h1>
              <p className="results-subtitle">
                {results.length} Ergebnisse • {filteredResults.length} angezeigt
              </p>
            </div>
            <div className="results-actions">
              <button type="button" onClick={refreshResults} className="secondary-button">
                Liste aktualisieren
              </button>
              <DataResetButton onReset={resetAllResults} label="Alle Ergebnisse löschen" />
            </div>
          </div>

          <div className="filter-row mb-4">
            <label>
              Jahrgang
              <select value={filterGrade} onChange={(event) => setFilterGrade(event.target.value)}>
                <option value="Alle">Alle</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fach
              <select value={filterSubject} onChange={(event) => setFilterSubject(event.target.value)}>
                <option value="Alle">Alle</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Klasse
              <select value={filterClass} onChange={(event) => setFilterClass(event.target.value)}>
                <option value="Alle">Alle</option>
                {classes.map((klass) => (
                  <option key={klass} value={klass}>
                    {klass}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filteredResults.length === 0 ? (
            <div className="results-empty-card">
              <h3>Keine Ergebnisse</h3>
              <p>Starte eine Analyse, um die Liste der Klausuren zu befüllen.</p>
            </div>
          ) : (
            <div className="results-accordion">
              {filteredResults.map((entry) => {
                const gradeLabel = entry.analysis
                  ? getGradeInfo(entry.analysis.prozent)
                  : { badgeClass: 'grade-badge-average', label: '–' };
                const statusBadgeClass =
                  entry.status === 'Bereit'
                    ? 'badge-success'
                    : entry.status === 'Analyse läuft…'
                      ? 'badge-info'
                      : 'badge-error';

                return (
                  <article
                    key={entry.id}
                    className={`results-accordion-item ${openResultId === entry.id ? 'results-accordion-item--open' : ''}`}
                  >
                    <button
                      type="button"
                      className="results-accordion-trigger"
                      onClick={() => toggleResult(entry.id)}
                    >
                      <div>
                        <p className="results-accordion-label">Kurs</p>
                        <p className="results-accordion-name">{entry.studentName}</p>
                        <div className="results-accordion-meta">
                          <span>{entry.course.subject}</span>
                          <span>Jg. {entry.course.gradeLevel}</span>
                          <span>{entry.course.className}</span>
                          <span>{entry.course.schoolYear}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${statusBadgeClass}`}>{entry.status}</span>
                        <span className={`grade-badge ${gradeLabel.badgeClass}`}>{gradeLabel.label}</span>
                      </div>
                    </button>

                    {openResultId === entry.id && (
                      <div className="results-accordion-content">
                        {entry.analysis ? (
                          <TeacherFeedbackDocument entry={entry} />
                        ) : (
                          <div className="text-sm text-gray-600 mb-4">
                            Die Analyse läuft noch. Sobald sie abgeschlossen ist, erscheint hier die Detailauswertung.
                          </div>
                        )}
                        <Link href={`/results/${entry.id}`} className="text-link inline-flex items-center gap-1">
                          Zum Einzelbericht →
                        </Link>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}
