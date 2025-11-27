'use client';

import { useEffect, useState } from 'react';
import { parseComment } from '@/lib/parse-analysis';
import type { StoredResultEntry } from '@/types/results';

interface DetailDrawerProps {
  entry: StoredResultEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

interface TaskAccordionProps {
  task: {
    aufgabe: string;
    maxPunkte: number;
    erreichtePunkte: number;
    kommentar: string;
    korrekturen: string[];
  };
  index: number;
}

function TaskAccordion({ task, index }: TaskAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const parsed = parseComment(task.kommentar || '');
  const hasStructure = parsed.dasWarRichtig || parsed.hierGabEsAbzuege || parsed.verbesserungstipp;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm drawer-accordion">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="drawer-accordion-trigger"
      >
        <span className="font-semibold text-gray-900 drawer-accordion-title">
          {task.aufgabe}
        </span>
        <span className="text-sm font-semibold text-gray-700 drawer-accordion-points">
          {task.erreichtePunkte} / {task.maxPunkte} Punkte
        </span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="bg-white drawer-accordion-content">
          {hasStructure ? (
            <div className="space-y-4">
              {parsed.dasWarRichtig && (
                  <div className="bg-green-50 rounded-lg drawer-note-box">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs font-semibold px-2 py-1">
                        Richtig
                      </span>
                    </div>
                    <p className="text-green-900 text-sm">{parsed.dasWarRichtig}</p>
                  </div>
                )}
                {parsed.hierGabEsAbzuege && (
                  <div className="bg-red-50 rounded-lg drawer-note-box">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center rounded-full bg-red-100 text-red-800 text-xs font-semibold px-2 py-1">
                        Abzüge
                      </span>
                    </div>
                    <p className="text-red-900 text-sm">{parsed.hierGabEsAbzuege}</p>
                  </div>
                )}
                {parsed.verbesserungstipp && (
                  <div className="bg-blue-50 rounded-lg drawer-note-box">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1">
                        Tipp
                      </span>
                    </div>
                    <p className="text-blue-900 text-sm">{parsed.verbesserungstipp}</p>
                  </div>
                )}
                {task.korrekturen && task.korrekturen.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg drawer-note-box">
                    <p className="font-semibold text-yellow-900 mb-2 text-sm">Korrekturen</p>
                    <div className="space-y-1 text-yellow-900 text-sm">
                      {task.korrekturen.map((korrektur, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="mt-[6px] inline-block h-2 w-2 rounded-full bg-yellow-600" aria-hidden="true"></span>
                          <span>{korrektur}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
          ) : (
            <div className="bg-gray-50 rounded-lg drawer-note-box">
              <p className="text-gray-700 text-sm">{task.kommentar || 'Keine Bewertung vorhanden.'}</p>
              {task.korrekturen && task.korrekturen.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold text-gray-900 mb-1 text-sm">Korrekturen</p>
                  <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                    {task.korrekturen.map((korrektur, idx) => (
                      <li key={idx}>{korrektur}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DetailDrawer({ entry, isOpen, onClose }: DetailDrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Verhindere Body-Scroll wenn Drawer offen ist
      document.body.style.overflow = 'hidden';
      // Starte Animation nach kurzer Verzögerung
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      document.body.style.overflow = '';
      setIsAnimating(false);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !entry || !entry.analysis) return null;

  return (
    <>
      {/* Overlay/Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed right-0 w-full md:max-w-[480px] ml-auto bg-white z-50 shadow-xl border-l border-gray-200 rounded-l-2xl transition-transform duration-300 ease-out detail-drawer-panel ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 flex items-center justify-between z-10 detail-drawer-header">
          <h2 className="detail-drawer-title">Detailanalyse der Aufgaben</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Schließen"
          >
            <svg
              className="w-5 h-5 text-gray-500 hover:text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto detail-drawer-body">
          <div className="space-y-4 detail-drawer-list">
            {entry.analysis.aufgaben.map((task, index) => (
              <TaskAccordion key={`${task.aufgabe}-${index}`} task={task} index={index} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
