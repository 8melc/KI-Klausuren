'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthProvider';

const supabase = createClient();

export default function CreditsDisplay() {
  const { user, session, loading: authLoading } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadCredits() {
      setLoading(true);
      setErrorMsg(null);

      // Warte auf Auth-Initialisierung
      if (authLoading) return;

      // Keine Session oder kein User -> keine DB-Abfrage
      if (!session || !user?.id) {
        if (mounted) {
          setCredits(null);
          setLoading(false);
        }
        return;
      }

      try {
        // Sichere DB-Abfrage (nur wenn Session vorhanden)
        const { data, error } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single();

        if (!mounted) return;

        if (error) {
          // Wenn Tabelle noch nicht existiert, ignoriere Fehler
          if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
            console.warn('Users table does not exist or user not found:', error);
            setCredits(null);
          } else {
            console.error('Credits fetch error:', error);
            console.error('Error details:', { code: error.code, message: error.message, user: user.id });
            setErrorMsg('Fehler beim Laden der Credits.');
            setCredits(null);
          }
        } else {
          console.log('Credits loaded successfully:', data?.credits);
          setCredits(data?.credits ?? 0);
        }
        setLoading(false);
      } catch (err) {
        console.error('Unexpected error loading credits:', err);
        if (mounted) {
          setErrorMsg('Unerwarteter Fehler.');
          setCredits(null);
          setLoading(false);
        }
      }
    }

    loadCredits();

    return () => {
      mounted = false;
    };
  }, [authLoading, session, user?.id]);

  if (loading || authLoading) {
    return (
      <div style={{ padding: 'var(--spacing-xs) var(--spacing-md)', fontSize: '0.875rem', color: 'var(--color-gray-600)' }}>
        Lädt...
      </div>
    );
  }

  // Wenn keine Session oder Fehler, zeige nichts (nicht störend)
  if (credits === null || errorMsg) {
    return null;
  }

  const hasCredits = credits > 0;
  const isFreeKlausur = credits === 1;

  return (
    <div className="header-credits">
      {hasCredits ? (
        <>
          <div className={`header-credits__pill ${isFreeKlausur ? 'header-credits__pill-success' : 'header-credits__pill-info'}`}>
            <span className="header-credits__emoji" aria-hidden="true">
              {isFreeKlausur ? '🎁' : '📊'}
            </span>
            <span className="header-credits__text">
              {isFreeKlausur ? (
                <>
                  Du hast <strong>{credits} kostenlose Test-Klausur</strong> verfügbar
                </>
              ) : (
                <>
                  <strong>{credits} Klausuren</strong> verfügbar
                </>
              )}
            </span>
          </div>
          {credits < 5 && (
            <Link href="/checkout" className="header-credits__link">
              Mehr kaufen
            </Link>
          )}
        </>
      ) : (
        <div className="header-credits__pill header-credits__pill-warning">
          <span className="header-credits__emoji" aria-hidden="true">⚠️</span>
          <span className="header-credits__text">
            Keine Credits mehr
            <Link href="/checkout" className="header-credits__link header-credits__link-inline">
              Jetzt 25 Klausuren für €7.90 kaufen →
            </Link>
          </span>
        </div>
      )}
    </div>
  );
}
