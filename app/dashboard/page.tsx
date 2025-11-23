import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

const summaryCards = [
  {
    label: 'Erwartungshorizonte',
    value: '5 aktiv',
    detail: 'für Deutsch und Chemie hinterlegt',
  },
  {
    label: 'Korrigierte Arbeiten',
    value: '42',
    detail: 'in diesem Monat abgeschlossen',
  },
  {
    label: 'Exportierte Berichte',
    value: '38',
    detail: 'PDF & Word',
  },
];

const recentCorrections = [
  { subject: 'Deutsch Q1', topic: 'Argumentation', date: '12. Mai', students: 24 },
  { subject: 'Chemie EF', topic: 'Redox-Reaktionen', date: '08. Mai', students: 21 },
  { subject: 'Geschichte EF', topic: 'Weimarer Republik', date: '02. Mai', students: 26 },
];

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <section className="page-section">
        <div className="container">
          <div className="page-intro">
            <h1 className="page-intro-title">Mein Bereich</h1>
            <p className="page-intro-text">
              Überwachen Sie Ihre Korrekturen, halten Sie Ihr Abonnement aktuell und wechseln Sie
              direkt in den Upload- oder Ergebnisbereich.
            </p>
          </div>

          <div className="dashboard-stats-grid">
            {summaryCards.map((card) => (
              <div key={card.label} className="dashboard-stat-card">
                <p className="dashboard-stat-label">{card.label}</p>
                <p className="dashboard-stat-value">{card.value}</p>
                <p className="dashboard-stat-trend">{card.detail}</p>
              </div>
            ))}
          </div>

          <div className="account-grid">
            <div className="account-card">
              <p className="account-card-title">Abonnement</p>
              <div className="beta-status">
                <span className="beta-dot" />
                <div>
                  <p className="beta-status-title">Monatsabo aktiv</p>
                  <p className="beta-status-description">Verlängert sich am 01. Juni automatisch.</p>
                </div>
              </div>
              <p className="account-info-label">Lizenzumfang</p>
              <p className="account-info-value">Unbegrenzte Korrekturen &amp; Exporte</p>
              <div className="cta-actions">
                <Link href="/checkout" className="secondary-button">
                  <span>Plan ändern</span>
                </Link>
                <Link href="/correction" className="primary-button">
                  <span>Neue Korrektur</span>
                </Link>
              </div>
            </div>

            <div className="account-card">
              <p className="account-card-title">Unterstützung</p>
              <div className="beta-status beta-status-warning">
                <span className="beta-dot" />
                <div>
                  <p className="beta-status-title">Persönliche Betreuung</p>
                  <p className="beta-status-description">
                    Wir helfen beim Upload, bei der Bewertung und bei Exportfragen.
                  </p>
                </div>
              </div>
              <p className="account-info-label">Kontakt</p>
              <ul className="checklist checklist-compact">
                <li>Leitfaden zur Digitalisierung anfordern</li>
                <li>Gemeinsame Review-Sitzung buchen</li>
                <li>Support: kontakt@korrekturpilot.de</li>
              </ul>
            </div>
          </div>

          <div className="dashboard-section-card">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">Letzte Korrekturen</h2>
              <Link href="/results" className="text-link">
                Zu den Ergebnissen
              </Link>
            </div>
            <div className="dashboard-table">
              {recentCorrections.map((item) => (
                <div key={item.subject} className="dashboard-table-row">
                  <div>
                    <p className="dashboard-table-title">{item.subject}</p>
                    <p className="dashboard-table-subtitle">
                      Thema: {item.topic} · {item.date}
                    </p>
                  </div>
                  <span className="dashboard-table-chip">{item.students} Arbeiten</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
