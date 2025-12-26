# Supabase Auth Redirect URL Checkliste

## 🔍 Problem: 500-Fehler vom Supabase Auth-Endpoint

### Verwendete Redirect-URLs im Code:

**Production (`https://www.korrekturpilot.de`):**
- `https://www.korrekturpilot.de/auth/callback`
- `https://www.korrekturpilot.de/auth/callback?next=/dashboard`
- `https://www.korrekturpilot.de/auth/callback?next=/reset-password`

**Development (lokal):**
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/callback?next=/dashboard`
- `http://localhost:3000/auth/callback?next=/reset-password`

---

## ✅ Supabase Dashboard → Authentication → URL Configuration

### Site URL:
```
https://www.korrekturpilot.de
```
(Dies ist die Basis-URL deiner Anwendung)

### Redirect URLs (müssen ALLE eingetragen sein):
```
https://www.korrekturpilot.de/auth/callback
http://localhost:3000/auth/callback
```

**WICHTIG:** 
- Supabase prüft die **exakte Übereinstimmung** der Basis-URL
- Query-Parameter (`?next=...`) werden ignoriert, nur der Pfad `/auth/callback` muss passen
- Beide URLs (Production + Development) sollten eingetragen sein

---

## ✅ Environment Variables prüfen

### In `.env.local` oder Vercel Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ujhrntnvihtceidsnasi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<dein-aktueller-anon-key>
```

**Prüfe:**
1. `NEXT_PUBLIC_SUPABASE_URL` muss **exakt** deine Supabase-Project-URL sein
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` muss der **Anon/Public Key** sein (nicht der Service Role Key!)

---

## 🔍 Supabase Logs prüfen

1. Gehe zu: **Supabase Dashboard → Authentication → Logs**
2. Suche nach dem Fehler mit Timestamp des 500-Fehlers
3. Schaue nach:
   - `x-sb-error-code: unexpected_failure`
   - Mögliche Fehlermeldungen:
     - "redirect url not allowed"
     - "Database error"
     - "Invalid redirect URL"

---

## 🛠️ Quick Fix Steps

### 1. Redirect URLs hinzufügen:

1. Öffne **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Unter **Redirect URLs** füge hinzu:
   ```
   https://www.korrekturpilot.de/auth/callback
   http://localhost:3000/auth/callback
   ```
3. **Site URL** sollte sein:
   ```
   https://www.korrekturpilot.de
   ```
4. **Speichern**

### 2. Environment Variables prüfen:

1. In Vercel: **Settings** → **Environment Variables**
2. Prüfe ob `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` gesetzt sind
3. Stelle sicher, dass sie zur richtigen Umgebung gehören (Production)

### 3. Nach Änderung testen:

1. Deployment neu starten (falls nötig)
2. Teste Signup/Login erneut
3. Prüfe Browser-Console für Fehlermeldungen

---

## 📝 Code-Referenzen

**Verwendete Redirect-URLs im Code:**
- `components/AuthForm.tsx:59` - Email Signup
- `components/AuthForm.tsx:33` - Password Reset
- `components/AuthButton.tsx:78` - Google OAuth
- `app/auth/AuthPageClient.tsx:17` - Google OAuth (Auth-Seite)

**Alle verwenden:** `${window.location.origin}/auth/callback`

---

## ⚠️ Häufige Fehlerquellen

1. **Trailing Slash:** 
   - ❌ Falsch: `https://www.korrekturpilot.de/auth/callback/`
   - ✅ Richtig: `https://www.korrekturpilot.de/auth/callback`

2. **Protocol-Mismatch:**
   - ❌ `http://www.korrekturpilot.de/auth/callback` (in Production)
   - ✅ `https://www.korrekturpilot.de/auth/callback`

3. **Subdomain:**
   - Wenn deine Production-URL `www.korrekturpilot.de` ist, muss genau diese in Supabase stehen
   - Nicht `korrekturpilot.de` (ohne www)

4. **Falscher Key:**
   - Verwendest du den **Service Role Key** statt dem **Anon Key**? Das kann zu 500-Fehlern führen!

---

## 🔗 Weitere Ressourcen

- [Supabase Auth Redirect URLs Documentation](https://supabase.com/docs/guides/auth/auth-redirect-urls)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)







