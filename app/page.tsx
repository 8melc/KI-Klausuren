import Link from 'next/link';

const features = [
  {
    title: 'Liest jede Handschrift',
    description: 'Egal ob Schönschrift oder Gekritzel: Die KI erkennt den Text zuverlässig, sogar Randnotizen.',
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
    description: 'Export als Word-Datei mit Kommentaren am Rand, Punktespiegel und Klassenhinweisen.',
  },
  {
    title: 'Ganzen Klassensatz hochladen',
    description: 'Laden Sie den ganzen Stapel hoch. Während Sie einen Kaffee holen, ist die Erstkorrektur fertig (ca. 4–6 Min).',
  },
  {
    title: 'ChatGPT kann das nicht',
    description: 'ChatGPT kann keine 30 handschriftlichen PDFs gleichzeitig verarbeiten und strukturiert benoten. Wir schon.',
  },
];

const steps = [
  {
    title: 'Erwartungshorizont hochladen',
    description: 'Ein Foto oder PDF Ihrer Musterlösung reicht. Das ist die Referenz für die KI.',
  },
  {
    title: 'Klausuren scannen & hochladen',
    description: 'Einfach als PDF. Wichtig: Bitte schwärzen Sie vorher die Namen der Schüler (Datenschutz).',
  },
  {
    title: 'KI korrigiert & kommentiert',
    description: 'Abgleich mit Ihrer Lösung, Punktevergabe und Formulierung von Feedback-Vorschlägen.',
  },
  {
    title: 'Word-Export & Kontrolle',
    description: 'Sie erhalten ein Word-Dokument und behalten die volle Kontrolle über Noten und Feedback.',
  },
];

const faqs = [
  {
    q: 'Für welche Fächer funktioniert das?',
    a: 'Alle textbasierten Fächer (Deutsch, Geschichte, Biologie, Politik, Fremdsprachen). Multiple-Choice ist ebenfalls möglich.',
  },
  {
    q: 'Wie läuft die kostenlose Testklausur?',
    a: 'Einmalig Erwartungshorizont + eine Klausur hochladen, Ergebnis als Word-Dokument erhalten. Danach das Paket freischalten.',
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
    a: 'Pionier-Angebot: 25 Klausuren für 7,90 € (statt 29 €).',
  },
  {
    q: 'Brauche ich technische Vorkenntnisse?',
    a: 'Nein. Upload → Start → Word-Dokument laden. Keine weiteren Tools nötig.',
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
      <section className="module-section" style={{ padding: 'var(--spacing-sm) 0', background: 'var(--color-gray-50)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="hero-tag" style={{ margin: 0 }}>Beta-Phase: Werden Sie eine:r von 20 Pionier:innen und gestalten Sie das Tool mit.</p>
        </div>
      </section>

      <section className="hero" id="hero">
        <div className="container">
          <div className="hero-content">
            <p className="hero-tag">Erste Klausur kostenlos ausprobieren · Early Access: 25 Klausuren für 7,90 € (statt später 29 €)</p>
            <h1 className="hero-title">Korrigieren Sie eine Klasse in Minuten statt Stunden.</h1>
            <p className="hero-subtitle">
              Schluss mit Korrektur-Marathons. Unsere KI liest jede Handschrift, gleicht sie mit Ihrem Erwartungshorizont ab
              und erstellt ein fertiges Word-Feedback. Testen Sie die erste Klausur risikofrei – und sichern Sie sich danach den
              lebenslangen Vorzugspreis.
            </p>
            <div className="hero-cta-group">
              <Link href="/expectation" className="primary-button">
                <span>Jetzt 1. Klausur kostenlos testen</span>
              </Link>
              <Link href="#pricing" className="secondary-button">
                <span>Zum Pionier-Angebot</span>
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
          <h2 className="section-title">Korrigieren frisst Abende – und bleibt oft subjektiv.</h2>
          <p className="section-description">
            Handschriftliche Arbeiten zu entziffern und fair zu bewerten kostet Sie pro Heft 15–20 Minuten. ChatGPT hilft hier nicht, weil es keine PDF-Stapel lesen kann. KorrekturPilot löst genau das.
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
                <li>Liest auch unleserliche Handschriften ("Sauklaue") und gleicht sie mit dem Erwartungshorizont ab</li>
                <li>Automatische Bepunktung &amp; individuelles Feedback</li>
                <li>Ganzen Klassensatz (bis 10 Hefte) auf einen Klick korrigieren</li>
              </ul>
              <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                <Link href="/upload" className="primary-button">
                  Kostenlos starten
                </Link>
                <Link href="#example" className="secondary-button">
                  Kostenloses Beispiel ansehen
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
                Für den Preis von zwei Cappuccinos (7,90 €) sichern Sie sich 4 Stunden Freizeit. Eine Klasse weniger am Samstag,
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
          <h2 className="section-title">In 4 Schritten zur fertigen Word-Korrektur.</h2>
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
              <h3>Word-Feedback</h3>
              <p>Feedback.docx · 4 Seiten · Exportiert am 10. März</p>
              <ul style={{ marginTop: 'var(--spacing-md)', lineHeight: 1.6, color: 'var(--color-gray-700)', paddingLeft: 'var(--spacing-lg)' }}>
                <li>Aufgabe 1 · 9/10 – Teilpunkte vergeben, Quellenangabe fehlt.</li>
                <li>Aufgabe 2 · 7/8 – Struktur-Hinweise ergänzt, Erwartung erfüllt.</li>
                <li>Punktespiegel · 23/26 · Note 1- · Kommentare pro Teilaufgabe.</li>
                <li>Klassenfeedback · Stärken & nächste Übungsschritte.</li>
              </ul>
            </div>
            <div className="module-card">
              <h3>Warum ein Word-Dokument?</h3>
              <ul style={{ lineHeight: 1.6, color: 'var(--color-gray-700)', paddingLeft: 'var(--spacing-lg)' }}>
                <li>Direkt editierbar und personalisierbar</li>
                <li>Kompatibel mit Schulservern und Mailversand</li>
                <li>Saubere Formatierung für Ausdruck und Weitergabe</li>
                <li>Erwartungshorizont kann als PDF/Foto hochgeladen oder direkt eingetippt werden</li>
              </ul>
              <p style={{ marginTop: 'var(--spacing-lg)', color: 'var(--color-gray-700)' }}>
                Zeitbedarf: 4–6 Minuten für bis zu 10 Klausuren gleichzeitig.
              </p>
            </div>
            <div className="module-card">
              <h3>Vorher / Nachher</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Links: Die handschriftliche Schülerseite. Rechts: Das Overlay der KI mit erkannten Fehlern, Korrekturvorschlägen und Punkten. Transparent und nachvollziehbar.
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
              <h3>Screenshot des Word-Exports</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Sie bekommen kein kryptisches Dateiformat, sondern ein sauberes Word-Dokument. Mit Randkommentaren,
                ausgefülltem Erwartungshorizont und einem persönlichen Text für den Schüler. Sofort druckbereit.
              </p>
              <div style={{ marginTop: 'var(--spacing-md)', border: '1px dashed var(--color-gray-300)', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--color-gray-600)' }}>
                Platzhalter: Screenshot des Word-Exports
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="container">
          <div className="pricing-header">
            <h2 className="section-title">Überzeugen Sie sich selbst – ohne Risiko.</h2>
            <p className="section-description">Probieren Sie die erste Klausur kostenlos aus. Wenn das Ergebnis Sie überzeugt, sichern Sie sich den Vorzugspreis für den gesamten Klassensatz.</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <p className="pricing-badge">Zum Kennenlernen</p>
              <div className="pricing-card-header">
                <h3>1 Klausur inkl. Word-Export</h3>
                <p className="pricing-card-price">0 €</p>
              </div>
              <p className="pricing-card-description">Testen Sie unverbindlich, wie präzise die KI Ihre Handschriften liest und bewertet. Keine Zahlungsdaten nötig.</p>
              <ul className="pricing-card-features">
                <li>Upload Erwartungshorizont</li>
                <li>Zuverlässige Handschrifterkennung</li>
                <li>Korrektur als Word-Dokument</li>
              </ul>
              <Link href="/expectation" className="secondary-button pricing-button">
                Jetzt 1. Klausur testen
              </Link>
            </div>
            <div className="pricing-card pricing-card-highlighted">
              <p className="pricing-badge">Pionier-Angebot</p>
              <div className="pricing-card-header">
                <h3>Das Klassensatz-Paket</h3>
                <p className="pricing-card-price">7,90 € <span style={{ textDecoration: 'line-through', color: 'var(--color-gray-500)', fontSize: '0.95rem' }}>29 €</span></p>
              </div>
              <p className="pricing-card-description">25 Klausuren (genug für eine volle Klasse). Rechnen Sie kurz nach: 0,31 € pro Heft für ca. 4 Stunden gewonnene Lebenszeit.</p>
              <ul className="pricing-card-features">
                <li>Ganzen Stapel auf einmal korrigieren</li>
                <li>Editierbarer Word-Export für volle Kontrolle</li>
                <li>100% Zufriedenheitsgarantie</li>
              </ul>
              <p style={{ color: 'var(--color-gray-700)' }}>
                Dieses Angebot gilt exklusiv für unsere ersten Tester. Bei Nichtgefallen erhalten Sie Ihr Geld unkompliziert zurück.
              </p>
              <Link href="/upload" className="primary-button pricing-button">
                Klassensatz freischalten
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="module-section" id="faq">
        <div className="container">
          <h2 className="section-title">Häufige Fragen</h2>
          <p className="section-description">Klare Antworten zu Handschrift, Erwartungshorizont, Datenschutz und Garantie.</p>
          <div className="module-grid">
            <div className="module-card">
              <h3>Kann die KI auch unleserliche Handschriften ("Sauklaue") lesen?</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Ja, darauf ist KorrekturPilot spezialisiert. Die KI erkennt selbst schwierige Schriften und Randnotizen. Sollte ein Wort unklar sein, wird es im Word-Dokument markiert.
              </p>
            </div>
            <div className="module-card">
              <h3>Muss ich den Erwartungshorizont abtippen?</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Nein. Ein einfaches Foto oder PDF Ihrer Lösungsvorlage reicht. Die KI nutzt dies als Referenz für den Abgleich.
              </p>
            </div>
            <div className="module-card">
              <h3>Habe ich das letzte Wort bei der Note?</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Absolut. Sie erhalten ein editierbares Word-Dokument. Sie können Punkte anpassen und Kommentare ändern – Sie behalten die volle pädagogische Kontrolle.
              </p>
            </div>
            <div className="module-card">
              <h3>Was muss ich beim Datenschutz beachten?</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Für diesen Test: Bitte schwärzen Sie die Namen der Schüler vor dem Scan. Wir verarbeiten keine personenbezogenen Daten. Serverstandort ist Deutschland.
              </p>
            </div>
            <div className="module-card">
              <h3>Was passiert, wenn mir das Ergebnis nicht hilft?</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Dann greift unsere Zufriedenheitsgarantie: Kurze Mail an uns, und Sie erhalten Ihre 7,90 € sofort zurück.
              </p>
            </div>
            <div className="module-card">
              <h3>Brauche ich technische Vorkenntnisse?</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Nein. PDF vom Schulkopierer oder Handy-Scan hochladen, fertig. Es ist keine Installation nötig.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="module-section" id="social-proof">
        <div className="container">
          <h2 className="section-title">Helfen Sie uns, den perfekten Korrektur-Assistenten zu bauen.</h2>
          <p className="section-description">Wir sind in der Beta mit 20 Pionier:innen. Ihr Feedback fließt direkt ins nächste Update – und Sie sichern sich den Vorzugspreis.</p>
          <div className="module-grid">
            <div className="module-card">
              <h3>Ihr Vorteil als Tester</h3>
              <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6 }}>
                Ihre Wünsche werden gehört: Fehlt ein Feature? Passt das Format nicht? Ihr Feedback landet nicht im Papierkorb,
                sondern direkt auf unserer To-Do-Liste für das nächste Update.
              </p>
            </div>
            <div className="module-card">
              <h3>Warum jetzt?</h3>
              <ul style={{ lineHeight: 1.6, color: 'var(--color-gray-700)', paddingLeft: 'var(--spacing-lg)' }}>
                <li>Starten Sie für 7,90 € (statt später 29 €)</li>
                <li>Sichern Sie sich diesen Preis dauerhaft für künftige Pakete</li>
                <li>Gestalten Sie mit: ein Tool von Lehrkräften für Lehrkräfte</li>
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
