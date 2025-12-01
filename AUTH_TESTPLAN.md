# Testplan: AuthProvider & Session-Management

## Übersicht
Dieser Testplan deckt die kritischen Auth-Flows ab: Login, Token-Expiry und Logout.

---

## 1. Login-Flow

### Test 1.1: Google OAuth Login
**Schritte:**
1. Öffne die App (nicht eingeloggt)
2. Klicke auf "Anmelden" → "Google Login"
3. Führe Google-Authentifizierung durch
4. Warte auf Redirect zurück zur App

**Erwartetes Verhalten:**
- ✅ `AuthProvider` erkennt die neue Session
- ✅ `CreditsDisplay` zeigt Credits an (wenn vorhanden)
- ✅ `AuthButton` zeigt "Dashboard" und "Logout" an
- ✅ Keine Fehler in der Browser-Konsole
- ✅ Session wird in Cookies gespeichert

**Prüfungen:**
```javascript
// In Browser DevTools Console:
// Prüfe Session
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session?.user?.email);

// Prüfe Credits (sollte DB-Abfrage durchführen)
// CreditsDisplay sollte Credits anzeigen
```

---

## 2. Token-Expiry & Auto-Refresh

### Test 2.1: Token-Expiry während aktiver Session
**Schritte:**
1. Logge dich ein
2. Warte, bis der Access Token abläuft (Standard: 1 Stunde)
3. Führe eine Aktion aus, die DB-Zugriff benötigt (z.B. Credits anzeigen)

**Erwartetes Verhalten:**
- ✅ Supabase SDK refresht automatisch den Token
- ✅ `onAuthStateChange` wird mit `TOKEN_REFRESHED` Event getriggert
- ✅ `AuthProvider` aktualisiert die Session
- ✅ DB-Abfragen funktionieren weiterhin ohne Fehler
- ✅ User bleibt eingeloggt

**Prüfungen:**
```javascript
// Manuell Token-Expiry simulieren (in DevTools):
// 1. Hole aktuellen Token
const { data } = await supabase.auth.getSession();
const oldToken = data.session?.access_token;

// 2. Warte auf Auto-Refresh (oder triggere manuell)
await supabase.auth.refreshSession();

// 3. Prüfe, ob neuer Token vorhanden
const { data: newData } = await supabase.auth.getSession();
console.log('Token refreshed:', newData.session?.access_token !== oldToken);
```

### Test 2.2: Session-Refresh nach Page Reload
**Schritte:**
1. Logge dich ein
2. Lade die Seite neu (F5)
3. Prüfe, ob Session erhalten bleibt

**Erwartetes Verhalten:**
- ✅ `AuthProvider` lädt Session aus Cookies beim Mount
- ✅ `loading` ist initial `true`, dann `false`
- ✅ User bleibt eingeloggt nach Reload
- ✅ Credits werden korrekt angezeigt

---

## 3. Logout-Flow

### Test 3.1: Manueller Logout
**Schritte:**
1. Logge dich ein
2. Klicke auf "Logout" im `AuthButton`
3. Warte auf Redirect

**Erwartetes Verhalten:**
- ✅ `AuthProvider.signOut()` wird aufgerufen
- ✅ Session wird gelöscht (`session = null`, `user = null`)
- ✅ `CreditsDisplay` verschwindet (keine DB-Abfrage mehr)
- ✅ `AuthButton` zeigt wieder "Anmelden"
- ✅ Cookies werden gelöscht
- ✅ Redirect zur Startseite (falls implementiert)

**Prüfungen:**
```javascript
// Nach Logout prüfen:
const { data } = await supabase.auth.getSession();
console.log('Session nach Logout:', data.session); // sollte null sein

// Prüfe, ob DB-Zugriffe blockiert werden
// CreditsDisplay sollte nichts anzeigen
```

### Test 3.2: Logout während aktiver DB-Abfrage
**Schritte:**
1. Logge dich ein
2. Öffne `CreditsDisplay` (triggert DB-Abfrage)
3. Klicke sofort auf "Logout" (während DB-Abfrage läuft)

**Erwartetes Verhalten:**
- ✅ `CreditsDisplay` erkennt Session-Verlust
- ✅ DB-Abfrage wird abgebrochen oder ignoriert
- ✅ Keine Fehler in der Konsole
- ✅ Komponente rendert `null` (nicht störend)

---

## 4. Edge Cases

### Test 4.1: Mehrere Tabs gleichzeitig
**Schritte:**
1. Öffne App in Tab 1, logge dich ein
2. Öffne App in Tab 2 (gleiche Domain)
3. Logge dich in Tab 1 aus
4. Prüfe Tab 2

**Erwartetes Verhalten:**
- ✅ `onAuthStateChange` wird in beiden Tabs getriggert
- ✅ Tab 2 erkennt automatisch den Logout
- ✅ Beide Tabs zeigen "Anmelden" an

### Test 4.2: Ungültige/Manipulierte Session
**Schritte:**
1. Logge dich ein
2. Manipuliere Session-Cookie (in DevTools)
3. Versuche DB-Zugriff (z.B. Credits anzeigen)

**Erwartetes Verhalten:**
- ✅ Supabase SDK erkennt ungültige Session
- ✅ `getSession()` gibt `null` zurück
- ✅ `AuthProvider` setzt `session = null`
- ✅ DB-Abfragen werden nicht ausgeführt
- ✅ Keine Fehler, die die App crashen

### Test 4.3: Netzwerk-Fehler während Auth
**Schritte:**
1. Logge dich ein
2. Deaktiviere Netzwerk (DevTools → Network → Offline)
3. Versuche Credits anzuzeigen
4. Aktiviere Netzwerk wieder

**Erwartetes Verhalten:**
- ✅ Fehler wird abgefangen (try-catch)
- ✅ `errorMsg` wird gesetzt (falls implementiert)
- ✅ App crasht nicht
- ✅ Nach Netzwerk-Wiederherstellung funktioniert alles wieder

---

## 5. Integrationstests

### Test 5.1: CreditsDisplay mit AuthProvider
**Schritte:**
1. Starte App ohne Login
2. Prüfe `CreditsDisplay`
3. Logge dich ein
4. Prüfe `CreditsDisplay` erneut

**Erwartetes Verhalten:**
- ✅ Ohne Login: `CreditsDisplay` zeigt nichts (`credits === null`)
- ✅ Nach Login: `CreditsDisplay` zeigt Credits an
- ✅ Keine doppelten DB-Abfragen
- ✅ `authLoading` wird korrekt berücksichtigt

### Test 5.2: Protected Routes
**Schritte:**
1. Versuche auf `/dashboard` zuzugreifen (ohne Login)
2. Logge dich ein
3. Versuche erneut auf `/dashboard` zuzugreifen

**Erwartetes Verhalten:**
- ✅ Ohne Login: Redirect zur Startseite (falls `ProtectedRoute` aktiviert)
- ✅ Nach Login: Zugriff erlaubt

---

## 6. Performance & UX

### Test 6.1: Initial Load Performance
**Schritte:**
1. Öffne App (nicht eingeloggt)
2. Prüfe Ladezeit bis `AuthProvider` fertig ist

**Erwartetes Verhalten:**
- ✅ `AuthProvider` initialisiert schnell (< 500ms)
- ✅ Keine unnötigen DB-Abfragen ohne Session
- ✅ `loading` State wird korrekt verwaltet

### Test 6.2: Auth State Changes
**Schritte:**
1. Logge dich ein
2. Beobachte Re-Renders in React DevTools

**Erwartetes Verhalten:**
- ✅ Nur notwendige Komponenten re-rendern
- ✅ Keine Render-Loops
- ✅ `useAuth` Hook triggert Updates nur bei echten Änderungen

---

## Checkliste für Production

- [ ] Alle Tests 1.1 - 6.2 erfolgreich
- [ ] Keine Console-Errors in Production-Build
- [ ] RLS (Row Level Security) in Supabase aktiviert
- [ ] Session-Cookies sind `httpOnly` und `secure` (wird von Supabase SDK verwaltet)
- [ ] Token-Refresh funktioniert automatisch
- [ ] Logout funktioniert zuverlässig
- [ ] Keine Memory Leaks (Listener werden korrekt unsubscribed)

---

## Debugging-Tipps

### Session prüfen:
```javascript
// In Browser Console
const { data } = await supabase.auth.getSession();
console.log('Session:', data.session);
console.log('User:', data.session?.user);
console.log('Token expires:', new Date(data.session?.expires_at * 1000));
```

### Auth State Changes loggen:
```javascript
// Temporär in AuthProvider.tsx hinzufügen:
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  console.log('Session:', session?.user?.email);
});
```

### DB-Zugriffe ohne Session prüfen:
```javascript
// Prüfe, ob RLS aktiviert ist:
// In Supabase Dashboard → Authentication → Policies
// Sollte: "Enable RLS" aktiviert sein
// Sollte: Policy für `users` Tabelle: "SELECT für authenticated users only"
```

