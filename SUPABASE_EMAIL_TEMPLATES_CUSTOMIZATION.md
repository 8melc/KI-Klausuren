# Supabase E-Mail-Templates Anpassung

## 📧 Custom E-Mail-Templates für Supabase Auth

Die langen Token-Links in Supabase-Auth-E-Mails können im **Supabase Dashboard** angepasst werden, um professioneller auszusehen.

---

## 🔧 Konfiguration

### Wo zu finden:
**Supabase Dashboard → Authentication → Email Templates**

Verfügbare Templates:
- **Confirm Signup** (Registrierungsbestätigung)
- **Reset Password** (Passwort zurücksetzen)
- **Magic Link** (falls verwendet)
- **Change Email Address** (falls verwendet)

---

## 📝 Verfügbare Variablen

In den E-Mail-Templates kannst du folgende Variablen verwenden:

- `{{ .ConfirmationURL }}` - Der vollständige Bestätigungs-Link mit Token
- `{{ .Token }}` - Nur der Token (falls du den Link selbst bauen möchtest)
- `{{ .SiteURL }}` - Die Site URL (z.B. `https://www.korrekturpilot.de`)
- `{{ .Email }}` - Die E-Mail-Adresse des Benutzers
- `{{ .RedirectTo }}` - Die Redirect-URL nach Bestätigung

---

## 🎨 Best Practice: Styled Button + Fallback-Link

**Problem:** Die Standard-Links sind sehr lang und technisch.

**Lösung:** Verwende einen styled Button mit dem Link, und zeige den vollen Link nur als Fallback.

### Beispiel für "Reset Password" Template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    
    <h1 style="color: #1a56db; margin-bottom: 20px;">Passwort zurücksetzen</h1>
    
    <p style="margin-bottom: 20px;">
      Du hast angefragt, dein Passwort für KorrekturPilot zurückzusetzen.
    </p>
    
    <p style="margin-bottom: 30px;">
      Klicke auf den Button unten, um ein neues Passwort festzulegen:
    </p>
    
    <!-- Styled Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="display: inline-block; padding: 14px 28px; background-color: #1a56db; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Passwort zurücksetzen
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>
      <code style="word-break: break-all; font-size: 12px; color: #1a56db;">{{ .ConfirmationURL }}</code>
    </p>
    
    <p style="font-size: 12px; color: #999; margin-top: 20px;">
      Dieser Link ist 24 Stunden gültig. Wenn du diese E-Mail nicht angefordert hast, kannst du sie ignorieren.
    </p>
    
  </div>
  
  <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
    © KorrekturPilot | <a href="https://www.korrekturpilot.de/datenschutz" style="color: #1a56db;">Datenschutz</a>
  </p>
  
</body>
</html>
```

---

## 📋 Beispiel für "Confirm Signup" Template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    
    <h1 style="color: #1a56db; margin-bottom: 20px;">Willkommen bei KorrekturPilot!</h1>
    
    <p style="margin-bottom: 20px;">
      Vielen Dank für deine Registrierung bei KorrekturPilot.
    </p>
    
    <p style="margin-bottom: 30px;">
      Bitte bestätige deine E-Mail-Adresse, indem du auf den Button unten klickst:
    </p>
    
    <!-- Styled Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="display: inline-block; padding: 14px 28px; background-color: #1a56db; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        E-Mail bestätigen
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br>
      <code style="word-break: break-all; font-size: 12px; color: #1a56db;">{{ .ConfirmationURL }}</code>
    </p>
    
    <p style="font-size: 12px; color: #999; margin-top: 20px;">
      Nach der Bestätigung wirst du automatisch zu deinem Dashboard weitergeleitet.
    </p>
    
  </div>
  
  <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
    © KorrekturPilot | <a href="https://www.korrekturpilot.de/datenschutz" style="color: #1a56db;">Datenschutz</a>
  </p>
  
</body>
</html>
```

---

## ✅ Wichtige Punkte

1. **Token-Länge kann nicht gekürzt werden** - Aus Sicherheitsgründen müssen die Tokens lang bleiben
2. **Visuell verstecken** - Zeige den vollen Link nur als Fallback (klein, in `<code>`)
3. **Styled Button als Hauptelement** - Professionelleres Aussehen
4. **Fallback-Link für Kompatibilität** - Nicht alle E-Mail-Clients unterstützen styled Buttons gleich gut

---

## 🔗 Weitere Ressourcen

- [Supabase Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Email Template Variables](https://supabase.com/docs/guides/auth/auth-email-templates#template-variables)

---

**Zuletzt aktualisiert:** Basierend auf Best Practices für Supabase E-Mail-Templates







