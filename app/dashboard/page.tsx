import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getDashboardStats } from '@/lib/dashboard';
import { getSubscriptionStatus } from '@/lib/subscription';
import DashboardCreditsCard from '@/components/DashboardCreditsCard';
import WelcomeBanner from '@/components/WelcomeBanner';
import CheckoutSessionHandler from '@/components/CheckoutSessionHandler';

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const subscription = await getSubscriptionStatus();

  const summaryCards = [
    {
      label: 'Gesamt korrigierte Arbeiten',
      value: `${stats.completedCorrections}`,
      detail: stats.completedCorrections === 1 ? 'Arbeit' : 'Arbeiten',
    },
    {
      label: 'Laufende Analysen',
      value: `${stats.runningAnalyses}`,
      detail: stats.runningAnalyses === 1 ? 'wird analysiert' : 'werden analysiert',
    },
  ];


  return (
    <ProtectedRoute>
      <CheckoutSessionHandler />
      <WelcomeBanner />
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
            <DashboardCreditsCard />
          </div>

          <div style={{ marginTop: 'var(--spacing-2xl)', textAlign: 'center' }}>
            <Link href="/correction" className="primary-button" style={{ fontSize: '1.125rem', padding: 'var(--spacing-md) var(--spacing-xl)', display: 'inline-block' }}>
              <span>Neue Korrektur starten</span>
            </Link>
          </div>

          <div className="account-grid" style={{ marginTop: 'var(--spacing-2xl)' }}>
            <div className="account-card">
              <p className="account-card-title">Abonnement</p>
              <div className={`beta-status ${subscription.hasActiveSubscription ? '' : 'beta-status-warning'}`}>
                <span className="beta-dot" />
                <div>
                  <p className="beta-status-title">
                    {subscription.hasActiveSubscription ? 'Aktiv' : 'Kein aktives Abonnement'}
                  </p>
                      <p className="beta-status-description">
                    {subscription.lastPayment
                      ? (() => {
                          const date = subscription.lastPayment.date;
                          const day = date.getDate().toString().padStart(2, '0');
                          const month = (date.getMonth() + 1).toString().padStart(2, '0');
                          const year = date.getFullYear().toString().slice(-2);
                          return `Sie haben am ${day}.${month}.${year} eine Zahlung von ${subscription.lastPayment.amount.toFixed(2)}€ für ${subscription.lastPayment.klausuren} Klausuren getätigt.`;
                        })()
                      : 'Sie haben bisher nichts gekauft.'}
                  </p>
                </div>
              </div>
              <div className="cta-actions" style={{ marginTop: 'var(--spacing-lg)' }}>
                <Link href="/checkout" className="secondary-button">
                  <span>{subscription.hasActiveSubscription ? 'Plan ändern' : 'Abonnement wählen'}</span>
                </Link>
              </div>
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
