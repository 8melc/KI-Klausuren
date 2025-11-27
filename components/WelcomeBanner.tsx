'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function WelcomeBanner() {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Prüfe ob User gerade registriert wurde (via URL-Parameter)
    const isNewUser = searchParams.get('welcome') === 'true';
    if (isNewUser) {
      setShow(true);
      // Entferne URL-Parameter nach Anzeige
      router.replace('/dashboard', { scroll: false });
    }
  }, [searchParams, router]);

  const handleClose = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div 
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4"
      style={{
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">🎁</div>
              <h3 className="text-xl font-bold text-green-900">
                Willkommen bei KorrekturPilot!
              </h3>
            </div>
            <p className="text-green-800 mb-3">
              Du hast <strong>1 kostenlose Test-Klausur</strong> erhalten. 
              Teste jetzt deine erste Klausur kostenlos!
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/correction"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                onClick={handleClose}
              >
                Jetzt testen →
              </Link>
              <button
                onClick={handleClose}
                className="text-green-700 hover:text-green-900 font-medium underline"
              >
                Später
              </button>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-green-600 hover:text-green-800 transition-colors flex-shrink-0"
            aria-label="Schließen"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

