'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState<{
    necessary: boolean;
    statistics: boolean;
    marketing: boolean;
  } | null>(null);

  useEffect(() => {
    // Prüfe, ob Cookie-Präferenzen bereits gespeichert sind
    const savedPreferences = localStorage.getItem('cookiePreferences');
    if (savedPreferences) {
      setCookiePreferences(JSON.parse(savedPreferences));
    } else {
      // Zeige Banner nur, wenn noch keine Präferenzen gespeichert sind
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences = {
      necessary: true,
      statistics: true,
      marketing: true,
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setCookiePreferences(preferences);
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    const preferences = {
      necessary: true,
      statistics: false,
      marketing: false,
    };
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
    setCookiePreferences(preferences);
    setIsVisible(false);
  };

  const handleCustomSettings = () => {
    // Erweitere Banner für individuelle Einstellungen
    // Für Beta-Phase: Einfache Lösung mit "Alle akzeptieren" und "Nur notwendige"
    // Kann später erweitert werden
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-label="Cookie-Einstellungen"
      aria-modal="true"
    >
      <div className="cookie-banner-content">
        <div className="cookie-banner-text">
          <h3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: '1.125rem', fontWeight: '600' }}>
            Cookie-Einstellungen
          </h3>
          <p style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
            Wir verwenden Cookies, um die Funktionalität unserer Website zu gewährleisten. 
            Technisch notwendige Cookies werden automatisch gesetzt. Für weitere Cookies (z.B. Analytics) 
            benötigen wir deine Einwilligung.
          </p>
          <p style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.875rem' }}>
            <Link href="/datenschutz" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
              Mehr Informationen in der Datenschutzerklärung
            </Link>
          </p>
        </div>
        <div className="cookie-banner-actions">
          <button
            onClick={handleAcceptNecessary}
            className="secondary-button"
            style={{ marginRight: 'var(--spacing-sm)' }}
          >
            Nur notwendige
          </button>
          <button
            onClick={handleAcceptAll}
            className="primary-button"
          >
            Alle akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}






