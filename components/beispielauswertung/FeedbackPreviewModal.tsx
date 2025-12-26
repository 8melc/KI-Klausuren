'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { StoredResultEntry } from '@/types/results';
import { getGradeInfo } from '@/lib/grades';
// Entfernt: parseTaskComment, parseSummary - verwenden wir nicht mehr
// Alle Texte kommen jetzt aus buildFeedbackModel
import { DocumentTextIcon, XIcon, CheckCircleIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/icons/ModalIcons';
import { downloadAnalysisDoc } from '@/lib/downloadDoc';
import { isDemoId } from '@/lib/demoData';
import { buildFeedbackModel, type FeedbackModel, type FeedbackTaskModel } from '@/lib/build-feedback-model';
import { useAuth } from '@/components/AuthProvider';

interface FeedbackPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: StoredResultEntry | null;
  mode?: 'demo' | 'results';
}

export default function FeedbackPreviewModal({ isOpen, onClose, entry, mode = 'demo' }: FeedbackPreviewModalProps) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackModel, setFeedbackModel] = useState<FeedbackModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<boolean>(false);

  // Lade Feedback-Modell für ALLE Modi (results UND demo)
  // WICHTIG: buildFeedbackModel verwendet dieselben Texte wie das Word-Dokument
  // Im Demo-Modus: OHNE Polishing (keine OpenAI API nötig)
  // Im Results-Modus: MIT Polishing (wie im Word-Dokument)
  useEffect(() => {
    if (isOpen && entry && entry.analysis) {
      setIsLoading(true);
      // Demo-Modus: Kein Polishing (keine OpenAI API nötig)
      // Results-Modus: Mit Polishing (wie im Word-Dokument)
      const shouldPolish = mode === 'results';
      buildFeedbackModel(entry.analysis, entry.course, entry.studentName, { polish: shouldPolish })
        .then((model) => {
          setFeedbackModel(model);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Fehler beim Laden des Feedback-Modells:', error);
          setIsLoading(false);
        });
    } else {
      setFeedbackModel(null);
    }
  }, [isOpen, entry, mode]);

  if (!isOpen || !entry || !entry.analysis) return null;

  const { analysis } = entry;
  // WICHTIG: Verwende IMMER feedbackModel, wenn verfügbar
  // Dies stellt sicher, dass Vorschau und Word-Dokument identische Texte verwenden
  if (!feedbackModel && !isLoading) {
    // Fallback: Zeige Ladeanzeige, während Modell erstellt wird
    return null;
  }

  if (!feedbackModel) {
    return null;
  }

  const gradeLevel = entry.course.gradeLevel ? parseInt(entry.course.gradeLevel, 10) || 10 : 10;
  const gradeInfo = getGradeInfo({ prozent: feedbackModel.percentage, gradeLevel });
  const grade = feedbackModel.grade;

  // Verwende IMMER feedbackModel - keine Parser mehr!
  const displayStrengths = feedbackModel.summary.yourStrengths;
  const displayNextSteps = feedbackModel.summary.yourNextSteps;

  // Berechne Anzahl Seiten (1 Seite Übersicht + 1 Seite pro Aufgabe)
  const tasks = feedbackModel.tasks;
  const totalPages = 1 + (tasks.length || 0);

  // Berechne welche Aufgabe auf aktueller Seite angezeigt wird
  const currentTaskIndex = currentPage > 1 ? currentPage - 2 : -1;
  const currentTask = currentPage > 1 && tasks && currentTaskIndex >= 0 && currentTaskIndex < tasks.length
    ? tasks[currentTaskIndex]
    : null;

  const renderPage1 = () => {
    // Verwende IMMER feedbackModel - keine Fallbacks mehr!
    const studentName = feedbackModel.studentName;
    const className = feedbackModel.className || entry.course.className;
    const subject = feedbackModel.subject || entry.course.subject;
    const date = feedbackModel.date;
    const gradeLevel = feedbackModel.gradeLevel || entry.course.gradeLevel;
    const erreichtePunkte = feedbackModel.erreichtePunkte;
    const gesamtpunkte = feedbackModel.gesamtpunkte;
    const displayGrade = feedbackModel.grade;
    const displayStrengths = feedbackModel.summary.yourStrengths;
    const displayNextSteps = feedbackModel.summary.yourNextSteps;

    return (
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        {/* Header - Moderne Card */}
        <div className="module-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--spacing-lg)' }}>
            Klausurbewertung
          </h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-lg)', fontSize: '0.875rem', marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <p style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-gray-700)', width: '7rem' }}>Klausur:</span>
                <span style={{ color: 'var(--color-gray-900)' }}>{studentName}</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-gray-700)', width: '7rem' }}>Klasse:</span>
                <span style={{ color: 'var(--color-gray-900)' }}>{className}</span>
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <p style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-gray-700)', width: '7rem' }}>Fach:</span>
                <span style={{ color: 'var(--color-gray-900)' }}>{subject}</span>
              </p>
              <p style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-gray-700)', width: '7rem' }}>Datum:</span>
                <span style={{ color: 'var(--color-gray-900)' }}>{date}</span>
              </p>
            </div>
          </div>
          
          <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)' }}>
            <span style={{ fontWeight: 600 }}>Thema:</span>{' '}
            {subject} - Jahrgang {gradeLevel}
          </p>
        </div>

        {/* Punktetabelle - Moderne Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
          <div className="module-card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-gray-500)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 'var(--spacing-md)' }}>
              Erreichte Punkte
            </p>
            <p style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>{erreichtePunkte}</p>
          </div>
          <div className="module-card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-gray-500)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 'var(--spacing-md)' }}>
              Maximalpunkte
            </p>
            <p style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>{gesamtpunkte}</p>
          </div>
          <div className="module-card" style={{ textAlign: 'center', backgroundColor: 'var(--color-info-light)', borderColor: 'var(--color-primary)' }}>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: 'var(--spacing-md)' }}>
              Note
            </p>
            <p style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>{displayGrade}</p>
          </div>
        </div>

        {/* Aufgaben - Moderne Card-Liste statt Tabelle */}
        <div className="module-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 'var(--spacing-md)' }}>Aufgabenübersicht</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {tasks.map((task, index) => {
              // Verwende IMMER feedbackModel - keine Parser mehr!
              const feedbackTask = task as FeedbackTaskModel;
              const taskTitle = feedbackTask.taskTitle;
              const points = feedbackTask.points;
              
              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-md)', backgroundColor: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-gray-900)' }}>{taskTitle}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gray-700)' }}>{points}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stärken/Nächste Schritte - Moderne Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
          <div className="module-card" style={{ backgroundColor: 'var(--color-success-light)', borderColor: 'var(--color-success)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-success-dark)', marginBottom: 'var(--spacing-md)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Deine Stärken
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', fontSize: '0.875rem', color: 'var(--color-gray-700)', listStyle: 'none', padding: 0, margin: 0 }}>
              {displayStrengths.length > 0 ? (
                displayStrengths.map((staerke, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                    <div style={{ width: '20px', height: '20px', color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }}>
                      <CheckCircleIcon className="w-5 h-5" />
                    </div>
                    <span>{staerke}</span>
                  </li>
                ))
              ) : (
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                  <div style={{ width: '20px', height: '20px', color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }}>
                    <CheckCircleIcon className="w-5 h-5" />
                  </div>
                  <span>Die Arbeit zeigt ein gutes Grundverständnis des Themas.</span>
                </li>
              )}
            </ul>
          </div>
          
          <div className="module-card" style={{ backgroundColor: 'var(--color-info-light)', borderColor: 'var(--color-primary)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 'var(--spacing-md)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Deine nächsten Schritte
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', fontSize: '0.875rem', color: 'var(--color-gray-700)', listStyle: 'none', padding: 0, margin: 0 }}>
              {displayNextSteps.length > 0 ? (
                displayNextSteps.map((schritt, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                    <div style={{ width: '20px', height: '20px', color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }}>
                      <ArrowRightIcon className="w-5 h-5" />
                    </div>
                    <span>{schritt}</span>
                  </li>
                ))
              ) : (
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                  <div style={{ width: '20px', height: '20px', color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }}>
                    <ArrowRightIcon className="w-5 h-5" />
                  </div>
                  <span>Weiteres Üben und Vertiefen des Verständnisses wird empfohlen.</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderTaskPage = (task: FeedbackTaskModel, taskIndex: number) => {
    // Verwende IMMER feedbackModel - keine Parser mehr!
    // Diese Daten sind identisch mit denen im Word-Dokument
    const taskTitle = task.taskTitle;
    const erreichtePunkte = task.erreichtePunkte;
    const maxPunkte = task.maxPunkte;
    const whatYouDidWell = task.whatYouDidWell || [];
    const whatNeedsImprovement = task.whatNeedsImprovement || [];
    const tipsForYou = task.tipsForYou || [];
    const corrections = task.corrections || [];

    return (
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <div className="module-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--color-gray-200)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-gray-900)' }}>
              Detailanalyse
            </h2>
            <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-primary)' }}>{erreichtePunkte} / {maxPunkte} Punkte</span>
          </div>

          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-gray-900)', marginBottom: 'var(--spacing-md)' }}>
              {taskTitle}
            </h3>

            {/* Das war richtig */}
            {whatYouDidWell.length > 0 && (
              <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', backgroundColor: 'var(--color-success-light)', borderLeft: '4px solid var(--color-success)', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)', color: 'var(--color-success-dark)' }}>Das war richtig</h4>
                {whatYouDidWell.map((item, idx) => (
                  <p key={idx} style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)', lineHeight: 1.75, marginBottom: idx < whatYouDidWell.length - 1 ? 'var(--spacing-xs)' : 0 }}>
                    {item}
                  </p>
                ))}
              </div>
            )}

            {/* Hier kannst du noch verbessern */}
            {whatNeedsImprovement.length > 0 && (
              <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', backgroundColor: 'var(--color-warning-light)', borderLeft: '4px solid var(--color-warning)', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)', color: 'var(--color-warning-dark)' }}>Hier kannst du noch verbessern</h4>
                {whatNeedsImprovement.map((item, idx) => (
                  <p key={idx} style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)', lineHeight: 1.75, marginBottom: idx < whatNeedsImprovement.length - 1 ? 'var(--spacing-xs)' : 0 }}>
                    {item}
                  </p>
                ))}
              </div>
            )}

            {/* Tipp für dich */}
            {tipsForYou.length > 0 && (
              <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', backgroundColor: 'var(--color-info-light)', borderLeft: '4px solid var(--color-primary)', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>Tipp für dich</h4>
                {tipsForYou.map((item, idx) => (
                  <p key={idx} style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)', lineHeight: 1.75, marginBottom: idx < tipsForYou.length - 1 ? 'var(--spacing-xs)' : 0 }}>
                    {item}
                  </p>
                ))}
              </div>
            )}

            {/* Korrekturen */}
            {corrections.length > 0 && (
              <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-warning-light)', borderLeft: '4px solid var(--color-warning)', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0' }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)', color: 'var(--color-warning-dark)' }}>Korrekturen</h4>
                <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--color-gray-700)' }}>
                  {corrections.map((korrektur, idx) => (
                    <li key={idx} style={{ marginBottom: 'var(--spacing-xs)' }}>{korrektur}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer nur auf letzter Seite */}
          {currentPage === totalPages && (
            <div style={{ marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-lg)', borderTop: '1px solid var(--color-gray-200)', fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
              <p style={{ marginBottom: 'var(--spacing-sm)' }}>
                <strong>Hinweis:</strong> Dieses Dokument wurde automatisiert von KorrekturPilot erstellt
                und von der Lehrkraft geprüft.
              </p>
              <p>
                Alle Bewertungen sind durch den Erwartungshorizont abgesichert und können im System
                nachvollzogen werden.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 'var(--spacing-sm)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          maxWidth: '960px',
          width: '90%',
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(to right, var(--color-gray-50), var(--color-gray-100))',
            borderBottom: '1px solid var(--color-gray-200)',
            padding: 'var(--spacing-md) var(--spacing-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                <div style={{ color: 'var(--color-gray-600)' }}>
                  <DocumentTextIcon className="w-6 h-6" />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                  Feedback-Vorschau
                </h2>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                {mode === 'demo' 
                  ? 'So würde das echte Feedback-Dokument aussehen, das du als .docx herunterladen kannst.'
                  : 'Vorschau des Word-Feedback-Dokuments, das du für diese Klausur herunterladen kannst.'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                color: 'var(--color-gray-400)',
                padding: 'var(--spacing-sm)',
                borderRadius: '9999px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-gray-600)';
                e.currentTarget.style.backgroundColor = 'var(--color-gray-200)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-gray-400)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Schließen"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrollbarer Inhalt */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: 'var(--color-gray-50)',
            padding: 'var(--spacing-lg)',
          }}
        >
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <p style={{ color: 'var(--color-gray-600)' }}>Lade Feedback-Vorschau...</p>
            </div>
          ) : (
            <>
              {currentPage === 1 && renderPage1()}
              {currentPage > 1 && currentTask && renderTaskPage(currentTask, currentTaskIndex)}
            </>
          )}
        </div>

        {/* Footer mit Navigation */}
        <div
          style={{
            borderTop: '1px solid var(--color-gray-200)',
            backgroundColor: 'white',
            padding: 'var(--spacing-md) var(--spacing-lg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="secondary-button"
              style={{
                opacity: currentPage === 1 ? 0.5 : 1,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeftIcon className="w-5 h-5" />
              Vorherige Seite
            </button>

            <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', fontWeight: 500 }}>
              Seite {currentPage} von {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="secondary-button"
              style={{
                opacity: currentPage === totalPages ? 0.5 : 1,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Nächste Seite
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Footer mit Hinweis & CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 'var(--spacing-md)',
              borderTop: '1px solid var(--color-gray-100)',
            }}
          >
            {mode === 'demo' && (
              <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
                <p style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>Im echten System kannst du:</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: 'var(--spacing-xs)', fontSize: '0.75rem' }}>✓ Dokument als .docx herunterladen</li>
                  <li style={{ marginBottom: 'var(--spacing-xs)', fontSize: '0.75rem' }}>✓ Alle Texte in Word bearbeiten</li>
                  <li style={{ fontSize: '0.75rem' }}>✓ Direkt ausdrucken oder digital versenden</li>
                </ul>
              </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginLeft: mode === 'results' ? 'auto' : '0' }}>
              <button
                onClick={onClose}
                className="secondary-button"
              >
                Schließen
              </button>
              {mode === 'demo' ? (
              <Link
                href={user ? '/correction' : '/auth'}
                className="primary-button"
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
              >
                Jetzt kostenlos testen
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              ) : (
                <button
                  onClick={async () => {
                    if (!entry || !entry.analysis || (isDownloading && !downloadError)) return;
                    
                    setIsDownloading(true);
                    setDownloadError(false);
                    
                    try {
                      const fileName = isDemoId(entry.id) 
                        ? `Demo_${entry.studentName.replace(/\s+/g, '_')}_${entry.course.subject}`
                        : entry.studentName;
                      
                      await downloadAnalysisDoc(fileName, entry.analysis, entry.course);
                      
                      // Bei Erfolg: Button bleibt deaktiviert (Download läuft)
                      setTimeout(() => {
                        setIsDownloading(false);
                      }, 3000);
                    } catch (error) {
                      // Bei Fehler: Button wieder aktivieren, damit User es erneut versuchen kann
                      setDownloadError(true);
                      setIsDownloading(false);
                    }
                  }}
                  disabled={isDownloading && !downloadError}
                  className="primary-button"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 'var(--spacing-sm)',
                    opacity: isDownloading && !downloadError ? 0.6 : 1,
                    cursor: isDownloading && !downloadError ? 'not-allowed' : 'pointer',
                  }}
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
                  {isDownloading && !downloadError ? 'Wird heruntergeladen...' : 'Schülerfeedback herunterladen'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
