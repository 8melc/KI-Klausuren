import Link from 'next/link';

const features = [
  {
    title: 'Liest unleserliche Handschriften',
    description: 'Scans und PDFs werden zuverlässig erfasst – auch bei Schnellschriften und Randnotizen.',
  },
  {
    title: 'Bewertung nach Erwartungshorizont',
    description: 'Upload als Bewertungsbasis sorgt für faire, konsistente Noten pro Aufgabe.',
  },
  {
    title: 'Automatische Teilpunkte',
    description: 'Plausibilitätschecks, Punktespiegel und klare Begründungen pro Aufgabe.',
  },
  {
    title: 'Korrigiertes Word-Dokument',
    description: 'Export als DOCX mit Kommentaren am Rand, Punktespiegel und Klassenhinweisen.',
  },
  {
    title: 'Ganzen Klassensatz hochladen',
    description: 'Bis zu 10 Klausuren auf einmal hochladen – fertig in 4–6 Minuten.',
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
  { label: 'Klassensatz', value: '10 PDFs' },
  { label: 'Fairness', value: 'konstant' },
];

export default function Home() {
  return (
    <>
      <section className="hero" id="hero">
        <div className="container">
          <div className="hero-content">
            <p className="hero-tag">Erste Klausur kostenlos ausprobieren · Early Access: 25 Credits für 7,90 € (statt später 29 €)</p>
            <h1 className="hero-title">Korrigieren Sie eine Klasse in Minuten statt Stunden.</h1>
            <p className="hero-subtitle">
              KorrekturPilot automatisiert die komplette Klausurkorrektur: Handschrift-OCR,
              Bewertung nach Erwartungshorizont, Teilpunkte und DOCX-Feedback. Holen Sie sich zuerst den
              Aha-Moment mit einer kostenlosen Klausur – sichern Sie danach den Early-Access-Preis.
            </p>
            <div className="hero-cta-group">
              <Link href="/expectation" className="primary-button">
                <span>Kostenlose Klausur starten</span>
              </Link>
              <Link href="#pricing" className="secondary-button">
                <span>Early Access sichern</span>
              </Link>
              <Link href="#example" className="text-link">
                <span>Beispiel ansehen</span>
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

      <section className="module-section" id="value">
        <div className="container">
          <h2 className="section-title">Rechnen Sie Ihren Samstag durch.</h2>
          <p className="section-description">Eine Klasse korrigieren dauert ca. 5 Stunden. Mit KorrekturPilot ca. 30 Minuten.</p>
          <div className="module-grid">
            <div className="module-card">
              <h3>Was ist Ihnen Ihre Zeit wert?</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Für den Preis von zwei Cappuccinos (7,90 €) kaufen Sie sich 4 Stunden Freizeit. Eine Klasse weniger am Samstag,
                mehr Zeit für Familie oder Vorbereitung.
              </p>
            </div>
            <div className="module-card">
              <h3>Konkreter Vergleich</h3>
              <ul style={{ lineHeight: 1.6, color: 'var(--color-gray-700)', paddingLeft: 'var(--spacing-lg)' }}>
                <li>Manuell: ~5 Stunden pro Klasse</li>
                <li>Mit KorrekturPilot: ~30 Minuten</li>
                <li>Ersparnis: ~4,5 Stunden pro Durchgang</li>
              </ul>
              <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-gray-700)' }}>
                Rechnen Sie hoch: Jede Klasse spart Ihnen einen halben Arbeitstag.
              </p>
            </div>
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
          <div className="beta-note" style={{ marginTop: 'var(--spacing-xl)' }}>
            <strong>Hinweis für Tester:</strong> Bitte schwärzen Sie die Namen der Schüler vor dem Scan oder nutzen Sie anonymisierte Klausuren. So sind Sie datenschutzrechtlich auf der sicheren Seite.
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
            <div className="module-card">
              <h3>Vorher / Nachher</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Links: handschriftliche Seite. Rechts: automatisch generierte Kommentare und Punkte. Zeigt, dass auch Schnellschriften sicher gelesen werden.
              </p>
              <div style={{ marginTop: 'var(--spacing-md)', display: 'grid', gap: 'var(--spacing-sm)', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div style={{ border: '1px dashed var(--color-gray-300)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--color-gray-600)' }}>
                  Platzhalter: Scan einer handschriftlichen Seite
                </div>
                <div style={{ border: '1px dashed var(--color-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--color-gray-600)' }}>
                  Platzhalter: Kommentar-/Punkte-Overlay
                </div>
              </div>
            </div>
            <div className="module-card">
              <h3>Screenshot des DOCX</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Fertiges Word-Dokument mit Randkommentaren, Punktespiegel und ausgefülltem Erwartungshorizont.
              </p>
              <div style={{ marginTop: 'var(--spacing-md)', border: '1px dashed var(--color-gray-300)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--color-gray-600)' }}>
                Platzhalter: Screenshot des DOCX-Exports
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="pricing-header">
            <h2 className="section-title">Sofort starten, fair bezahlen.</h2>
            <p className="section-description">Erste Klausur kostenlos ausprobieren. Early-Access-Preis nur für kurze Zeit: 7,90 € statt 29 €.</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <p className="pricing-badge">Erste Klausur inklusive</p>
              <div className="pricing-card-header">
                <h3>1 Klausur</h3>
                <p className="pricing-card-price">0 €</p>
              </div>
              <p className="pricing-card-description">Starten Sie sofort, erleben Sie den Ablauf und sehen Sie das Ergebnis, bevor Sie zahlen.</p>
              <ul className="pricing-card-features">
                <li>Erwartungshorizont-Upload</li>
                <li>Handschrift-OCR</li>
                <li>DOCX-Feedback</li>
              </ul>
              <Link href="/expectation" className="secondary-button pricing-button">
                Erste Korrektur starten
              </Link>
            </div>
            <div className="pricing-card pricing-card-highlighted">
              <p className="pricing-badge">Early Access Deal</p>
              <div className="pricing-card-header">
                <h3>25 Klausuren</h3>
                <p className="pricing-card-price">7,90 € <span>/ statt 29 €</span></p>
              </div>
              <p className="pricing-card-description">Nach dem Aha-Moment die restlichen Klausuren vom Tisch räumen.</p>
              <ul className="pricing-card-features">
                <li>Ganzen Klassensatz auf einmal hochladen</li>
                <li>Erwartungshorizont als Grundlage</li>
                <li>Export als DOCX</li>
                <li>Fairness &amp; Konsistenz gesichert</li>
              </ul>
              <p style={{ color: 'var(--color-gray-700)' }}>
                100% Zufriedenheitsgarantie: Wenn Ihnen die Korrektur keine Zeit spart, erhalten Sie Ihr Geld sofort zurück. Umgerechnet 0,31 € pro Klausur – weniger als 2 Minuten Arbeitszeit.
              </p>
              <Link href="/upload" className="primary-button pricing-button">
                Early Access sichern
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

      <section className="module-section" id="social-proof">
        <div className="container">
          <h2 className="section-title">Gemeinsam mit den ersten 20 Pionieren.</h2>
          <p className="section-description">Transparenz statt gekaufter Zitate: Wir starten mit einer kleinen, engagierten Gruppe.</p>
          <div className="module-grid">
            <div className="module-card">
              <h3>Pionier-Programm</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Werde eine:r von 20 Pionier:innen, die KorrekturPilot jetzt schon nutzen. Direkter Draht zum Team,
                schneller Support und Einfluss auf die nächsten Features.
              </p>
            </div>
            <div className="module-card">
              <h3>Warum jetzt einsteigen?</h3>
              <ul style={{ lineHeight: 1.6, color: 'var(--color-gray-700)', paddingLeft: 'var(--spacing-lg)' }}>
                <li>Early-Access-Preis sichern (7,90 € statt 29 €)</li>
                <li>Erste Klausur kostenlos – Aha-Moment vor der Bezahlschranke</li>
                <li>Priorisierter Support und Feedback-Kanal</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="module-section" id="trust">
        <div className="container">
          <h2 className="section-title">Vertrauen &amp; Sicherheit zuerst.</h2>
          <p className="section-description">Datenschutz, Support und klare Ansprechpartner – bevor Sie etwas hochladen.</p>
          <div className="module-grid">
            <div className="module-card">
              <h3>Anonymisierung</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Hinweis für Tester: Bitte schwärzen Sie die Namen der Schüler vor dem Scan oder nutzen Sie anonymisierte Klausuren. So sind Sie datenschutzrechtlich zu 100% auf der sicheren Seite.
              </p>
            </div>
            <div className="module-card">
              <h3>Geld-zurück-Garantie</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                100% Zufriedenheitsgarantie: Wenn die Korrektur Ihnen keine Zeit spart, bekommen Sie Ihr Geld sofort zurück.
              </p>
            </div>
            <div className="module-card">
              <h3>Kontakt &amp; Support</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Fragen an die Entwickler? Schreiben Sie an <a href="mailto:hello@korrekturpilot.de" className="text-link">hello@korrekturpilot.de</a>. Made with ❤️ in Deutschland.
              </p>
            </div>
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
