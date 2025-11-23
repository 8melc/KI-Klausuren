'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ExpectationPage() {
  const [erwartungshorizont, setErwartungshorizont] = useState<string | null>(null);

  const handleUploadComplete = (text: string) => {
    setErwartungshorizont(text);
    // Speichere im localStorage für späteren Gebrauch
    localStorage.setItem('erwartungshorizont', text);
  };

  return (
    <ProtectedRoute>
      <section className="page-section">
      <div className="container">
        <div className="page-intro">
          <h1 className="page-intro-title">Erwartungshorizont hochladen</h1>
          <p className="page-intro-text">
            Laden Sie Musterlösung, Bewertungskriterien oder Rubriken als PDF hoch. Diese
            Informationen bilden die Basis für jede KI-Auswertung.
          </p>
        </div>

        <div className="upload-step">
          <div className="step-header">
            <span className="step-badge">Schritt 1</span>
            <h3 className="step-heading">Grundlagen hochladen</h3>
          </div>
          <UploadBox
            label="Erwartungshorizont"
            hint="PDF mit Musterlösung oder Bewertungsraster"
            buttonLabel="PDF auswählen"
            onUploadComplete={handleUploadComplete}
          />
        </div>

        {erwartungshorizont && (
          <div className="status-card status-card-success">
            <div className="status-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="status-content-title">Erwartungshorizont gespeichert</p>
              <p className="status-content-text">
                {erwartungshorizont.substring(0, 200)}...
              </p>
            </div>
          </div>
        )}

        <div className="status-card status-card-info">
          <div className="status-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="status-content-title">API Key erforderlich</p>
            <p className="status-content-text">
              Hinterlegen Sie Ihren OpenAI API Key in der Datei{' '}
              <code>.env.local</code>, damit die Analyse ausgelöst werden kann.
            </p>
          </div>
        </div>
      </div>
    </section>
    </ProtectedRoute>
  );
}
