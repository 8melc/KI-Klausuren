'use client';

import { downloadAnalysisDoc } from '@/lib/downloadDoc';
import { getGradeInfo } from '@/lib/grades';
import type { StoredResultEntry } from '@/types/results';

interface TeacherFeedbackDocumentProps {
  entry: StoredResultEntry;
}

export default function TeacherFeedbackDocument({ entry }: TeacherFeedbackDocumentProps) {
  const { analysis } = entry;
  if (!analysis) return null;

  const grade = getGradeInfo(analysis.prozent);

  const handleDownload = () => {
    downloadAnalysisDoc(entry.studentName, analysis);
  };

  return (
    <article className="teacher-card teacher-feedback-document">
      <header className="teacher-card__header">
        <div>
          <p className="teacher-card__label">Schüler/in</p>
          <h3 className="teacher-card__student">{entry.studentName}</h3>
          <p className="teacher-card__note">
            {entry.course.subject} · Jahrgang {entry.course.gradeLevel} · {entry.course.className}
          </p>
          <p className="teacher-card__note">Schuljahr {entry.course.schoolYear}</p>
        </div>
        <div className="teacher-card__grade-box">
          <span className={`grade-badge grade-badge-large ${grade.badgeClass}`}>{grade.label}</span>
          <p className="teacher-card__points">
            {analysis.erreichtePunkte} / {analysis.gesamtpunkte} Punkte
          </p>
          <p className="teacher-card__percentage">{analysis.prozent.toFixed(1)} %</p>
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
      </header>

      <section className="teacher-card__summary">
        <h4>Fachliche Einschätzung</h4>
        <p>{analysis.zusammenfassung || 'Keine zusammenfassende Bewertung vorhanden.'}</p>
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
              <div className="teacher-task-section">
                <p className="teacher-task-section__title">Kurzbewertung</p>
                <p>{aufgabe.kommentar || 'Keine Bewertung vorhanden.'}</p>
              </div>
              <div className="teacher-task-section teacher-task-section--muted">
                <p className="teacher-task-section__title">Punktebegründung</p>
                <p>
                  Erreichte Punkte: {aufgabe.erreichtePunkte} von {aufgabe.maxPunkte}.{' '}
                  {aufgabe.erreichtePunkte === aufgabe.maxPunkte
                    ? 'Alle Teilschritte erfüllt.'
                    : 'Es bestehen offene Aspekte im Erwartungshorizont.'}
                </p>
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
            </div>
          </div>
        ))}
      </section>
    </article>
  );
}
