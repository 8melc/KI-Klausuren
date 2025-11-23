'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import DataResetButton from '@/components/DataResetButton';
import ProtectedRoute from '@/components/ProtectedRoute';
import { KlausurAnalyse } from '@/lib/openai';
import { getGradeInfo } from '@/lib/grades';

type ResultStatus = 'Analyse läuft…' | 'Bereit' | 'Fehler';

interface StoredAnalysis {
  id: string;
  name: string;
  docId: string;
  subject: string;
  gradeLevel: string;
  className: string;
  fileName: string;
  status: ResultStatus;
  analysis?: KlausurAnalyse;
}

const loadDocs = () => {
  const raw = localStorage.getItem('klausurDocs');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export default function ResultsPage() {
  const [results, setResults] = useState<StoredAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progressStudent, setProgressStudent] = useState<string | null>(null);
  const [progressMeta, setProgressMeta] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [filterSubject, setFilterSubject] = useState('Alle');
  const [filterGrade, setFilterGrade] = useState('Alle');
  const [filterClass, setFilterClass] = useState('Alle');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('klausurAnalysen');
    if (stored) {
      try {
        setResults(JSON.parse(stored));
      } catch {
        setResults([]);
      }
    }
  }, []);

  const persistResults = (entries: StoredAnalysis[]) => {
    setResults(entries);
    localStorage.setItem('klausurAnalysen', JSON.stringify(entries));
  };

  const appendResult = (entry: StoredAnalysis) => {
    setResults((prev) => {
      const next = [...prev, entry];
      localStorage.setItem('klausurAnalysen', JSON.stringify(next));
      return next;
    });
  };

  const updateResult = (id: string, partial: Partial<StoredAnalysis>) => {
    setResults((prev) => {
      const next = prev.map((entry) => (entry.id === id ? { ...entry, ...partial } : entry));
      localStorage.setItem('klausurAnalysen', JSON.stringify(next));
      return next;
    });
  };

  const handleAnalyze = useCallback(async () => {
    const expectation = localStorage.getItem('erwartungshorizont');
    if (!expectation) {
      alert('Bitte laden Sie zuerst den Erwartungshorizont hoch.');
      return;
    }

    const docs = loadDocs();
    if (docs.length === 0) {
      alert('Bitte laden Sie vorher Klausuren hoch.');
      return;
    }

    const processedIds = new Set(results.map((entry) => entry.id));
    setIsLoading(true);
    setProgressMeta({ current: 0, total: docs.length });

    try {
      for (let index = 0; index < docs.length; index++) {
        const doc = docs[index];
        setProgressStudent(doc.name);
        setProgressMeta({ current: index + 1, total: docs.length });

        if (processedIds.has(doc.id)) {
          continue;
        }

        appendResult({
          id: doc.id,
          docId: doc.id,
          name: doc.name,
          subject: doc.subject,
          gradeLevel: doc.gradeLevel,
          className: doc.className,
          fileName: doc.name,
          status: 'Analyse läuft…',
        });

        processedIds.add(doc.id);

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            klausurText: doc.text,
            erwartungshorizont: expectation,
          }),
        });

        if (!response.ok) {
          updateResult(doc.id, { status: 'Fehler' });
          continue;
        }

        const analysis = (await response.json()) as KlausurAnalyse;
        updateResult(doc.id, { analysis, status: 'Bereit' });
      }
    } catch (error) {
      console.error('Analyze error:', error);
    } finally {
      setIsLoading(false);
      setProgressStudent(null);
      setProgressMeta({ current: 0, total: 0 });
    }
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter((entry) => {
      if (filterSubject !== 'Alle' && entry.subject !== filterSubject) return false;
      if (filterGrade !== 'Alle' && entry.gradeLevel !== filterGrade) return false;
      if (filterClass !== 'Alle' && entry.className !== filterClass) return false;
      return true;
    });
  }, [results, filterSubject, filterGrade, filterClass]);

  const allSubjects = useMemo(() => Array.from(new Set(results.map((entry) => entry.subject))), [results]);
  const allGrades = useMemo(() => Array.from(new Set(results.map((entry) => entry.gradeLevel))), [results]);
  const allClasses = useMemo(() => Array.from(new Set(results.map((entry) => entry.className))), [results]);

  const handleRowClick = (entryId: string) => {
    router.push(`/results/${entryId}`);
  };

  return (
    <ProtectedRoute>
      {isLoading && (
        <div className="processing-banner">
          <div className="container">
            <div className="processing-content">
              <div className="processing-spinner" aria-hidden />
              <div className="processing-text">
                <p className="processing-title">
                  {progressStudent ? `Analysiere: ${progressStudent}` : 'Analysiere Klausuren...'}
                </p>
                <p className="processing-subtitle">
                  {progressMeta.total > 0 ? `Schritt ${progressMeta.current} von ${progressMeta.total}` : 'Bitte warten...'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="results-section">
        <div className="container">
          <div className="results-header">
            <div>
              <h1 className="results-title">Klausuren</h1>
              <p className="results-subtitle">{results.length} analysierte Arbeiten</p>
            </div>
            <div className="results-actions">
              <button type="button" onClick={handleAnalyze} disabled={isLoading} className="primary-button">
                <span>Analyse starten</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <DataResetButton
                onReset={() => persistResults([])}
                label="Daten löschen"
              />
            </div>
          </div>

          <div className="filter-row">
            <label>
              Jahrgang
              <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
                <option value="Alle">Alle</option>
                {allGrades.map((grade) => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </label>
            <label>
              Fach
              <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                <option value="Alle">Alle</option>
                {allSubjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </label>
            <label>
              Klasse
              <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}>
                <option value="Alle">Alle</option>
                {allClasses.map((klass) => (
                  <option key={klass} value={klass}>{klass}</option>
                ))}
              </select>
            </label>
          </div>

          {filteredResults.length === 0 ? (
            <div className="results-empty-card">
              <h3>Keine Ergebnisse</h3>
              <p>Lade eine oder mehrere Klausuren hoch und starte die Analyse. Die Ergebnisse erscheinen hier.</p>
            </div>
          ) : (
            <div className="results-table-card">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Schüler/in</th>
                    <th>Fach · Jahrgang · Klasse</th>
                    <th>Status</th>
                    <th>Punkte</th>
                    <th>Note</th>
                    <th>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((entry) => {
                    const grade = entry.analysis ? getGradeInfo(entry.analysis.prozent) : { badgeClass: 'grade-badge-average', label: '?' };
                    return (
                      <tr key={entry.id} className="results-row" onClick={() => handleRowClick(entry.id)}>
                        <td>
                          <div className="student-cell">
                            <div className="student-avatar">
                              {entry.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                            <span className="student-name">{entry.name}</span>
                          </div>
                        </td>
                        <td>{entry.subject} · Jahrgang {entry.gradeLevel} · {entry.className}</td>
                        <td>
                          <span
                            className={`badge ${entry.status === 'Bereit' ? 'badge-success' : entry.status === 'Analyse läuft…' ? 'badge-info' : 'badge-error'}`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td>{entry.analysis ? `${entry.analysis.erreichtePunkte} / ${entry.analysis.gesamtpunkte}` : '—'}</td>
                        <td>
                          <span className={`grade-badge ${grade.badgeClass}`}>{grade.label}</span>
                        </td>
                        <td>
                          <Link href={`/results/${entry.id}`} className="text-link">
                            Details ansehen →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}
