import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DashboardCreditsCard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single();

  // Wenn Tabelle nicht existiert oder Fehler, zeige 0
  const credits = error ? 0 : (data?.credits || 0);
  const hasCredits = credits > 0;
  const isFreeKlausur = credits === 1;

  return (
    <div className="dashboard-stat-card">
      <p className="dashboard-stat-label">Verfügbare Klausuren</p>
      <p className="dashboard-stat-value">{credits}</p>
      <div className="dashboard-stat-trend" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {hasCredits ? (
          isFreeKlausur ? (
            <>
              <span style={{ color: 'var(--color-success-dark)', fontWeight: '500' }}>🎁 Kostenlose Test-Klausur</span>
              {credits < 5 && (
                <Link 
                  href="/checkout" 
                  style={{ 
                    color: 'var(--color-primary)', 
                    fontSize: '0.875rem', 
                    textDecoration: 'underline',
                    marginTop: '0.25rem'
                  }}
                >
                  Mehr kaufen →
                </Link>
              )}
            </>
          ) : (
            <>
              <span style={{ color: 'var(--color-primary)', fontWeight: '500' }}>Klausuren verfügbar</span>
              {credits < 5 && (
                <Link 
                  href="/checkout" 
                  style={{ 
                    color: 'var(--color-primary)', 
                    fontSize: '0.875rem', 
                    textDecoration: 'underline',
                    marginTop: '0.25rem'
                  }}
                >
                  Mehr kaufen →
                </Link>
              )}
            </>
          )
        ) : (
          <>
            <span style={{ color: 'var(--color-warning)', fontWeight: '500' }}>Keine Credits</span>
            <Link 
              href="/checkout" 
              style={{ 
                color: 'var(--color-warning)', 
                fontSize: '0.875rem', 
                fontWeight: 'bold',
                textDecoration: 'underline',
                marginTop: '0.25rem'
              }}
            >
              25 Klausuren für €7.90 kaufen →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

