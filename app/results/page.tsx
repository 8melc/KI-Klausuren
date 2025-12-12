'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataResetButton from '@/components/DataResetButton';
import ProtectedRoute from '@/components/ProtectedRoute';
import ResultCompactView from '@/components/ResultCompactView';
import DetailDrawer from '@/components/DetailDrawer';
import { getGradeInfo, getPerformanceLevel, gradeColor } from '@/lib/grades';
import { RawStoredResult, StoredResultEntry, STORAGE_KEY } from '@/types/results';

// ============================================================================
// STORAGE KEY: Muss exakt mit correction/page.tsx übereinstimmen
// ============================================================================
const RESULTS_STORAGE_KEY = 'correctionpilot-results';

interface StoredResult {
  id: string;
  fileName: string;
  studentName: string;
  status: string; // 'Bereit' | 'Fehler' | 'Analyse läuft…'
  analysis: any; // Das KI-Ergebnis
  course?: {
    subject: string;
    gradeLevel: string;
    className: string;
    schoolYear: string;
  };
  gesamtpunkte?: number;
  erreichtePunkte?: number;
  prozent?: number;
  zusammenfassung?: string;
}

const readResults = (): StoredResultEntry[] => {
  if (typeof window === 'undefined') return [];
  
  // KRITISCH: Verwende exakt denselben Key wie correction/page.tsx
  const raw = localStorage.getItem(RESULTS_STORAGE_KEY);
  if (!raw) {
    console.log('[Results] Keine Daten im LocalStorage gefunden unter Key:', RESULTS_STORAGE_KEY);
    return [];
  }
  
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[Results] Daten sind kein Array:', typeof parsed);
      return [];
    }
    
    console.log(`[Results] ${parsed.length} Einträge aus LocalStorage geladen`);
    
    return parsed.map((item: any) => {
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
    console.error('[Results] Fehler beim Lesen der Ergebnisse:', error);
    return [];
  }
};

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<StoredResultEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filterSubject, setFilterSubject] = useState('Alle');
  const [filterGrade, setFilterGrade] = useState('Alle');
  const [filterClass, setFilterClass] = useState('Alle');
  const [openResultId, setOpenResultId] = useState<string | null>(null);
  const [selectedKlausurId, setSelectedKlausurId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ============================================================================
  // CLIENT-SIDE ONLY: Lade Daten beim Mounten (verhindert Hydration-Errors)
  // ============================================================================
  useEffect(() => {
    console.log('[Results] Component mounted, lade Daten aus LocalStorage...');
    const loadedResults = readResults();
    setResults(loadedResults);
    setIsLoaded(true);
    console.log(`[Results] ${loadedResults.length} Ergebnisse geladen`);
  }, []);

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
    localStorage.removeItem(RESULTS_STORAGE_KEY);
    setResults([]);
    setOpenResultId(null);
    setSelectedKlausurId(null);
    setIsDrawerOpen(false);
  };

  const toggleResult = (id: string) => {
    setOpenResultId((current) => (current === id ? null : id));
  };

  const handleShowDetails = (id: string) => {
    setSelectedKlausurId(id);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedKlausurId(null);
  };

  const selectedEntry = useMemo(() => {
    if (!selectedKlausurId) return null;
    return results.find((entry) => entry.id === selectedKlausurId) || null;
  }, [selectedKlausurId, results]);

  return (
    <ProtectedRoute>
      <section className="module-section">
        <div className="container">
          <div className="results-hero-card">
            <div>
              <h2>Alle Klausuren</h2>
              <p>{results.length} Ergebnisse • {filteredResults.length} angezeigt</p>
            </div>
          </div>

          <div className="module-grid results-grid-spacing">
            <div className="module-card">
              <h3>Filter & Übersicht</h3>

              <div className="results-actions results-actions-spacing">
                <button type="button" onClick={refreshResults} className="secondary-button">
                  Liste aktualisieren
                </button>
                <DataResetButton onReset={resetAllResults} label="Alle Ergebnisse löschen" />
              </div>

              <div className="filter-row filter-row-spacing">
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

              {!isLoaded ? (
                <div className="results-empty-card">
                  <h3>Lade Ergebnisse...</h3>
                  <p>Bitte warten, Daten werden geladen...</p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="results-empty-card">
                  <h3>Keine Ergebnisse gefunden</h3>
                  <p>Es wurden noch keine Klausuren analysiert oder die Ergebnisse konnten nicht geladen werden.</p>
                  <button
                    type="button"
                    onClick={() => router.push('/correction')}
                    className="primary-button"
                    style={{ marginTop: 'var(--spacing-md)' }}
                  >
                    Zurück zur Analyse
                  </button>
                </div>
              ) : (
                <div className="results-accordion">
                  {filteredResults.map((entry, index) => {
                    const gradeLevel = entry.course.gradeLevel ? parseInt(entry.course.gradeLevel, 10) || 10 : 10;
                    const gradeInfo = entry.analysis
                      ? getGradeInfo({ prozent: entry.analysis.prozent, gradeLevel })
                      : null;
                    const grade = gradeInfo ? gradeInfo.label : '–';
                    const statusBadgeClass =
                      entry.status === 'Bereit'
                        ? 'badge-success'
                        : entry.status === 'Analyse läuft…'
                          ? 'badge-info'
                          : 'badge-error';

                    // Sicherstellen, dass key immer eindeutig ist
                    const uniqueKey = entry.id || `result-${index}-${entry.studentName}`;

                return (
                  <article
                    key={uniqueKey}
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
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`badge ${statusBadgeClass}`}>{entry.status}</span>
                          <span className={`grade-badge ${gradeInfo ? gradeInfo.badgeClass : 'grade-unknown'}`}>{grade}</span>
                        </div>
                        <span className="text-sm text-gray-700">
                          {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                    </button>

                        {openResultId === entry.id && (
                          <div className="results-accordion-content">
                            {entry.analysis ? (
                              <ResultCompactView entry={entry} onShowDetails={() => handleShowDetails(entry.id)} />
                            ) : (
                              <div className="text-sm text-gray-600 mb-4">
                                Die Analyse läuft noch. Sobald sie abgeschlossen ist, erscheint hier die Detailauswertung.
                              </div>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Detail Drawer */}
          <DetailDrawer entry={selectedEntry} isOpen={isDrawerOpen} onClose={handleCloseDrawer} />
        </div>
      </section>
    </ProtectedRoute>
  );
}
