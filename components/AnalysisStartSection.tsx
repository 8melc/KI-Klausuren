'use client';

interface AnalysisStartSectionProps {
  disabled: boolean;
  onStart: () => void;
  error?: string | null;
  isAnalyzing?: boolean;
  progress?: { current: number; total: number; currentFile: string } | number | null;
  buttonText?: string;
  statusMessage?: string | null;
}

export default function AnalysisStartSection({ disabled, onStart, error, isAnalyzing = false, progress, buttonText, statusMessage }: AnalysisStartSectionProps) {
  return (
    <div className="cta-card" style={{ textAlign: 'center' }}>
      <div>
        {!disabled && !isAnalyzing && (
          <p className="text-sm text-slate-700 mb-3">
            Alle Dateien wurden hinterlegt. Starte jetzt die Analyse, um die Klausuren automatisch auswerten zu lassen.
          </p>
        )}
        {isAnalyzing && statusMessage && (
          <p style={{ 
            marginTop: 'var(--spacing-md)', 
            marginBottom: 'var(--spacing-md)',
            padding: 'var(--spacing-md)',
            background: 'var(--color-info-light)',
            border: '1px solid var(--color-primary-light)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--color-gray-700)',
            fontSize: '0.9375rem',
            lineHeight: '1.6'
          }}>
            {statusMessage}
          </p>
        )}
        {isAnalyzing && !statusMessage && (
          <p style={{ 
            marginTop: 'var(--spacing-md)', 
            marginBottom: 'var(--spacing-md)',
            padding: 'var(--spacing-md)',
            background: 'var(--color-info-light)',
            border: '1px solid var(--color-primary-light)',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--color-gray-700)',
            fontSize: '0.9375rem',
            lineHeight: '1.6'
          }}>
            Die Analyse wurde gestartet. Bitte diese Seite geöffnet lassen und nicht neu laden oder verlassen, bis die Auswertung abgeschlossen ist.
          </p>
        )}
        <button
          type="button"
          className="primary-button"
          onClick={onStart}
          disabled={disabled}
          style={{ width: '100%', maxWidth: '500px', position: 'relative' }}
        >
          {isAnalyzing ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
              <span
                className="processing-spinner"
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                }}
              />
              Analyse läuft...
            </span>
          ) : (
            <span>{buttonText || 'Analyse starten'}</span>
          )}
        </button>
        
        {isAnalyzing && progress && typeof progress === 'object' && progress !== null && 'current' in progress && (
          <div style={{ 
            marginTop: 'var(--spacing-lg)', 
            padding: 'var(--spacing-lg)', 
            background: 'var(--color-info-light)', 
            border: '1px solid var(--color-primary-light)', 
            borderRadius: 'var(--radius-lg)',
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
              <span
                className="processing-spinner"
                style={{
                  width: '20px',
                  height: '20px',
                }}
              />
              <p style={{ fontWeight: 600, color: 'var(--color-primary-dark)', margin: 0 }}>
                Analysiere Klausur {progress.current} von {progress.total}
              </p>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)', margin: 0, marginTop: 'var(--spacing-xs)' }}>
              {progress.currentFile}
            </p>
            <div style={{ 
              marginTop: 'var(--spacing-md)', 
              height: '6px', 
              background: 'var(--color-gray-200)', 
              borderRadius: '999px', 
              overflow: 'hidden' 
            }}>
              <div style={{ 
                height: '100%', 
                background: 'var(--color-primary)', 
                width: `${Math.round((progress.current / progress.total) * 100)}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}
        
        {!isAnalyzing && (
          <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-gray-600)' }}>
            Nach dem Start werden alle Arbeiten sequenziell analysiert und im Ergebnisbereich gelistet.
          </p>
        )}
        
        {error && <p style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-error)' }}>{error}</p>}
      </div>
    </div>
  );
}
