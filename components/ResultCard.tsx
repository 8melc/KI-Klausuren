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
    <div className="detail-summary-card result-card" id={anchorId}>
      <div className="detail-summary-header">
        <div>
          <h3 className="detail-summary-title">Klausurergebnis</h3>
          <p className="detail-summary-student">{name}</p>
        </div>
        <div className="detail-summary-score">
          <div className="detail-summary-points">
            <span className="detail-summary-points-value">{analysis.erreichtePunkte}</span>
            <span className="detail-summary-points-max">/ {analysis.gesamtpunkte}</span>
          </div>
          <div className="detail-summary-grade">
            <span className={`grade-badge grade-badge-large ${grade.badgeClass}`}>
              {grade.label}
            </span>
            <p className="detail-summary-percentage">{analysis.prozent.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="detail-summary-body">
        <h3 className="detail-summary-section-title">Gesamteinschätzung</h3>
        <p className="detail-summary-text">{analysis.zusammenfassung}</p>
      </div>

      <div className="detail-tasks">
        <h2 className="detail-tasks-title">Detailbewertung</h2>
        {analysis.aufgaben.map((aufgabe, index) => (
          <div className="task-card" key={`${aufgabe.aufgabe}-${index}`}>
            <div className="task-header">
              <div className="task-badge">{aufgabe.aufgabe}</div>
              <span className="task-points">
                {aufgabe.erreichtePunkte} / {aufgabe.maxPunkte} Pkt
              </span>
            </div>
            <div className="task-body">
              <div className="task-section">
                <h4 className="task-section-title">Analyse</h4>
                <p className="task-section-text">{aufgabe.kommentar}</p>
              </div>
              {aufgabe.korrekturen && aufgabe.korrekturen.length > 0 && (
                <div className="task-section">
                  <h4 className="task-section-title">Korrekturhinweise</h4>
                  <ul className="task-corrections-list">
                    {aufgabe.korrekturen.map((korrektur, correctionIndex) => (
                      <li key={`${korrektur}-${correctionIndex}`}>{korrektur}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="primary-button detail-download-button" onClick={handleDownload}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Word-Dokument herunterladen</span>
      </button>
    </div>
  );
}
