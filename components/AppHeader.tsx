'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthButton from './AuthButton';
import CreditsDisplay from './CreditsDisplay';

const NAV_LINKS = [
  { href: '/correction', label: 'Korrektur' },
  { href: '/results', label: 'Ergebnisse' },
];

const isActivePath = (pathname: string, href: string) => {
  if (href.includes('#')) {
    return pathname === '/';
  }
  if (href === '/') {
    return pathname === '/';
  }
  return pathname.startsWith(href);
};

export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link href="/" className="logo" aria-label="Zur Startseite">
            <svg
              className="logo-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="logo-text">KorrekturPilot</span>
          </Link>

          <nav className="nav" aria-label="Hauptnavigation">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link ${
                  isActivePath(pathname, href) ? 'active' : ''
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <CreditsDisplay />
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}
