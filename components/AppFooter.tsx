export default function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {currentYear} KorrekturPilot. Alle Rechte vorbehalten.</p>
      </div>
    </footer>
  );
}
