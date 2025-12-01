import Link from 'next/link';

const features = [
  {
    title: 'Handschrift-OCR',
    description: 'Scans und PDFs werden sauber erkannt – auch bei Schnellschriften.',
  },
  {
    title: 'Erwartungshorizont',
    description: 'Upload als Bewertungsbasis sorgt für faire, konsistente Noten.',
  },
  {
    title: 'Automatische Bepunktung',
    description: 'Teilpunkte, Plausibilitätschecks und klare Punktespiegel pro Aufgabe.',
  },
  {
    title: 'DOCX-Feedback',
    description: 'Export als Word mit Kommentaren, Punktespiegel und Klassenhinweisen.',
  },
  {
    title: 'Batch-Korrektur',
    description: 'Bis zu 10 Klausuren parallel in 4–6 Minuten durchlaufen lassen.',
  },
];

const steps = [
  {
    title: 'Erwartungshorizont bereitstellen',
    description: 'PDF hochladen – wird als Referenz für alle Korrekturen genutzt.',
  },
  {
    title: 'Klausuren scannen & hochladen',
    description: 'PDFs der Klasse hochladen, Dateinamen dienen als Zuordnung.',
  },
  {
    title: 'KI bewertet & vergleicht',
    description: 'OCR → Analyse → Punktevergabe pro Aufgabe mit Erwartungshorizont-Abgleich.',
  },
  {
    title: 'DOCX-Export senden',
    description: 'Feedback als Word mit Kommentaren und Punktespiegel herunterladen.',
  },
];

const faqs = [
  {
    q: 'Für welche Fächer funktioniert das?',
    a: 'Alle textbasierten Fächer (Deutsch, Geschichte, Biologie, Politik, Fremdsprachen). Multiple-Choice ist ebenfalls möglich.',
  },
  {
    q: 'Wie läuft die kostenlose Testklausur?',
    a: 'Einmalig Erwartungshorizont + eine Klausur hochladen, Ergebnis als DOCX erhalten. Danach Credits buchen.',
  },
  {
    q: 'Wie steht es um Datenschutz?',
    a: 'Daten werden nur für die Korrektur genutzt. Keine öffentliche Speicherung, keine Weitergabe.',
  },
  {
    q: 'Wie lange dauert eine Korrektur?',
    a: '4–6 Minuten für bis zu 10 Klausuren, abhängig von Scan-Qualität und Umfang.',
  },
  {
    q: 'Was kostet KorrekturPilot nach dem Test?',
    a: '25er Credit-Paket für 7,90 €. Jeder Credit = eine korrigierte Klausur.',
  },
  {
    q: 'Brauche ich technische Vorkenntnisse?',
    a: 'Nein. Upload → Start → DOCX laden. Keine weiteren Tools nötig.',
  },
];

const stats = [
  { label: 'Zeitersparnis', value: '-75%' },
  { label: 'Durchlauf', value: '4–6 Min' },
  { label: 'Batch', value: '10 PDFs' },
  { label: 'Fairness', value: 'konstant' },
];

export default function Home() {
  return (
    <>
      <section className="hero" id="hero">
        <div className="container">
          <div className="hero-content">
            <p className="hero-tag">1 kostenlose Testklausur · danach 25 Credits für 7,90 €</p>
            <h1 className="hero-title">Korrigieren Sie eine Klasse in Minuten statt Stunden.</h1>
            <p className="hero-subtitle">
              KorrekturPilot automatisiert die komplette Klausurkorrektur: Handschrift-OCR,
              Bewertung nach Erwartungshorizont, Teilpunkte und DOCX-Feedback. So bleibt Zeit für
              pädagogisches Feedback.
            </p>
            <div className="hero-cta-group">
              <Link href="/expectation" className="primary-button">
                <span>Jetzt kostenlos testen</span>
              </Link>
              <Link href="#example" className="secondary-button">
                <span>Beispiel ansehen</span>
              </Link>
              <Link href="#steps" className="text-link">
                Step-by-Step →
              </Link>
            </div>
            <div className="feature-grid" style={{ marginTop: 'var(--spacing-xl)' }}>
              {stats.map((item) => (
                <div key={item.label} className="feature-card">
                  <p className="feature-card-title">{item.label}</p>
                  <p className="feature-card-text">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="module-section" id="problem">
        <div className="container">
          <h2 className="section-title">Korrigieren frisst Abende – und bleibt subjektiv.</h2>
          <p className="section-description">
            Handschriftliche Klassenarbeiten kosten pro Schüler:in 10–20 Minuten. Allgemeine KI-Tools
            helfen nur begrenzt, weil sie nicht auf Erwartungshorizonte ausgelegt sind.
          </p>
          <div className="module-grid">
            <div className="module-card">
              <h3>Problem</h3>
              <ul style={{ lineHeight: 1.6, color: 'var(--color-gray-700)', paddingLeft: 'var(--spacing-lg)' }}>
                <li>Zeitverlust pro Klasse (25–30 Arbeiten)</li>
                <li>Inkonstante Bewertung und subjektive Abzüge</li>
                <li>Fehleranfällige Nacharbeit und Korrekturschleifen</li>
              </ul>
            </div>
            <div className="module-card">
              <h3>Lösung</h3>
              <ul style={{ lineHeight: 1.6, color: 'var(--color-gray-700)', paddingLeft: 'var(--spacing-lg)' }}>
                <li>Handschrift-OCR + Erwartungshorizont-Abgleich</li>
                <li>Teilpunkte, Punktespiegel, Feedback und DOCX-Export</li>
                <li>Batch-Korrektur von bis zu 10 Klausuren in 4–6 Minuten</li>
              </ul>
              <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                <Link href="/upload" className="primary-button">
                  Kostenlos starten
                </Link>
                <Link href="#pricing" className="secondary-button">
                  Preise ansehen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="module-section" id="features">
        <div className="container">
          <h2 className="section-title">Entwickelt für Lehrkräfte – nicht für KI-Bastler.</h2>
          <p className="section-description">
            Alles, was Sie für schnelle, faire Korrekturen brauchen – ohne Setup-Aufwand.
          </p>
          <div className="module-grid">
            {features.map((feature) => (
              <div key={feature.title} className="module-card">
                <h3 className="module-card-title">{feature.title}</h3>
                <p className="module-card-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="how-it-works" id="steps">
        <div className="container">
          <h2 className="section-title">In 4 Schritten zur fertigen DOCX-Korrektur.</h2>
          <p className="section-description">Upload → Analyse → Bepunktung → Export.</p>
          <div className="process-grid">
            {steps.map((step, index) => (
              <div key={step.title} className="process-card">
                <div className="step" style={{ alignItems: 'flex-start' }}>
                  <div className="step-number">{index + 1}</div>
                  <div className="step-content">
                    <p className="step-title">{step.title}</p>
                    <p className="step-description">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="module-section" id="example">
        <div className="container">
          <h2 className="section-title">Wie sieht das Ergebnis aus?</h2>
          <p className="section-description">
            Sauberes Word-Dokument mit Punktespiegel, kommentierten Aufgaben und kurzer Rückmeldung an die Klasse.
          </p>
          <div className="module-grid">
            <div className="module-card">
              <h3>DOCX-Feedback</h3>
              <p>Feedback.docx · 4 Seiten · Exportiert am 10. März</p>
              <ul style={{ marginTop: 'var(--spacing-md)', lineHeight: 1.6, color: 'var(--color-gray-700)', paddingLeft: 'var(--spacing-lg)' }}>
                <li>Aufgabe 1 · 9/10 – Teilpunkte vergeben, Quellenangabe fehlt.</li>
                <li>Aufgabe 2 · 7/8 – Struktur-Hinweise ergänzt, Erwartung erfüllt.</li>
                <li>Punktespiegel · 23/26 · Note 1- · Kommentare pro Teilaufgabe.</li>
                <li>Klassenfeedback · Stärken & nächste Übungsschritte.</li>
              </ul>
            </div>
            <div className="module-card">
              <h3>Warum DOCX?</h3>
              <ul style={{ lineHeight: 1.6, color: 'var(--color-gray-700)', paddingLeft: 'var(--spacing-lg)' }}>
                <li>Direkt editierbar und personalisierbar</li>
                <li>Kompatibel mit Schulservern und Mailversand</li>
                <li>Saubere Formatierung für Ausdruck und Weitergabe</li>
              </ul>
              <p style={{ marginTop: 'var(--spacing-lg)', color: 'var(--color-gray-700)' }}>
                Zeitbedarf: 4–6 Minuten für bis zu 10 Klausuren gleichzeitig.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="pricing-header">
            <h2 className="section-title">Sofort starten, fair bezahlen.</h2>
            <p className="section-description">Eine kostenlose Testklausur. Danach Credits buchen, wenn es passt.</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card pricing-card-highlighted">
              <p className="pricing-badge">Testen</p>
              <div className="pricing-card-header">
                <h3>1 kostenlose Klausur</h3>
                <p className="pricing-card-price">0 €</p>
              </div>
              <p className="pricing-card-description">Volle Funktionalität, keine Zahlungsdaten erforderlich.</p>
              <ul className="pricing-card-features">
                <li>Erwartungshorizont-Upload</li>
                <li>Handschrift-OCR</li>
                <li>DOCX-Feedback</li>
              </ul>
              <Link href="/expectation" className="primary-button pricing-button">
                Jetzt gratis testen
              </Link>
            </div>
            <div className="pricing-card">
              <p className="pricing-badge">Credits</p>
              <div className="pricing-card-header">
                <h3>25 Credits</h3>
                <p className="pricing-card-price">7,90 €</p>
              </div>
              <p className="pricing-card-description">1 Credit = 1 korrigierte Klausur. Ideal für eine Klasse.</p>
              <ul className="pricing-card-features">
                <li>Batch-Korrektur bis 10 PDFs</li>
                <li>Erwartungshorizont als Grundlage</li>
                <li>Export als DOCX</li>
                <li>Fairness &amp; Konsistenz gesichert</li>
              </ul>
              <Link href="/upload" className="secondary-button pricing-button">
                Credits sichern
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="module-section" id="faq">
        <div className="container">
          <h2 className="section-title">Häufige Fragen</h2>
          <p className="section-description">Alles Wichtige zu Einsatz, Kosten und Datenschutz.</p>
          <div className="module-grid">
            {faqs.map((item) => (
              <div key={item.q} className="module-card">
                <h3>{item.q}</h3>
                <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div>
              <p className="cta-badge">Bereit?</p>
              <h2>Starten Sie die kostenlose Testklausur.</h2>
              <p>Weniger Korrekturzeit, mehr pädagogisches Feedback – ab heute.</p>
            </div>
            <div className="cta-actions">
              <Link href="/expectation" className="primary-button">
                Jetzt kostenlos testen
              </Link>
              <Link href="#steps" className="secondary-button">
                Ablauf ansehen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
