'use client';

import { downloadAnalysisDoc } from '@/lib/downloadDoc';
import { getGradeInfo, getPerformanceLevel, gradeColor } from '@/lib/grades';
import { parseComment, parseSummary } from '@/lib/parse-analysis';
import type { StoredResultEntry } from '@/types/results';

interface TeacherFeedbackDocumentProps {
  entry: StoredResultEntry;
}

export default function TeacherFeedbackDocument({ entry }: TeacherFeedbackDocumentProps) {
  const { analysis } = entry;
  if (!analysis) {
    console.error('[TeacherFeedbackDocument] Keine Analyse vorhanden');
    return null;
  }

  // Prüfe, ob aufgaben existiert und ein Array ist
  if (!Array.isArray(analysis.aufgaben)) {
    console.error('[TeacherFeedbackDocument] analysis.aufgaben ist kein Array:', analysis.aufgaben);
    console.error('[TeacherFeedbackDocument] Vollständige Analysis-Struktur:', analysis);
    return (
      <article className="teacher-card teacher-feedback-document">
        <h1 className="klausur-title">Klausurbewertung</h1>
        <div className="container">
          <p className="text-center text-red-600">
            Fehler: Die Analyse-Daten haben ein ungültiges Format. Bitte öffne die Browser-Konsole für Details.
          </p>
        </div>
      </article>
    );
  }

  const percentage = analysis.prozent ?? 0;
  const gradeLevel = entry.course.gradeLevel ? parseInt(entry.course.gradeLevel, 10) || 10 : 10;
  const gradeInfo = getGradeInfo({ prozent: percentage, gradeLevel });
  const grade = gradeInfo.label;
  const performanceLevel = getPerformanceLevel(percentage);

  const handleDownload = () => {
    downloadAnalysisDoc(entry.studentName, analysis, entry.course);
  };

  return (
    <article className="teacher-card teacher-feedback-document">
      <h1 className="klausur-title">Klausurbewertung</h1>
      
      <div className="klausur-meta">
        <p><strong>Dateiname:</strong> {entry.fileName || entry.studentName}</p>
        <p><strong>Fach:</strong> {entry.course.subject}</p>
        <p><strong>Jahrgang:</strong> {entry.course.gradeLevel || '–'}</p>
        <p><strong>Klasse / Kurs:</strong> {entry.course.className || '–'}</p>
        <p><strong>Datum:</strong> {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
      </div>

      <div className="klausur-points-table">
        <table>
          <thead>
            <tr>
              <th>Erreichte Punkte</th>
              <th>Maximalpunkte</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{analysis.erreichtePunkte}</td>
              <td>{analysis.gesamtpunkte}</td>
              <td className={gradeInfo.badgeClass}>{grade}</td>
            </tr>
          </tbody>
        </table>
      </div>


      <section className="teacher-card__summary">
        <h4>Zusammenfassung</h4>
        {(() => {
          const parsed = parseSummary(analysis.zusammenfassung || '');
          if (parsed.staerken || parsed.entwicklungsbereiche) {
            return (
              <>
                {parsed.staerken && (
                  <div className="summary-section summary-section--strengths">
                    <h5 className="summary-section__title">Stärken</h5>
                    <p>{parsed.staerken}</p>
                  </div>
                )}
                {parsed.entwicklungsbereiche && (
                  <div className="summary-section summary-section--development">
                    <h5 className="summary-section__title">Entwicklungsbereiche</h5>
                    <p>{parsed.entwicklungsbereiche}</p>
                  </div>
                )}
              </>
            );
          }
          return <p>{analysis.zusammenfassung || 'Keine zusammenfassende Bewertung vorhanden.'}</p>;
        })()}
      </section>

      <section className="teacher-card__tasks">
        <h4>Detailanalyse der Aufgaben</h4>
        {analysis.aufgaben.map((aufgabe, index) => (
          <div className="teacher-task-card" key={`${aufgabe.aufgabe}-${index}`}>
            <div className="teacher-task-card__header">
              <div>
                <p className="teacher-task-card__label">Aufgabe</p>
                <p className="teacher-task-card__title">{aufgabe.aufgabe}</p>
              </div>
              <div className="teacher-task-card__score">
                <span>{aufgabe.erreichtePunkte}</span>
                <small>von {aufgabe.maxPunkte}</small>
              </div>
            </div>
            <div className="teacher-task-card__body">
              {(() => {
                const parsed = parseComment(aufgabe.kommentar || '');
                const hasStructure = parsed.dasWarRichtig || parsed.hierGabEsAbzuege || parsed.verbesserungstipp;

                if (hasStructure) {
                  return (
                    <>
                      {parsed.dasWarRichtig && (
                        <div className="teacher-task-section teacher-task-section--success">
                          <p className="teacher-task-section__title">DAS WAR RICHTIG</p>
                          <p>{parsed.dasWarRichtig}</p>
                        </div>
                      )}
                      {parsed.hierGabEsAbzuege && (
                        <div className="teacher-task-section teacher-task-section--error">
                          <p className="teacher-task-section__title">HIER GAB ES ABZÜGE</p>
                          <p>{parsed.hierGabEsAbzuege}</p>
                        </div>
                      )}
                      {parsed.verbesserungstipp && (
                        <div className="teacher-task-section teacher-task-section--tip">
                          <p className="teacher-task-section__title">VERBESSERUNGSTIPP</p>
                          <p>{parsed.verbesserungstipp}</p>
                        </div>
                      )}
                      {aufgabe.korrekturen && aufgabe.korrekturen.length > 0 && (
                        <div className="teacher-task-section teacher-task-section--corrections">
                          <p className="teacher-task-section__title">Korrekturen</p>
                          <ul className="teacher-task-list">
                            {aufgabe.korrekturen.map((korrektur, correctionIndex) => (
                              <li key={`${korrektur}-${correctionIndex}`}>{korrektur}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  );
                }

                // Fallback: Original-Darstellung
                return (
                  <>
                    <div className="teacher-task-section">
                      <p className="teacher-task-section__title">Kurzbewertung</p>
                      <p>{aufgabe.kommentar || 'Keine Bewertung vorhanden.'}</p>
                    </div>
                    {aufgabe.korrekturen && aufgabe.korrekturen.length > 0 && (
                      <div className="teacher-task-section teacher-task-section--warning">
                        <p className="teacher-task-section__title">Hinweise für Korrektur und Förderung</p>
                        <ul className="teacher-task-list">
                          {aufgabe.korrekturen.map((korrektur, correctionIndex) => (
                            <li key={`${korrektur}-${correctionIndex}`}>{korrektur}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        ))}
      </section>

      <div style={{ marginTop: 'var(--spacing-2xl)', textAlign: 'center' }}>
        <button
          type="button"
          className="primary-button teacher-card__download"
          onClick={handleDownload}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v13M12 18l4-4M12 18l-4-4M20 20H4" />
          </svg>
          <span>Bericht herunterladen</span>
        </button>
      </div>
    </article>
  );
}
