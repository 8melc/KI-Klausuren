'use client';

import { downloadAnalysisDoc } from '@/lib/downloadDoc';
import { getGradeInfo, getPerformanceLevel, gradeColor } from '@/lib/grades';
import { parseSummary } from '@/lib/parse-analysis';
import type { StoredResultEntry } from '@/types/results';

interface ResultCompactViewProps {
  entry: StoredResultEntry;
  onShowDetails: () => void;
}

export default function ResultCompactView({ entry, onShowDetails }: ResultCompactViewProps) {
  const { analysis } = entry;
  if (!analysis) return null;

  const percentage = analysis.prozent;
  const gradeLevel = entry.course.gradeLevel ? parseInt(entry.course.gradeLevel, 10) || 10 : 10;
  const gradeInfo = getGradeInfo({ prozent: percentage, gradeLevel });
  const grade = gradeInfo.label;
  const performanceLevel = getPerformanceLevel(percentage);
  const parsedSummary = parseSummary(analysis.zusammenfassung || '');

  const handleDownload = () => {
    downloadAnalysisDoc(entry.studentName, analysis, entry.course);
  };

  return (
    <div className="result-compact-view">
      {/* Kopfbereich mit integrierter Punkteübersicht */}
      <div className="result-compact-header">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-8 items-start">
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <div>
              <p className="text-gray-600 font-medium">Schüler/in</p>
              <p className="font-semibold text-gray-900">{entry.studentName}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Fach</p>
              <p className="font-semibold text-gray-900">{entry.course.subject}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Thema</p>
              <p className="font-semibold text-gray-900">{entry.course.subject} - Jahrgang {entry.course.gradeLevel}</p>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Schuljahr</p>
              <p className="font-semibold text-gray-900">{entry.course.schoolYear}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 w-48 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">Erreichte Punkte</span>
              <span className="text-lg font-semibold text-gray-900">{analysis.erreichtePunkte}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">Maximalpunkte</span>
              <span className="text-lg font-semibold text-gray-900">{analysis.gesamtpunkte}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">Note</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-sm font-semibold ${gradeInfo.badgeClass}`}>
                {grade}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Zusammenfassung */}
      <div className="result-compact-summary mt-10">
        <h4 className="text-lg font-semibold mb-2">Zusammenfassung</h4>
        <div className="bg-gray-50 p-5 rounded-xl text-[1.1rem] leading-7 text-gray-700 mt-6 mb-10">
          {parsedSummary.staerken && (
            <div className="p-2 bg-green-50 rounded">
              <p className="font-semibold text-green-800 mb-1">Stärken</p>
              <p className="text-green-700">{parsedSummary.staerken}</p>
            </div>
          )}
          {parsedSummary.entwicklungsbereiche && (
            <div className="p-2 bg-blue-50 rounded">
              <p className="font-semibold text-blue-800 mb-1">Entwicklungsbereiche</p>
              <p className="text-blue-700">{parsedSummary.entwicklungsbereiche}</p>
            </div>
          )}
          {!parsedSummary.staerken && !parsedSummary.entwicklungsbereiche && (
            <p>{analysis.zusammenfassung || 'Keine zusammenfassende Bewertung vorhanden.'}</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div
        className="result-compact-actions flex flex-col sm:flex-row justify-center gap-4 mb-12"
        style={{ marginTop: '4.25rem' }}
      >
        <button
          type="button"
          onClick={onShowDetails}
          className="flex-1 primary-button"
        >
          Details anzeigen
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="flex-1 secondary-button"
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
            className="inline-block mr-2"
          >
            <path d="M12 5v13M12 18l4-4M12 18l-4-4M20 20H4" />
          </svg>
          Schülerfeedback herunterladen
        </button>
      </div>
    </div>
  );
}
