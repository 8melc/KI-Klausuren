'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UploadPage() {
  const [klausurText, setKlausurText] = useState<string | null>(null);

  const handleUploadComplete = (text: string) => {
    setKlausurText(text);
    // Speichere im localStorage für späteren Gebrauch
    localStorage.setItem('klausurText', text);
    // Speichere auch den Dateinamen (falls verfügbar)
    const filename = localStorage.getItem('klausurFilename') || 'Klausur';
    localStorage.setItem('klausurName', filename);
  };

  return (
    <ProtectedRoute>
      <section className="page-section">
      <div className="container">
        <div className="page-intro">
          <h1 className="page-intro-title">Schülerklausuren hochladen</h1>
          <p className="page-intro-text">
            Bündeln Sie alle PDF-Scans eines Klassensatzes. Die KI erkennt automatisch
            Handschrift, Aufgaben und Zuordnungen.
          </p>
        </div>

        <div className="upload-step">
          <div className="step-header">
            <span className="step-badge">Schritt 2</span>
            <h3 className="step-heading">Klausuren sammeln</h3>
          </div>
          <UploadBox
            label="Klausuren hochladen"
            hint="Mehrere PDF-Dateien auf einmal"
            buttonLabel="Dateien auswählen"
            endpoint="/api/extract-klausur"
            onUploadComplete={handleUploadComplete}
          />
        </div>

        {klausurText ? (
          <div className="status-card status-card-success">
            <div className="status-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="status-content-title">Klausur importiert</p>
              <p className="status-content-text">
                {klausurText.length} Zeichen extrahiert ·{' '}
                <span className="upload-status-preview">
                  Vorschau: {klausurText.substring(0, 160)}...
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="status-card status-card-info">
            <div className="status-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="status-content-title">Tipp</p>
              <p className="status-content-text">
                Benennen Sie die Dateien nach den Schülern, damit die Ergebnisse später
                automatisch zugeordnet werden.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
    </ProtectedRoute>
  );
}
