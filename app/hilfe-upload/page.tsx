import Link from 'next/link';

export default function HilfeUploadPage() {
  return (
    <section className="page-section">
      <div className="container">
        <div className="page-intro">
          <h1 className="page-intro-title">Upload-Anleitung: Klausuren richtig vorbereiten</h1>
          <p className="page-intro-text">
            Schritt-für-Schritt-Anleitung für das Scannen und Hochladen deiner Klausuren
          </p>
        </div>

        <div className="module-card" style={{ marginTop: 'var(--spacing-xl)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Übersicht</h2>
          <p style={{ marginBottom: 'var(--spacing-md)' }}>
            Du hast einen Stapel Klausuren korrigiert bekommen und möchtest sie mit KorrekturPilot auswerten lassen? Diese Anleitung zeigt dir Schritt für Schritt, wie du die Klausuren richtig scannst und hochlädst.
          </p>
        </div>

        <div className="module-card" style={{ marginTop: 'var(--spacing-lg)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Schritt 1: Klausuren vorbereiten</h2>
          
          <h3 style={{ marginBottom: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>Wichtig: Jede Klausur muss einzeln als PDF gespeichert werden</h3>
          
          <h4 style={{ marginBottom: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>Warum einzelne Dateien?</h4>
          <ul style={{ marginBottom: 'var(--spacing-md)', paddingLeft: 'var(--spacing-xl)' }}>
            <li>Das System analysiert jede Klausur einzeln</li>
            <li>Du kannst die Ergebnisse später individuell abrufen</li>
            <li>Fehlerhafte Scans betreffen nur eine Klausur, nicht den ganzen Stapel</li>
          </ul>

          <h4 style={{ marginBottom: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>Datenschutz beachten</h4>
          <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', backgroundColor: 'var(--color-info-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-info)' }}>
            <p style={{ marginBottom: 'var(--spacing-xs)' }}>
              <strong>Empfohlen:</strong> Schwärze oder überklebe Schülernamen vor dem Scannen (z.B. mit Post-its)
            </p>
            <p>
              <strong>Alternativ:</strong> Nutze neutrale Dateinamen ohne Personenbezug (siehe unten)
            </p>
          </div>
        </div>

        <div className="module-card" style={{ marginTop: 'var(--spacing-lg)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Schritt 2: Klausuren scannen</h2>
          
          <h3 style={{ marginBottom: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>Option A: Schulkopierer</h3>
          <ol style={{ marginBottom: 'var(--spacing-md)', paddingLeft: 'var(--spacing-xl)' }}>
            <li>Lege die erste Klausur auf den Scanner</li>
            <li>Wähle „Scan to Email" oder „Scan to USB"</li>
            <li>Stelle ein: <strong>Farbig oder Graustufen, 300 DPI, PDF-Format</strong></li>
            <li>Scanne alle Seiten der Klausur</li>
            <li>Speichere die Datei mit einem eindeutigen Namen (siehe unten)</li>
            <li>Wiederhole für jede Klausur</li>
          </ol>

          <h3 style={{ marginBottom: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>Option B: Smartphone-App</h3>
          <p style={{ marginBottom: 'var(--spacing-sm)' }}><strong>Empfohlene Apps:</strong></p>
          <ul style={{ marginBottom: 'var(--spacing-md)', paddingLeft: 'var(--spacing-xl)' }}>
            <li><a href="https://www.adobe.com/de/acrobat/mobile/scanner-app.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Adobe Scan</a> (iOS + Android, kostenlos)</li>
            <li><a href="https://www.google.com/drive/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Google Drive</a> (iOS + Android, integrierter Scanner)</li>
            <li>iOS Notizen-App (nur iPhone/iPad, integrierter Scanner)</li>
          </ul>
          
          <p style={{ marginBottom: 'var(--spacing-sm)' }}><strong>So geht's:</strong></p>
          <ol style={{ marginBottom: 'var(--spacing-md)', paddingLeft: 'var(--spacing-xl)' }}>
            <li>Öffne die Scan-App</li>
            <li>Fotografiere alle Seiten der Klausur nacheinander</li>
            <li>Die App erstellt automatisch ein PDF</li>
            <li>Speichere das PDF mit einem eindeutigen Namen</li>
            <li>Wiederhole für jede Klausur</li>
          </ol>
        </div>

        <div className="module-card" style={{ marginTop: 'var(--spacing-lg)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Schritt 3: Dateien benennen (Datenschutz!)</h2>
          
          <h3 style={{ marginBottom: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>Richtige Dateinamen (datenschutzkonform):</h3>
          <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', backgroundColor: 'var(--color-success-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-success)' }}>
            <ul style={{ marginBottom: 0, paddingLeft: 'var(--spacing-xl)' }}>
              <li><strong>Nummerierung:</strong> <code>Klausur_01.pdf</code>, <code>Klausur_02.pdf</code>, <code>Klausur_03.pdf</code> ...</li>
              <li><strong>Mit Fach:</strong> <code>Bio_Test_A.pdf</code>, <code>Bio_Test_B.pdf</code>, <code>Bio_Test_C.pdf</code> ...</li>
              <li><strong>Mit Klasse:</strong> <code>Geo_9a_Nr01.pdf</code>, <code>Geo_9a_Nr02.pdf</code>, <code>Geo_9a_Nr03.pdf</code> ...</li>
              <li><strong>Mit Datum:</strong> <code>Geschichte_2024-12-10_Nr1.pdf</code>, <code>Geschichte_2024-12-10_Nr2.pdf</code> ...</li>
            </ul>
          </div>

          <h3 style={{ marginBottom: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>Falsche Dateinamen (Datenschutz-Verstoß!):</h3>
          <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', backgroundColor: 'var(--color-error-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-error)' }}>
            <ul style={{ marginBottom: 0, paddingLeft: 'var(--spacing-xl)' }}>
              <li><code>Max_Mustermann.pdf</code> (Personenbezug!)</li>
              <li><code>Anna_Schmidt_Mathe.pdf</code> (Name erkennbar!)</li>
              <li><code>Klasse9a_Max.pdf</code> (Name + Klasse = identifizierbar!)</li>
            </ul>
          </div>

          <h4 style={{ marginBottom: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>Tipp: Zuordnung intern notieren</h4>
          <p style={{ marginBottom: 'var(--spacing-md)' }}>
            Wenn du später wissen musst, welche Nummer zu welchem Schüler gehört:
          </p>
          <ul style={{ marginBottom: 'var(--spacing-md)', paddingLeft: 'var(--spacing-xl)' }}>
            <li>Notiere die Zuordnung auf einem separaten Zettel oder in Excel</li>
            <li>Z.B.: „Klausur_01 = Max M., Klausur_02 = Anna S." (nicht im Dateinamen!)</li>
          </ul>
        </div>

        <div className="module-card" style={{ marginTop: 'var(--spacing-lg)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Schritt 4: Dateien hochladen</h2>
          <ol style={{ marginBottom: 'var(--spacing-md)', paddingLeft: 'var(--spacing-xl)' }}>
            <li>Gehe zu KorrekturPilot → „Korrektur starten"</li>
            <li>Wähle deinen Erwartungshorizont aus (bereits hochgeladen)</li>
            <li>Klicke auf „Klausuren hochladen"</li>
            <li>Wähle alle PDF-Dateien gleichzeitig aus (bis zu 30 Stück)</li>
            <li>Klicke „Öffnen" → Der Upload startet automatisch</li>
          </ol>
          <p style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-md)', backgroundColor: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)' }}>
            <strong>Hinweis:</strong> Du kannst bis zu 30 Klausuren gleichzeitig hochladen. Bei größeren Klassensätzen einfach in zwei Durchgängen hochladen.
          </p>
        </div>

        <div className="module-card" style={{ marginTop: 'var(--spacing-lg)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Häufige Fehler vermeiden</h2>
          
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--color-error)' }}>
              <strong>Fehler:</strong> Alle Klausuren in einer PDF-Datei gespeichert
            </p>
            <p style={{ marginBottom: 'var(--spacing-md)', paddingLeft: 'var(--spacing-lg)' }}>
              <strong>Lösung:</strong> Jede Klausur als separate Datei speichern
            </p>
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--color-error)' }}>
              <strong>Fehler:</strong> Schülernamen im Dateinamen
            </p>
            <p style={{ marginBottom: 'var(--spacing-md)', paddingLeft: 'var(--spacing-lg)' }}>
              <strong>Lösung:</strong> Neutrale Nummerierung verwenden
            </p>
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--color-error)' }}>
              <strong>Fehler:</strong> Fotos statt PDF hochgeladen
            </p>
            <p style={{ marginBottom: 'var(--spacing-md)', paddingLeft: 'var(--spacing-lg)' }}>
              <strong>Lösung:</strong> Immer als PDF speichern (Scan-Apps machen das automatisch)
            </p>
          </div>

          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <p style={{ marginBottom: 'var(--spacing-xs)', color: 'var(--color-error)' }}>
              <strong>Fehler:</strong> Zu niedrige Scan-Qualität (unleserlich)
            </p>
            <p style={{ marginBottom: 'var(--spacing-md)', paddingLeft: 'var(--spacing-lg)' }}>
              <strong>Lösung:</strong> Mindestens 300 DPI, Graustufen oder Farbe (nicht Schwarz-Weiß)
            </p>
          </div>
        </div>

        <div className="module-card" style={{ marginTop: 'var(--spacing-lg)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Noch Fragen?</h2>
          <p style={{ marginBottom: 'var(--spacing-md)' }}>
            Schreib uns an <a href="mailto:kontakt@korrekturpilot.de" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>kontakt@korrekturpilot.de</a> – wir helfen dir gerne weiter!
          </p>
        </div>

        <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center', display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="secondary-button">
            Zurück zur Startseite
          </Link>
          <Link href="/auth" className="primary-button">
            Jetzt kostenlos testen
          </Link>
        </div>
      </div>
    </section>
  );
}
