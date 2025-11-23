import Link from 'next/link';

export default function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div>
            <p className="footer-logo">KorrekturPilot</p>
            <p className="footer-copy">&copy; {currentYear} KorrekturPilot</p>
          </div>
          <div className="footer-links">
            <a href="mailto:kontakt@korrekturpilot.de">kontakt@korrekturpilot.de</a>
            <Link href="/checkout">Preise &amp; Lizenzen</Link>
            <Link href="/results">Beispielauswertung</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
