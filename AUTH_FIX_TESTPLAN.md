# Testplan: Supabase-Authentifizierung Fix

## ✅ Was wurde gefixt

1. **Supabase-Client** (`lib/supabase/client.ts`)
   - Singleton-Pattern entfernt
   - Einfache Funktion mit korrekter Auth-Konfiguration
   - `autoRefreshToken`, `persistSession`, `detectSessionInUrl` aktiviert

2. **AuthButton.tsx**
   - Google OAuth Redirect-URL korrigiert: `window.location.origin` statt `location.origin`
   - Redirect zu `/auth/callback`

3. **AuthForm.tsx**
   - Email-Login leitet nach erfolgreichem Login zu `/dashboard` weiter
   - Signup leitet zu `/dashboard?welcome=true` weiter (wenn Session vorhanden)

4. **Callback-Route** (`app/auth/callback/page.tsx`)
   - Neue Client-Component erstellt
   - Verarbeitet OAuth-Code und tauscht gegen Session
   - Leitet nach erfolgreicher Auth zu `/dashboard` weiter
   - Zeigt Fehler an, falls Auth fehlschlägt

5. **AuthProvider.tsx**
   - Client wird jetzt innerhalb der Komponente erstellt (nicht global)
   - Bessere Kompatibilität mit Session-Management

---

## 🧪 Testplan

### Test 1: Google OAuth Login

**Schritte:**
1. Öffne die App (nicht eingeloggt)
2. Klicke auf "Anmelden" → "Google Login"
3. Führe Google-Authentifizierung durch
4. Warte auf Redirect zu `/auth/callback`

**Erwartetes Verhalten:**
- ✅ Redirect zu Google OAuth-Seite
- ✅ Nach Bestätigung: Redirect zu `/auth/callback?code=...`
- ✅ Callback-Route verarbeitet Code und tauscht gegen Session
- ✅ Session wird im LocalStorage gespeichert (Key: `sb-<project-ref>-auth-token`)
- ✅ Automatische Weiterleitung zu `/dashboard`
- ✅ `AuthProvider` erkennt Session
- ✅ `CreditsDisplay` zeigt Credits an (wenn vorhanden)

**Prüfungen:**
```javascript
// In Browser DevTools Console nach Login:
localStorage.getItem('sb-<project-ref>-auth-token') // sollte existieren
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session?.user?.email); // sollte Email zeigen
```

---

### Test 2: Email/Password Login

**Schritte:**
1. Öffne die App (nicht eingeloggt)
2. Klicke auf "Anmelden" → "Email Login"
3. Gib gültige Email/Password ein
4. Klicke auf "Einloggen"

**Erwartetes Verhalten:**
- ✅ Login-Request wird ausgeführt
- ✅ Session wird im LocalStorage gespeichert
- ✅ Automatische Weiterleitung zu `/dashboard`
- ✅ `AuthProvider` erkennt Session
- ✅ Keine Fehler in der Konsole

**Prüfungen:**
```javascript
// Nach Login prüfen:
localStorage.getItem('sb-<project-ref>-auth-token') // sollte existieren
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session?.user?.email); // sollte Email zeigen
```

---

### Test 3: Email/Password Signup

**Schritte:**
1. Öffne die App (nicht eingeloggt)
2. Klicke auf "Anmelden" → "Registrieren"
3. Gib neue Email/Password ein
4. Klicke auf "Registrieren"

**Erwartetes Verhalten (abhängig von Supabase-Einstellungen):**

**Fall A: E-Mail-Bestätigung deaktiviert**
- ✅ User wird direkt eingeloggt
- ✅ Session wird gespeichert
- ✅ Weiterleitung zu `/dashboard?welcome=true`

**Fall B: E-Mail-Bestätigung aktiviert**
- ✅ Alert: "Bitte E-Mail bestätigen!"
- ✅ User erhält Bestätigungs-E-Mail
- ✅ Nach Klick auf Bestätigungs-Link: Redirect zu `/auth/callback`
- ✅ Session wird erstellt
- ✅ Weiterleitung zu `/dashboard`

---

### Test 4: Session-Persistenz

**Schritte:**
1. Logge dich ein (Google oder Email)
2. Prüfe LocalStorage (DevTools → Application → Local Storage)
3. Lade die Seite neu (F5)
4. Prüfe, ob Session erhalten bleibt

**Erwartetes Verhalten:**
- ✅ Session-Token ist im LocalStorage (`sb-<project-ref>-auth-token`)
- ✅ Nach Reload: User bleibt eingeloggt
- ✅ `AuthProvider` lädt Session automatisch
- ✅ `CreditsDisplay` zeigt weiterhin Credits an

**Prüfungen:**
```javascript
// Vor Reload:
const { data: before } = await supabase.auth.getSession();
console.log('Session vor Reload:', before.session?.user?.email);

// Nach Reload (in neuer Console):
const { data: after } = await supabase.auth.getSession();
console.log('Session nach Reload:', after.session?.user?.email); // sollte gleich sein
```

---

### Test 5: Token Auto-Refresh

**Schritte:**
1. Logge dich ein
2. Warte, bis Access Token abläuft (Standard: 1 Stunde)
3. Führe eine Aktion aus, die DB-Zugriff benötigt (z.B. Credits anzeigen)

**Erwartetes Verhalten:**
- ✅ Supabase SDK refresht automatisch den Token
- ✅ `onAuthStateChange` wird mit `TOKEN_REFRESHED` Event getriggert
- ✅ `AuthProvider` aktualisiert Session
- ✅ DB-Abfragen funktionieren weiterhin ohne Fehler
- ✅ User bleibt eingeloggt

**Prüfungen:**
```javascript
// Manuell Token-Refresh testen:
await supabase.auth.refreshSession();
const { data } = await supabase.auth.getSession();
console.log('Token refreshed:', data.session?.access_token); // sollte neuer Token sein
```

---

### Test 6: Logout

**Schritte:**
1. Logge dich ein
2. Klicke auf "Logout"
3. Prüfe LocalStorage
4. Prüfe, ob Redirect funktioniert

**Erwartetes Verhalten:**
- ✅ Session wird gelöscht
- ✅ LocalStorage-Token wird entfernt
- ✅ `AuthProvider` setzt `session = null`, `user = null`
- ✅ `CreditsDisplay` verschwindet (keine DB-Abfrage mehr)
- ✅ `AuthButton` zeigt wieder "Anmelden"
- ✅ Redirect zur Startseite

**Prüfungen:**
```javascript
// Nach Logout:
localStorage.getItem('sb-<project-ref>-auth-token') // sollte null sein
const { data } = await supabase.auth.getSession();
console.log('Session nach Logout:', data.session); // sollte null sein
```

---

### Test 7: Callback-Route Fehlerbehandlung

**Schritte:**
1. Öffne direkt: `/auth/callback` (ohne Code-Parameter)
2. Prüfe, ob Fehler angezeigt wird

**Erwartetes Verhalten:**
- ✅ Fehlermeldung: "Kein Auth-Code gefunden"
- ✅ Automatische Weiterleitung zur Startseite nach 3 Sekunden
- ✅ Keine Crashes

---

### Test 8: Mehrere Tabs

**Schritte:**
1. Öffne App in Tab 1, logge dich ein
2. Öffne App in Tab 2 (gleiche Domain)
3. Logge dich in Tab 1 aus
4. Prüfe Tab 2

**Erwartetes Verhalten:**
- ✅ `onAuthStateChange` wird in beiden Tabs getriggert
- ✅ Tab 2 erkennt automatisch den Logout
- ✅ Beide Tabs zeigen "Anmelden" an

---

## 🔍 Debugging-Checkliste

### Session prüfen:
```javascript
// In Browser Console
const { createClient } = await import('@/lib/supabase/client');
const supabase = createClient();
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);
console.log('User:', data.session?.user);
console.log('Token expires:', new Date(data.session?.expires_at * 1000));
```

### LocalStorage prüfen:
```javascript
// Alle Supabase-Keys anzeigen
Object.keys(localStorage).filter(key => key.startsWith('sb-'));
```

### Auth State Changes loggen:
```javascript
// Temporär in AuthProvider.tsx hinzufügen:
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  console.log('Session:', session?.user?.email);
});
```

---

## ⚠️ Wichtige Hinweise

### Supabase Dashboard Konfiguration

**URL Configuration** (Supabase Dashboard → Authentication → URL Configuration):
- ✅ `https://korrektur-pilot.vercel.app/auth/callback` (Production)
- ✅ `https://korrektur-pilot.vercel.app` (Production Site URL)
- ✅ `http://localhost:3000/auth/callback` (Development)
- ✅ `http://localhost:3000` (Development Site URL)

**Prüfe:**
- Redirect URLs sind korrekt eingetragen
- Site URL ist korrekt
- Google OAuth Provider ist konfiguriert (falls verwendet)

### Umgebungsvariablen

**Prüfe in Vercel/Environment:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` ist gesetzt
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` ist gesetzt

---

## ✅ Erfolgskriterien

- [ ] Google OAuth Login funktioniert
- [ ] Email/Password Login funktioniert
- [ ] Session wird im LocalStorage gespeichert
- [ ] Callback-Route funktioniert korrekt
- [ ] Redirect zu `/dashboard` funktioniert
- [ ] Session bleibt nach Reload erhalten
- [ ] Token Auto-Refresh funktioniert
- [ ] Logout funktioniert korrekt
- [ ] Keine Fehler in der Browser-Konsole
- [ ] Keine `auth-code-error` Redirects

---

## 🐛 Bekannte Probleme & Lösungen

### Problem: `POST /auth/v1/token?grant_type=password → 400`
**Lösung:** Prüfe, ob Email/Password korrekt sind. Prüfe Supabase Dashboard → Authentication → Email Templates.

### Problem: `auth-code-error#access_token=…`
**Lösung:** Callback-Route existiert jetzt als Client-Component. Prüfe, ob URL in Supabase Dashboard korrekt ist.

### Problem: Session wird nicht gespeichert
**Lösung:** Prüfe, ob `persistSession: true` im Client gesetzt ist. Prüfe Browser-Konsole auf CORS-Fehler.

### Problem: Redirect läuft ins Leere
**Lösung:** Prüfe, ob `/auth/callback` Route existiert. Prüfe Browser-Network-Tab auf Redirect-Status.

---

## 📝 Notizen

- Die Callback-Route ist jetzt eine Client-Component (`page.tsx`)
- Die Server-Route (`route.ts`) bleibt für andere Zwecke erhalten
- OAuth-Flows nutzen die Client-Component
- Email-Login nutzt direkt `signInWithPassword` (kein Callback nötig)

