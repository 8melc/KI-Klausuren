# Supabase-Einstellungen für Profil-Bearbeitung

Damit die Profil-Bearbeitung (Name, Passwort, E-Mail) funktioniert, musst du folgende Einstellungen in Supabase vornehmen:

## 1. E-Mail-Bestätigung für E-Mail-Änderungen aktivieren

Wenn ein Benutzer seine E-Mail-Adresse ändert, sendet Supabase automatisch eine Bestätigungs-E-Mail an die neue Adresse. Diese Funktion muss aktiviert sein:

### Schritte:

1. Öffne dein [Supabase Dashboard](https://app.supabase.com)
2. Gehe zu **Authentication → Settings**
3. Scrolle zu **Email Auth**
4. Stelle sicher, dass **"Enable email confirmations"** aktiviert ist
5. **Wichtig:** Unter **"Email change confirmations"** sollte ebenfalls aktiviert sein (Standard: aktiviert)

## 2. Redirect-URLs für E-Mail-Bestätigungen konfigurieren

Wenn ein Benutzer auf den Bestätigungslink in der E-Mail klickt, muss Supabase wissen, wohin er weiterleiten soll:

### Schritte:

1. Im Supabase Dashboard: **Authentication → URL Configuration**
2. Füge deine Redirect-URLs hinzu:

   **Für Development:**
   ```
   http://localhost:3000/auth/callback
   ```

   **Für Production:**
   ```
   https://ihre-domain.com/auth/callback
   ```

3. **Site URL** sollte ebenfalls gesetzt sein:
   - Development: `http://localhost:3000`
   - Production: `https://ihre-domain.com`

## 3. E-Mail-Vorlagen anpassen (Optional, aber empfohlen)

Du kannst die E-Mail-Vorlagen für Bestätigungs-E-Mails anpassen:

### Schritte:

1. Im Supabase Dashboard: **Authentication → Email Templates**
2. Wähle **"Change Email Address"** aus
3. Passe die Vorlage nach Bedarf an
4. Die Standard-Vorlage funktioniert auch, wenn du nichts ändern möchtest

## 4. Passwort-Änderung (Keine zusätzlichen Einstellungen nötig)

Die Passwort-Änderung funktioniert standardmäßig ohne zusätzliche Konfiguration. Supabase validiert automatisch:
- Mindestlänge (6 Zeichen, kann in Auth Settings angepasst werden)
- Passwort-Stärke

### Optional: Passwort-Anforderungen anpassen

1. Im Supabase Dashboard: **Authentication → Settings**
2. Scrolle zu **Password**
3. Du kannst hier anpassen:
   - **Minimum password length** (Standard: 6)
   - **Password requirements** (Großbuchstaben, Zahlen, etc.)

## 5. Testen der Funktionalität

Nach der Konfiguration solltest du testen:

### Passwort-Änderung:
1. Gehe zu `/profil`
2. Klicke auf "🔑 Passwort ändern"
3. Gib aktuelles und neues Passwort ein
4. Sollte sofort funktionieren

### E-Mail-Änderung:
1. Gehe zu `/profil`
2. Klicke auf "✉️ E-Mail-Adresse ändern"
3. Gib neue E-Mail und aktuelles Passwort ein
4. Prüfe das Postfach der neuen E-Mail-Adresse
5. Klicke auf den Bestätigungslink in der E-Mail
6. Die E-Mail-Adresse wird nach Bestätigung aktualisiert

## Wichtige Hinweise

⚠️ **E-Mail-Bestätigung ist erforderlich:**
- Wenn ein Benutzer seine E-Mail ändert, kann er sich erst mit der neuen E-Mail anmelden, nachdem er den Bestätigungslink geklickt hat
- Die alte E-Mail-Adresse funktioniert weiterhin, bis die neue bestätigt wurde

⚠️ **Redirect-URLs:**
- Stelle sicher, dass deine Redirect-URLs korrekt konfiguriert sind
- In Production muss die URL mit `https://` beginnen

⚠️ **E-Mail-Service:**
- Supabase verwendet standardmäßig einen eigenen E-Mail-Service
- Für Production empfiehlt es sich, einen eigenen E-Mail-Service (z.B. SendGrid, AWS SES) zu konfigurieren
- Das kannst du unter **Project Settings → Auth → SMTP Settings** einrichten

## Troubleshooting

**Problem: E-Mail-Bestätigung wird nicht gesendet**
- Prüfe, ob "Enable email confirmations" aktiviert ist
- Prüfe die E-Mail-Vorlagen in Supabase
- Prüfe die Logs unter **Logs → Auth Logs**

**Problem: Redirect funktioniert nicht**
- Prüfe, ob die Redirect-URLs korrekt konfiguriert sind
- Stelle sicher, dass die Site URL gesetzt ist

**Problem: Passwort-Änderung schlägt fehl**
- Prüfe, ob das neue Passwort mindestens 6 Zeichen lang ist
- Prüfe die Auth Logs in Supabase für detaillierte Fehlermeldungen






