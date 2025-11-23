import Link from 'next/link';

const heroStats = [
  { value: '80%', label: 'Zeitersparnis' },
  { value: '15 Min.', label: 'pro Klassensatz' },
  { value: '100%', label: 'Nachvollziehbar' },
];

const steps = [
  {
    number: '1',
    title: 'Erwartungshorizont hochladen',
    description: 'Laden Sie Musterlösung und Bewertungskriterien als PDF hoch.',
  },
  {
    number: '2',
    title: 'Klausuren hochladen',
    description: 'Scannen Sie Schülerklausuren und laden Sie alle PDFs auf einmal.',
  },
  {
    number: '3',
    title: 'KI analysiert automatisch',
    description:
      'Die Handschrift wird gelesen, mit dem Erwartungshorizont abgeglichen und bewertet.',
  },
  {
    number: '4',
    title: 'Ergebnisse prüfen & exportieren',
    description: 'Bewertungen kontrollieren, anpassen und Feedback-PDFs exportieren.',
  },
];

const studentPreview = ['Anna Schmidt', 'Max Müller', 'Lisa Weber'];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Klausuren korrigieren in Minuten statt Stunden
            </h1>
            <p className="hero-subtitle">
              KI-gestützte Korrektur für handgeschriebene Klausuren. Präzise, fair und
              transparent.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <Link href="/upload" className="primary-button">
                <span>Korrektur starten</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/results" className="secondary-button">
                <span>Ergebnisse ansehen</span>
              </Link>
            </div>

            <div className="hero-stats">
              {heroStats.map((stat) => (
                <div className="stat" key={stat.label}>
                  <div className="stat-number">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">So funktioniert&apos;s</h2>
          <div className="steps">
            {steps.map((step) => (
              <div className="step" key={step.number}>
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="upload-section">
        <div className="container">
          <h2 className="section-title">Korrektur starten</h2>

          <div className="upload-step">
            <div className="step-header">
              <span className="step-badge">Schritt 1</span>
              <h3 className="step-heading">Grundlagen hochladen</h3>
            </div>
            <div className="upload-grid">
              <Link href="/expectation" className="upload-box upload-box-link">
                <div className="upload-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="upload-content">
                  <p className="upload-label">Erwartungshorizont</p>
                  <p className="upload-hint">PDF mit Musterlösung</p>
                  <span className="upload-button">Jetzt hochladen</span>
                </div>
              </Link>

              <div className="upload-box upload-box-muted">
                <div className="upload-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="upload-content">
                  <p className="upload-label">Aufgabenstellung</p>
                  <p className="upload-hint">Optional – in Arbeit</p>
                  <span className="upload-button">Bald verfügbar</span>
                </div>
              </div>
            </div>
          </div>

          <div className="upload-step">
            <div className="step-header">
              <span className="step-badge">Schritt 2</span>
              <h3 className="step-heading">Schülerklausuren hochladen</h3>
            </div>

            <Link href="/upload" className="upload-box upload-box-large upload-box-link">
              <div className="upload-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="upload-content">
                <p className="upload-label">Klausuren hochladen</p>
                <p className="upload-hint">Mehrere PDFs gleichzeitig möglich</p>
                <span className="upload-button">Dateien auswählen</span>
              </div>
            </Link>

            <div className="student-list">
              <div className="student-list-header">
                <h4>Ausgewählte Schüler</h4>
                <span className="student-count">{studentPreview.length} Beispiele</span>
              </div>
              {studentPreview.map((student) => (
                <div className="student-item" key={student}>
                  <div className="student-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="student-name-input"
                    value={student}
                    readOnly
                  />
                  <button className="remove-button" type="button" disabled>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="action-section">
            <Link href="/results" className="primary-button">
              <span>Ergebnisse ansehen</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="action-hint">Alle Dateien werden automatisch verarbeitet.</p>
          </div>
        </div>
      </section>
    </>
  );
}
