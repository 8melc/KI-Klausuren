# Supabase E-Mail-Vorlage einrichten

Diese Anleitung zeigt dir, wie du die HTML-E-Mail-Vorlage für Passwort-Reset in Supabase einrichtest.

## 1. Supabase Dashboard öffnen

1. Gehe zu [Supabase Dashboard](https://app.supabase.com)
2. Wähle dein Projekt aus
3. Navigiere zu **Authentication → Email Templates**

## 2. E-Mail-Vorlage anpassen

1. Wähle **"Reset Password"** aus der Liste der E-Mail-Vorlagen
2. Aktiviere **"Custom email template"**
3. Kopiere den Inhalt aus `emails/password-reset.html`
4. **Wichtig:** Ersetze die Platzhalter:

### Platzhalter ersetzen

Die Vorlage verwendet Go-Template-Syntax (`{{ .ConfirmationURL }}`). Supabase verwendet jedoch andere Platzhalter:

**Ersetze:**
- `{{ .ConfirmationURL }}` → `{{ .ConfirmationURL }}` (bleibt gleich, Supabase unterstützt dies)

**Oder verwende die Supabase-Variante:**
- `{{ .ConfirmationURL }}` → `{{ .ConfirmationURL }}` oder `{{ .SiteURL }}/auth/confirm?token={{ .TokenHash }}&type=recovery`

## 3. Supabase-spezifische Version

Ich habe eine Version mit den korrekten Supabase-Platzhaltern erstellt: `emails/password-reset-supabase.html`

### Verfügbare Supabase-Variablen:

- `{{ .SiteURL }}` - Deine Site URL
- `{{ .ConfirmationURL }}` - Vollständiger Bestätigungslink
- `{{ .TokenHash }}` - Token Hash
- `{{ .Token }}` - Token
- `{{ .Email }}` - E-Mail-Adresse des Benutzers
- `{{ .RedirectTo }}` - Redirect-URL nach Bestätigung

## 4. E-Mail-Vorlage in Supabase einfügen

1. Öffne `emails/password-reset-supabase.html`
2. Kopiere den gesamten HTML-Inhalt
3. Füge ihn in das Supabase E-Mail-Template-Feld ein
4. Klicke auf **"Save"**

## 5. Testen

1. Gehe zu deiner Anwendung
2. Klicke auf "Passwort vergessen"
3. Gib eine E-Mail-Adresse ein
4. Prüfe dein Postfach
5. Die E-Mail sollte jetzt im neuen Design erscheinen

## 6. Weitere E-Mail-Vorlagen

Du kannst die gleiche Vorlage auch für andere E-Mails anpassen:

- **Magic Link** - Ähnliche Struktur, anderer Text
- **Email Change** - Gleiche Struktur, anderer Text
- **Email Confirmation** - Gleiche Struktur, anderer Text

## 7. Anpassungen

### Farben ändern:
- Primary Color: `#1e3a8a` (Zeile mit `background-color: #1e3a8a`)
- Primary Light: `#3b82f6` (Zeile mit `color: #3b82f6`)
- Primary Dark: `#1e40af` (Zeile mit `background: linear-gradient`)

### Text anpassen:
- Alle Texte sind in den `<p>` und `<h2>` Tags
- Ändere einfach den Text zwischen den Tags

### Logo ändern:
- Das Logo ist ein SVG-Icon (Zeile mit `<svg>`)
- Du kannst es durch ein Bild ersetzen:
  ```html
  <img src="https://ihre-domain.com/logo.png" alt="KorrekturPilot" style="width: 48px; height: 48px;">
  ```

## Troubleshooting

**Problem: E-Mail wird nicht im neuen Design angezeigt**
- Prüfe, ob "Custom email template" aktiviert ist
- Prüfe, ob die HTML-Syntax korrekt ist
- Prüfe die Supabase Logs unter **Logs → Auth Logs**

**Problem: Links funktionieren nicht**
- Stelle sicher, dass `{{ .ConfirmationURL }}` korrekt verwendet wird
- Prüfe, ob die Redirect-URLs in Supabase konfiguriert sind

**Problem: E-Mail sieht in Outlook/Gmail anders aus**
- E-Mail-Clients haben unterschiedliche CSS-Unterstützung
- Die Vorlage verwendet tabellenbasiertes Layout für maximale Kompatibilität
- Teste in verschiedenen E-Mail-Clients

## Hinweise

- Die Vorlage ist für maximale E-Mail-Client-Kompatibilität optimiert
- Inline CSS wird verwendet (nicht `<style>` Tags)
- Tabellenbasiertes Layout für bessere Darstellung
- Responsive Design für mobile Geräte
- Getestet mit: Gmail, Outlook, Apple Mail, Thunderbird






