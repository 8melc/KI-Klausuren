'use client';

import { KlausurAnalyse } from '@/lib/openai';
import { getGradeInfo } from '@/lib/grades';
import { downloadAnalysisDoc } from '@/lib/downloadDoc';

interface ResultCardProps {
  analysis: KlausurAnalyse;
  klausurName?: string;
  anchorId?: string;
}

export default function ResultCard({ analysis, klausurName, anchorId }: ResultCardProps) {
  const name = klausurName || 'Klausur';
  const grade = getGradeInfo(analysis.prozent);

  const handleDownload = () => downloadAnalysisDoc(name, analysis);

  return (
    <article className="teacher-card" id={anchorId}>
      <header className="teacher-card__header">
        <div>
          <p className="teacher-card__label">Schüler/in</p>
          <h3 className="teacher-card__student">{name}</h3>
          <p className="teacher-card__note">Bewertung auf Basis des Erwartungshorizonts</p>
        </div>
        <div className="teacher-card__grade-box">
          <span className={`grade-badge grade-badge-large ${grade.badgeClass}`}>{grade.label}</span>
          <p className="teacher-card__points">
            {analysis.erreichtePunkte} / {analysis.gesamtpunkte} Punkte
          </p>
          <p className="teacher-card__percentage">{analysis.prozent.toFixed(1)}%</p>
        </div>
      </header>

      <section className="teacher-card__summary">
        <h4>Gesamteinschätzung</h4>
        <p>{analysis.zusammenfassung || 'Keine zusammenfassende Bewertung hinterlegt.'}</p>
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
                    : 'Es bestehen noch offene Aspekte laut Erwartungshorizont.'}
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

      <button
        type="button"
        className="primary-button teacher-card__download"
        onClick={handleDownload}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Bericht herunterladen</span>
      </button>
    </article>
  );
}
