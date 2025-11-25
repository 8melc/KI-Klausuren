import Link from 'next/link';

const heroCards = [
  {
    title: 'Prüfungsvorbereitung',
    description: 'Erwartungshorizont hochladen, Aufgaben strukturieren und Punkte vergeben.',
  },
  {
    title: 'Automatische Bewertung',
    description: 'Klausuren scannen, Text erkennen lassen und mit dem Raster abgleichen.',
  },
  {
    title: 'Transparente Ergebnisse',
    description: 'Feedback prüfen, Punkte korrigieren und exportfertige Dokumente erstellen.',
  },
];

const flowSteps = [
  {
    title: 'Vorbereiten',
    description: 'Erwartungshorizont oder Musterlösung als PDF bereitstellen und Aufgaben samt Punktezahl erfassen.',
  },
  {
    title: 'Klausuren digitalisieren',
    description: 'Jede Schülerarbeit als PDF hochladen. Dateinamen dienen als Zuordnung.',
  },
  {
    title: 'Bewerten & prüfen',
    description: 'Die KI verteilt Punkte pro Aufgabe. Lehrkräfte passen jede Aufgabe bei Bedarf manuell an.',
  },
  {
    title: 'Feedback teilen',
    description: 'Ergebnisse als PDF oder Word exportieren und Notenlisten für die Dokumentation herunterladen.',
  },
];

const modules = [
  {
    title: 'Upload & Struktur',
    body: 'Erwartungshorizont, Aufgabenstellung und Bewertungsraster werden einmalig hinterlegt. Das System nutzt diese Vorlage für alle folgenden Arbeiten.',
  },
  {
    title: 'Analyse',
    body: 'Texterkennung liest jede Arbeit, vergleicht Antworten mit dem Raster und schlägt Punkte inklusive Kommentaren vor.',
  },
  {
    title: 'Review durch Lehrkräfte',
    body: 'Alle Punkte und Hinweise lassen sich mit einem Klick anpassen. Änderungen aktualisieren automatisch die Gesamtnote.',
  },
  {
    title: 'Export & Kommunikation',
    body: 'Für jedes Kind steht ein strukturierter Bericht bereit. Zusätzlich entsteht eine Gesamtübersicht für die Notenverwaltung.',
  },
];

const pricingPlans = [
  {
    title: 'Einzellauf',
    price: '9 €',
    interval: 'pro Klausur',
    description: 'Ideal für einzelne Arbeiten oder Nachprüfungen.',
    features: [
      '1 vollständige Korrektur',
      'PDF-Export für Lehrkraft und Schüler',
      'Texterkennung inklusive',
    ],
  },
  {
    title: 'Monatsabo',
    price: '29 €',
    interval: 'pro Monat',
    description: 'Für Fachschaften, die regelmäßig korrigieren.',
    features: [
      'Unbegrenzte Korrekturen',
      'Alle Exportformate',
      'Priorisierter Support',
    ],
    highlighted: true,
  },
  {
    title: 'Jahresabo',
    price: '299 €',
    interval: 'pro Jahr',
    description: 'Planbare Kosten für Schulen mit hoher Auslastung.',
    features: [
      'Unbegrenzte Korrekturen',
      'Nutzung für mehrere Kurse',
      'Bevorzugte Feature-Wünsche',
    ],
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Klausuren digital prüfen – verständlich und nachvollziehbar</h1>
            <p className="hero-subtitle">
              KorrekturPilot verbindet Erwartungshorizont, automatische Bewertung und klare
              Feedback-Berichte. Lehrkräfte behalten in jedem Schritt die Kontrolle und sparen
              gleichzeitig wertvolle Zeit.
            </p>

          <div className="hero-cta-group">
              <Link href="/correction" className="primary-button">
                <span>Korrektur starten</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/dashboard" className="secondary-button">
                <span>Anmelden</span>
              </Link>
              <Link href="/results" className="text-link">
                Beispiel ansehen →
              </Link>
            </div>

            <div className="feature-grid">
              {heroCards.map((card) => (
                <div key={card.title} className="feature-card">
                  <p className="feature-card-title">{card.title}</p>
                  <p className="feature-card-text">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="ablauf">
        <div className="container">
          <h2 className="section-title">So läuft eine Korrektur ab</h2>
          <p className="section-description">
            Der Ablauf orientiert sich am Alltag im Lehrerzimmer: zuerst Struktur festlegen, danach
            Arbeiten hochladen, anschließend Ergebnisse prüfen und exportieren.
          </p>
          <div className="process-grid">
            {flowSteps.map((step) => (
              <div key={step.title} className="process-card">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="module-section">
        <div className="container">
          <h2 className="section-title">Module im Überblick</h2>
          <div className="module-grid">
            {modules.map((module) => (
              <div key={module.title} className="module-card">
                <h3>{module.title}</h3>
                <p>{module.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pricing-section" id="preise">
        <div className="container">
          <div className="pricing-header">
            <h2 className="section-title">Lizenz wählen</h2>
            <p className="section-description">
              Alle Pläne enthalten Upload, Analyse, Review und Export. Die Abrechnung erfolgt über
              Stripe, damit Schulen jederzeit verlängern oder pausieren können.
            </p>
          </div>
          <div className="pricing-grid">
            {pricingPlans.map((plan) => (
              <div
                key={plan.title}
                className={`pricing-card ${plan.highlighted ? 'pricing-card-highlighted' : ''}`}
              >
                {plan.highlighted && <p className="pricing-badge">Empfohlen</p>}
                <div className="pricing-card-header">
                  <h3>{plan.title}</h3>
                  <p className="pricing-card-price">
                    {plan.price} <span>/ {plan.interval}</span>
                  </p>
                </div>
                <p className="pricing-card-description">{plan.description}</p>
                <ul className="pricing-card-features">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link href="/checkout" className="primary-button pricing-button">
                  <span>Lizenz buchen</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div>
              <p className="cta-badge">Service für Lehrkräfte</p>
              <h2>Persönliche Begleitung von Upload bis Export</h2>
              <p>
                Wir unterstützen bei der Einrichtung, prüfen gemeinsam einen ersten Klassensatz und
                beantworten alle Rückfragen zum Bewertungsraster. Schreiben Sie uns, wenn Sie eine
                Einführung für Ihr Kollegium wünschen.
              </p>
            </div>
            <div className="cta-actions">
              <Link href="/correction" className="primary-button">
                <span>Korrektur starten</span>
              </Link>
              <Link href="mailto:kontakt@korrekturpilot.de" className="secondary-button">
                <span>Kontakt aufnehmen</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
