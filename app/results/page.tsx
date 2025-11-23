'use client';

import { useState, useEffect } from 'react';
import ResultCard from '@/components/ResultCard';
import DataResetButton from '@/components/DataResetButton';
import ProtectedRoute from '@/components/ProtectedRoute';
import { KlausurAnalyse } from '@/lib/openai';
import { getGradeInfo } from '@/lib/grades';
import { downloadAnalysisDoc } from '@/lib/downloadDoc';

export default function ResultsPage() {
  const [analyses, setAnalyses] = useState<Array<{ name: string; analysis: KlausurAnalyse }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Lade gespeicherte Analysen aus localStorage
    const saved = localStorage.getItem('klausurAnalysen');
    if (saved) {
      try {
        setAnalyses(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading analyses:', error);
      }
    }
  }, []);

  const handleAnalyze = async () => {
    const klausurText = localStorage.getItem('klausurText');
    const erwartungshorizont = localStorage.getItem('erwartungshorizont');

    if (!klausurText || !erwartungshorizont) {
      alert('Bitte laden Sie zuerst eine Klausur und einen Erwartungshorizont hoch.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          klausurText,
          erwartungshorizont,
        }),
      });

      if (!response.ok) {
        throw new Error('Analyse fehlgeschlagen');
      }

      const analysis = await response.json();
      const klausurName = localStorage.getItem('klausurName') || 'Klausur';

      const newAnalysis = {
        name: klausurName,
        analysis,
      };

      const updated = [...analyses, newAnalysis];
      setAnalyses(updated);
      localStorage.setItem('klausurAnalysen', JSON.stringify(updated));
    } catch (error) {
      console.error('Analyze error:', error);
      alert('Fehler bei der Analyse. Bitte stellen Sie sicher, dass der OpenAI API Key konfiguriert ist.');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToAnalysis = (anchorId: string) => {
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDownload = (name: string, analysis: KlausurAnalyse) => {
    downloadAnalysisDoc(name || 'Klausur', analysis);
  };

  const subtitle = analyses.length
    ? `${analyses.length} Klausur${analyses.length === 1 ? '' : 'en'} analysiert`
    : 'Noch keine Analysen vorhanden';

  return (
    <ProtectedRoute>
      {isLoading && (
        <div className="processing-banner">
          <div className="container">
            <div className="processing-content">
              <div className="processing-spinner" aria-hidden />
              <div className="processing-text">
                <p className="processing-title">Klausuren werden korrigiert...</p>
                <p className="processing-subtitle">Bitte warten Sie einen Moment</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="results-section">
        <div className="container">
          <div className="results-header">
            <div>
              <h1 className="results-title">Korrektur-Ergebnisse</h1>
              <p className="results-subtitle">{subtitle}</p>
            </div>
            <div className="results-actions">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isLoading}
                className="primary-button"
              >
                {isLoading ? (
                  <>
                    <span>Analysiere...</span>
                  </>
                ) : (
                  <>
                    <span>Klausur analysieren</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
              <DataResetButton
                onReset={() => {
                  setAnalyses([]);
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('klausurAnalysen');
                  }
                }}
              />
            </div>
          </div>

          {analyses.length === 0 ? (
            <div className="results-empty-card">
              <h3>Keine Ergebnisse</h3>
              <p>
                Laden Sie eine Klausur und den Erwartungshorizont hoch und starten Sie anschließend
                die Analyse.
              </p>
            </div>
          ) : (
            <>
              <div className="results-table-card">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Schüler</th>
                      <th>Status</th>
                      <th>Punkte</th>
                      <th>Note</th>
                      <th>Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyses.map((item, index) => {
                      const grade = getGradeInfo(item.analysis.prozent);
                      const anchorId = `analysis-${index}`;
                      const initials = item.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();
                      return (
                        <tr
                          key={`${item.name}-${index}`}
                          className="table-row-clickable"
                          onClick={() => scrollToAnalysis(anchorId)}
                        >
                          <td>
                            <div className="student-cell">
                              <div className="student-avatar">{initials || '??'}</div>
                              <span className="student-name">{item.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-success">Abgeschlossen</span>
                          </td>
                          <td>
                            <span className="points-display">
                              {item.analysis.erreichtePunkte} / {item.analysis.gesamtpunkte}
                            </span>
                          </td>
                          <td>
                            <span className={`grade-badge ${grade.badgeClass}`}>{grade.label}</span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                type="button"
                                className="icon-button"
                                title="Details anzeigen"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  scrollToAnalysis(anchorId);
                                }}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="icon-button"
                                title="Word herunterladen"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDownload(item.name, item.analysis);
                                }}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="space-y-10">
                {analyses.map((item, index) => (
                  <ResultCard
                    key={`${item.name}-${index}`}
                    analysis={item.analysis}
                    klausurName={item.name}
                    anchorId={`analysis-${index}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}
