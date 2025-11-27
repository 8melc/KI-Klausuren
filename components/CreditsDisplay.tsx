'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CreditsDisplay() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchCredits() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCredits(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (error) {
        // Wenn Tabelle noch nicht existiert, ignoriere Fehler
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          setCredits(null);
          setLoading(false);
          return;
        }
        console.error('Error fetching credits:', error);
        setCredits(null);
        setLoading(false);
        return;
      }

      setCredits(data?.credits || 0);
      setLoading(false);
    }

    fetchCredits();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCredits();
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (loading) {
    return (
      <div className="px-4 py-2 text-sm text-gray-600">
        Lädt...
      </div>
    );
  }

  if (credits === null) {
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

