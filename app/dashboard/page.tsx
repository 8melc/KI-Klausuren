import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getDashboardStats } from '@/lib/dashboard';
import { getSubscriptionStatus } from '@/lib/subscription';

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const subscription = await getSubscriptionStatus();

  const summaryCards = [
    {
      label: 'Erwartungshorizonte',
      value: `${stats.activeExpectationHorizons} aktiv`,
      detail: stats.activeExpectationHorizons > 0 ? 'hinterlegt' : 'noch keine hinterlegt',
    },
    {
      label: 'Korrigierte Arbeiten',
      value: `${stats.completedCorrections}`,
      detail: 'in diesem Monat abgeschlossen',
    },
    {
      label: 'Exportierte Berichte',
      value: `${stats.exportedReports}`,
      detail: 'PDF & Word',
    },
  ];

  const subscriptionTypeLabel = subscription.subscriptionType === 'monthly' 
    ? 'Monatsabo' 
    : subscription.subscriptionType === 'yearly'
    ? 'Jahresabo'
    : subscription.subscriptionType === 'one-time'
    ? 'Einzellauf'
    : 'Kein Abonnement';

  const subscriptionExpiry = subscription.expiresAt 
    ? subscription.expiresAt.toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })
    : null;

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
              <div className={`beta-status ${subscription.hasActiveSubscription ? '' : 'beta-status-warning'}`}>
                <span className="beta-dot" />
                <div>
                  <p className="beta-status-title">
                    {subscription.hasActiveSubscription ? `${subscriptionTypeLabel} aktiv` : 'Kein aktives Abonnement'}
                  </p>
                  <p className="beta-status-description">
                    {subscription.hasActiveSubscription && subscriptionExpiry
                      ? `Verlängert sich am ${subscriptionExpiry} automatisch.`
                      : subscription.hasActiveSubscription
                      ? 'Aktiv'
                      : 'Bitte ein Abonnement abschließen.'}
                  </p>
                </div>
              </div>
              <p className="account-info-label">Lizenzumfang</p>
              <p className="account-info-value">
                {subscription.hasActiveSubscription 
                  ? subscription.subscriptionType === 'one-time'
                    ? 'Einzellauf (30 Tage gültig)'
                    : 'Unbegrenzte Korrekturen &amp; Exporte'
                  : 'Kein Zugriff'}
              </p>
              <div className="cta-actions">
                <Link href="/checkout" className="secondary-button">
                  <span>{subscription.hasActiveSubscription ? 'Plan ändern' : 'Abonnement wählen'}</span>
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
              {stats.recentCorrections.length > 0 ? (
                stats.recentCorrections.map((item) => (
                  <div key={item.id} className="dashboard-table-row">
                    <div>
                      <p className="dashboard-table-title">{item.subject}</p>
                      <p className="dashboard-table-subtitle">
                        Thema: {item.topic} · {item.date}
                      </p>
                    </div>
                    <span className="dashboard-table-chip">{item.students} Arbeiten</span>
                  </div>
                ))
              ) : (
                <div className="dashboard-table-row">
                  <div>
                    <p className="dashboard-table-title">Noch keine Korrekturen</p>
                    <p className="dashboard-table-subtitle">Starte deine erste Korrektur im Upload-Bereich.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  );
}
