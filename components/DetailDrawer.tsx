'use client';

import { useEffect, useState } from 'react';
import type { StoredResultEntry } from '@/types/results';
import { mapToParsedAnalysis } from '@/types/analysis';
import { renderTeacherResultSection, type TeacherTaskView } from '@/lib/renderers/teacher-renderer';
import { getPublicPdfUrl } from '@/lib/supabase/storage';
import { cleanAndFormatText } from '@/lib/text-formatter';

interface DetailDrawerProps {
  entry: StoredResultEntry | null;
  isOpen: boolean;
  onClose: () => void;
  isDemo?: boolean;
}

interface TaskAccordionProps {
  task: TeacherTaskView;
  index: number;
}

function TaskAccordion({ task, index }: TaskAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Verwende direkt die strukturierten Daten aus renderTeacherTask
  const whatWasGood = (task.correctAspects || []).map(cleanAndFormatText);
  const whatToImprove = (task.deductions || []).map(cleanAndFormatText);
  const tipsForYou = (task.improvementHints || []).map(cleanAndFormatText);
  const corrections = (task.corrections || []).map(cleanAndFormatText);
  const hasStructure =
    whatWasGood.length > 0 ||
    whatToImprove.length > 0 ||
    tipsForYou.length > 0 ||
    corrections.length > 0;
  
  // Extrahiere Punkte aus "2/5" Format
  const pointsParts = task.points.split('/').map((p) => parseInt(p.trim(), 10));
  const pointsScored = pointsParts[0] || 0;
  const pointsMax = pointsParts[1] || 0;

  return (
    <div className="drawer-accordion" style={{ border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'white', boxShadow: 'var(--shadow-sm)' }}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="drawer-accordion-trigger"
      >
        <span className="drawer-accordion-title" style={{ fontWeight: 600, color: 'var(--color-gray-900)' }}>
          {task.taskTitle}
        </span>
        <span className="drawer-accordion-points" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gray-700)' }}>
          {pointsScored} / {pointsMax} Punkte
        </span>
        <svg
          style={{ width: '20px', height: '20px', color: 'var(--color-gray-500)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="drawer-accordion-content" style={{ background: 'white' }}>
          {hasStructure ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              {whatWasGood.length > 0 && (
                <div className="drawer-note-box" style={{ background: 'white', border: 'none', borderLeft: '4px solid #10b981', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>
                      Was war gut
                    </span>
                  </div>
                  <ul style={{ color: 'var(--color-gray-900)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: 'var(--spacing-sm)' }}>
                    {whatWasGood.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {whatToImprove.length > 0 && (
                <div className="drawer-note-box" style={{ background: 'white', border: 'none', borderLeft: '4px solid #ef4444', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 600 }}>
                      Verbesserungsbedarf
                    </span>
                  </div>
                  <ul style={{ color: 'var(--color-gray-900)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: 'var(--spacing-sm)' }}>
                    {whatToImprove.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {tipsForYou.length > 0 && (
                <div className="drawer-note-box" style={{ background: '#f9fafb', border: 'none', borderLeft: '4px solid #3b82f6', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#3b82f6', fontSize: '0.875rem', fontWeight: 600 }}>
                      Tipp
                    </span>
                  </div>
                  <ul style={{ color: 'var(--color-gray-900)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: 'var(--spacing-sm)' }}>
                    {tipsForYou.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {corrections.length > 0 && (
                <div className="drawer-note-box" style={{ background: '#f9fafb', border: 'none', borderLeft: '4px solid #f59e0b', borderRadius: '0.5rem', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <p style={{ fontWeight: 600, color: '#f59e0b', marginBottom: 'var(--spacing-sm)', fontSize: '0.875rem' }}>Korrekturen</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--color-gray-900)', fontSize: '0.875rem', marginTop: 'var(--spacing-sm)' }}>
                    {corrections.map((korrektur, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                        <span style={{ marginTop: '6px', display: 'inline-block', height: '8px', width: '8px', borderRadius: '50%', background: '#f59e0b' }} aria-hidden="true"></span>
                        <span>{korrektur}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="drawer-note-box" style={{ background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--color-gray-700)', fontSize: '0.875rem' }}>Keine Bewertung vorhanden.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DetailDrawer({ entry, isOpen, onClose, isDemo = false }: DetailDrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [teacherView, setTeacherView] = useState<ReturnType<typeof renderTeacherResultSection> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'klausur' | 'erwartung' | 'analyse'>('analyse');

  // Lade Lehrer-Ansicht mit renderTeacherResultSection
  useEffect(() => {
    if (isOpen && entry && entry.analysis) {
      setIsLoading(true);
      try {
        const gradeLevel = entry.course?.gradeLevel ? parseInt(entry.course.gradeLevel, 10) || 10 : 10;
        const parsed = mapToParsedAnalysis(entry.analysis, '');
        const view = renderTeacherResultSection(parsed, gradeLevel);
        setTeacherView(view);
        setIsLoading(false);
      } catch (error) {
        console.error('Fehler beim Laden der Lehrer-Ansicht:', error);
        setIsLoading(false);
      }
    } else {
      setTeacherView(null);
      setIsLoading(false);
    }
  }, [isOpen, entry]);

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

  // Verwende Lehrer-Ansicht wenn verfügbar
  const tasks = teacherView?.tasks || [];

  const klausurUrl = getPublicPdfUrl(entry.klausurFileKey);
  const expectationUrl = getPublicPdfUrl(entry.expectationFileKey);

  const openInNewTab = (url?: string | null) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Overlay/Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(4px)',
          zIndex: 40,
          transition: 'opacity 0.3s',
          opacity: isAnimating ? 1 : 0,
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className="detail-drawer-panel"
        style={{
          position: 'fixed',
          right: 0,
          width: '100%',
          maxWidth: '1100px',
          marginLeft: 'auto',
          background: 'white',
          zIndex: 50,
          boxShadow: 'var(--shadow-xl)',
          borderLeft: '1px solid var(--color-gray-200)',
          borderTopLeftRadius: 'var(--radius-2xl)',
          borderBottomLeftRadius: 'var(--radius-2xl)',
          transition: 'transform 0.3s ease-out',
          transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="detail-drawer-header" style={{ position: 'sticky', top: 0, background: 'white', borderBottom: '1px solid var(--color-gray-200)', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-md) var(--spacing-lg)' }}>
            <h2 className="detail-drawer-title">Detailanalyse der Aufgaben</h2>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: 'var(--spacing-sm)', borderRadius: '50%', transition: 'background-color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-gray-100)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              aria-label="Schließen"
            >
              <svg
                style={{ width: '20px', height: '20px', color: 'var(--color-gray-500)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-gray-700)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-gray-500)'}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="detail-drawer-body" style={{ overflowY: 'auto' }}>
          <div style={{ padding: 'var(--spacing-md) var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {/* MOBILE: Tabs */}
            <div className="detail-drawer-tabs" style={{ display: 'flex', gap: 'var(--spacing-sm)', borderRadius: 'var(--radius-xl)', background: 'var(--color-gray-100)', padding: '0.25rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-gray-600)' }}>
              <button
                type="button"
                onClick={() => setActiveTab('klausur')}
                style={{
                  flex: 1,
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all 0.2s',
                  background: activeTab === 'klausur' ? 'white' : 'transparent',
                  color: activeTab === 'klausur' ? 'var(--color-gray-900)' : 'var(--color-gray-600)',
                  boxShadow: activeTab === 'klausur' ? 'var(--shadow-sm)' : 'none',
                  position: 'relative',
                  opacity: isDemo ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'klausur' && !isDemo) e.currentTarget.style.color = 'var(--color-gray-900)';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'klausur') e.currentTarget.style.color = 'var(--color-gray-600)';
                }}
              >
                Klausur
                {isDemo && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    background: '#f59e0b',
                    color: 'white',
                    border: '2px solid white',
                  }}>
                    Demo
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('erwartung')}
                style={{
                  flex: 1,
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all 0.2s',
                  background: activeTab === 'erwartung' ? 'white' : 'transparent',
                  color: activeTab === 'erwartung' ? 'var(--color-gray-900)' : 'var(--color-gray-600)',
                  boxShadow: activeTab === 'erwartung' ? 'var(--shadow-sm)' : 'none',
                  position: 'relative',
                  opacity: isDemo ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'erwartung' && !isDemo) e.currentTarget.style.color = 'var(--color-gray-900)';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'erwartung') e.currentTarget.style.color = 'var(--color-gray-600)';
                }}
              >
                Erwartungshorizont
                {isDemo && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    background: '#f59e0b',
                    color: 'white',
                    border: '2px solid white',
                  }}>
                    Demo
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('analyse')}
                style={{
                  flex: 1,
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all 0.2s',
                  background: activeTab === 'analyse' ? 'white' : 'transparent',
                  color: activeTab === 'analyse' ? 'var(--color-gray-900)' : 'var(--color-gray-600)',
                  boxShadow: activeTab === 'analyse' ? 'var(--shadow-sm)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'analyse') e.currentTarget.style.color = 'var(--color-gray-900)';
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'analyse') e.currentTarget.style.color = 'var(--color-gray-600)';
                }}
              >
                Analyse
              </button>
            </div>

            {/* Content je nach activeTab */}
            <div>
              {activeTab === 'klausur' && (
                <div style={{ position: 'relative', height: '480px', width: '100%', borderRadius: 'var(--radius-xl)', background: 'rgba(15, 23, 42, 0.95)', color: '#f1f5f9' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
                    <p style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Klausur (Scan)</p>
                    {isDemo ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-sm)', padding: 'var(--spacing-md)', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                        <p style={{ fontSize: '0.875rem', color: '#fbbf24', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                          Beispielansicht
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#cbd5e1', textAlign: 'center', maxWidth: '320px', lineHeight: '1.5' }}>
                          Bei der echten Nutzung können Sie hier Ihre hochgeladene Klausur direkt öffnen und ansehen. In dieser Beispielauswertung sind Demo-Daten hinterlegt.
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openInNewTab(klausurUrl)}
                        disabled={!klausurUrl}
                        className="secondary-button"
                      >
                        Klausur öffnen
                      </button>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'erwartung' && (
                <div style={{ position: 'relative', height: '320px', width: '100%', borderRadius: 'var(--radius-xl)', background: 'rgba(15, 23, 42, 0.95)', color: '#f1f5f9' }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
                    <p style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Erwartungshorizont</p>
                    {isDemo ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        {/* Beispielansicht-Box nur anzeigen, wenn KEIN Erwartungshorizont vorhanden */}
                        {!entry.expectationHorizonUrl && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-sm)', padding: 'var(--spacing-md)', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: 'var(--spacing-sm)' }}>
                            <p style={{ fontSize: '0.875rem', color: '#fbbf24', fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                              Beispielansicht
                            </p>
                            <p style={{ fontSize: '0.75rem', color: '#cbd5e1', textAlign: 'center', maxWidth: '320px', lineHeight: '1.5' }}>
                              Bei der echten Nutzung können Sie hier Ihren hochgeladenen Erwartungshorizont direkt öffnen und ansehen. In dieser Beispielauswertung sind Demo-Daten hinterlegt.
                            </p>
                          </div>
                        )}
                        {/* Button anzeigen, wenn Erwartungshorizont vorhanden */}
                        {entry.expectationHorizonUrl && (
                          <button
                            type="button"
                            onClick={() => openInNewTab(entry.expectationHorizonUrl || undefined)}
                            className="secondary-button"
                          >
                            Erwartungshorizont anzeigen
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openInNewTab(expectationUrl)}
                        disabled={!expectationUrl}
                        className="secondary-button"
                      >
                        Erwartungshorizont öffnen
                      </button>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'analyse' && (
                <>
                  {isLoading ? (
                    <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                      Lade Detailanalyse...
                    </div>
                  ) : tasks.length > 0 ? (
                    <div className="detail-drawer-list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                      {tasks.map((task, index) => (
                        <TaskAccordion key={`${task.taskId}-${index}`} task={task} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-gray-500)' }}>
                      Keine Aufgaben gefunden.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
