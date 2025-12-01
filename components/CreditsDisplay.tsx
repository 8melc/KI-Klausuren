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
      <div className="px-4 py-2 text-sm text-gray-600">
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
    <div className="flex items-center gap-4">
      {hasCredits ? (
        <div className="flex items-center gap-2">
          {isFreeKlausur ? (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <p className="text-sm text-green-800 font-medium">
                🎁 Du hast <span className="font-bold">{credits} kostenlose Test-Klausur</span> verfügbar!
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <p className="text-sm text-blue-800 font-medium">
                📊 <span className="font-bold">{credits} Klausuren</span> verfügbar
              </p>
            </div>
          )}
          {credits < 5 && (
            <Link
              href="/checkout"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium underline"
            >
              Mehr kaufen
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ Keine Credits mehr
          </p>
          <Link
            href="/checkout"
            className="text-sm text-yellow-800 hover:text-yellow-900 font-bold underline mt-1 block"
          >
            Jetzt 25 Klausuren für €7.90 kaufen →
          </Link>
        </div>
      )}
    </div>
  );
}

