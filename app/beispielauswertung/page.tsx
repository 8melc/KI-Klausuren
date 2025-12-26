'use client';

import { useState } from 'react';
import Link from 'next/link';
import ResultCompactView from '@/components/ResultCompactView';
import DetailDrawer from '@/components/DetailDrawer';
import FeedbackPreviewModal from '@/components/beispielauswertung/FeedbackPreviewModal';
import { getGradeInfo } from '@/lib/grades';
import { getNoteColorConfig, getStatusConfig } from '@/lib/ux-helpers';
import StatusIcon from '@/components/icons/StatusIcon';
import { DEMO_CORRECTIONS } from '@/lib/demoData';
import type { StoredResultEntry } from '@/types/results';
import { useAuth } from '@/components/AuthProvider';

export default function BeispielauswertungPage() {
  const { user } = useAuth();
  const [openResultId, setOpenResultId] = useState<string | null>(null);
  const [selectedKlausurId, setSelectedKlausurId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showFeedbackPreview, setShowFeedbackPreview] = useState(false);
  const [previewEntry, setPreviewEntry] = useState<StoredResultEntry | null>(null);

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

  const handleShowPreview = (entry: StoredResultEntry) => {
    setPreviewEntry(entry);
    setShowFeedbackPreview(true);
  };

  const handleClosePreview = () => {
    setShowFeedbackPreview(false);
    setPreviewEntry(null);
  };

  const selectedEntry = DEMO_CORRECTIONS.find((entry) => entry.id === selectedKlausurId) || null;

  return (
    <section className="module-section">
      <div className="container">
        {/* Großer Warn-Banner oben */}
        <div style={{
          backgroundColor: '#fef3c7',
          borderLeft: '4px solid #fbbf24',
          padding: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-xl)',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0'
        }}>
          <div style={{ display: 'flex' }}>
            <div style={{ flexShrink: 0 }}>
              <svg style={{ width: '24px', height: '24px', color: '#f59e0b' }} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div style={{ marginLeft: 'var(--spacing-md)', flex: 1 }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: '#92400e',
                marginBottom: 'var(--spacing-sm)'
              }}>
                BEISPIELANSICHT – Fiktive Demo-Daten
              </h3>
              <p style={{
                fontSize: '1rem',
                color: '#b45309',
                marginBottom: 'var(--spacing-md)'
              }}>
                Dies sind <strong>vollständig fiktive Demo-Daten</strong>. Keine echten Schülernamen, keine echten Korrekturen. 
                Alle Namen sind anonyme Platzhalter ("Demo-Klausur 1", "Demo-Klausur 2", "Demo-Klausur 3").
              </p>
              <Link 
                href={user ? '/correction' : '/auth'}
                style={{
                  display: 'inline-block',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: '#d97706',
                  color: 'white',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b45309'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
              >
                Jetzt kostenlos testen →
              </Link>
            </div>
          </div>
        </div>

        <div className="page-intro">
          <h1 className="page-intro-title">Beispiel: So sieht eine Korrektur aus</h1>
          <p className="page-intro-text">
            Hier siehst du, wie eine fertige Korrektur von KorrekturPilot aussieht. 
            Die folgenden drei Beispiel-Klausuren zeigen verschiedene Fächer und Leistungsniveaus.
          </p>
        </div>

        <div className="module-grid results-grid-spacing">
          <div className="module-card">
            <h3>Beispiel-Klausuren</h3>
            <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--spacing-lg)' }}>
              Klicke auf eine Klausur, um die detaillierte Auswertung zu sehen. 
              Alle Funktionen (Details anzeigen, Feedback-Vorschau) sind verfügbar.
            </p>

            <div className="results-accordion">
              {DEMO_CORRECTIONS.map((entry) => {
                const gradeLevel = entry.course.gradeLevel ? parseInt(entry.course.gradeLevel, 10) || 10 : 10;
                const gradeInfo = entry.analysis
                  ? getGradeInfo({ prozent: entry.analysis.prozent, gradeLevel })
                  : null;
                const grade = gradeInfo ? gradeInfo.label : '–';
                
                // Visuelle Hierarchie: Farbe basierend auf Note
                const noteColor = gradeInfo ? getNoteColorConfig(grade) : null;
                const statusConfig = getStatusConfig(entry.status);

                return (
                  <article
                    key={entry.id}
                    className={`results-accordion-item ${openResultId === entry.id ? 'results-accordion-item--open' : ''} ${noteColor ? noteColor.border : ''} ${noteColor ? noteColor.bg : ''}`}
                    style={{
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '';
                      e.currentTarget.style.transform = '';
                    }}
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
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--spacing-sm)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: 'var(--spacing-xs) var(--spacing-md)',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            border: '1px solid',
                            backgroundColor: statusConfig.bg.includes('green') ? '#d1fae5' : statusConfig.bg.includes('blue') ? '#dbeafe' : statusConfig.bg.includes('red') ? '#fee2e2' : '#f3f4f6',
                            color: statusConfig.textColor.includes('green') ? '#065f46' : statusConfig.textColor.includes('blue') ? '#1e40af' : statusConfig.textColor.includes('red') ? '#991b1b' : '#1f2937',
                            borderColor: statusConfig.border.includes('green') ? '#a7f3d0' : statusConfig.border.includes('blue') ? '#93c5fd' : statusConfig.border.includes('red') ? '#fecaca' : '#e5e7eb'
                          }}>
                            <StatusIcon type={statusConfig.icon} style={{ width: '16px', height: '16px' }} />
                            {statusConfig.text}
                          </span>
                          <span className={`grade-badge ${gradeInfo ? gradeInfo.badgeClass : 'grade-unknown'}`}>
                            {grade}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)' }}>
                          {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                    </button>

                    {openResultId === entry.id && (
                      <div className="results-accordion-content">
                        {entry.analysis ? (
                          <ResultCompactView 
                            entry={entry} 
                            onShowDetails={() => handleShowDetails(entry.id)}
                            onShowPreview={() => handleShowPreview(entry)}
                          />
                        ) : (
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-gray-600)', marginBottom: 'var(--spacing-md)' }}>
                            Die Analyse läuft noch. Sobald sie abgeschlossen ist, erscheint hier die Detailauswertung.
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detail Drawer */}
        <DetailDrawer entry={selectedEntry} isOpen={isDrawerOpen} onClose={handleCloseDrawer} isDemo={true} />

        {/* Feedback Preview Modal */}
        <FeedbackPreviewModal 
          isOpen={showFeedbackPreview} 
          onClose={handleClosePreview}
          entry={previewEntry}
          mode="demo"
        />

        {/* CTA am Ende */}
        <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center' }}>
          <Link href={user ? '/correction' : '/auth'} className="primary-button">
            Jetzt kostenlos testen
          </Link>
        </div>
      </div>
    </section>
  );
}
