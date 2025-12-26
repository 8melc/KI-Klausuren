# Auth-Code Analyse: redirectTo/emailRedirectTo für Custom SMTP

## ✅ Was funktioniert

1. **Google OAuth** (`components/AuthButton.tsx:75-80`)
   - ✅ `redirectTo` ist korrekt gesetzt: `${window.location.origin}/auth/callback`
   - ✅ Funktioniert mit Custom SMTP

2. **Auth Callback Route** (`app/auth/callback/route.ts`)
   - ✅ Verwendet `next` Parameter oder default `/dashboard`
   - ✅ Funktioniert korrekt für alle Auth-Flows

## ❌ Probleme gefunden

### 1. signUp - FEHLT emailRedirectTo

**Datei:** `components/AuthForm.tsx:25-28`

**Aktueller Code:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
});
```

**Problem:** Nach E-Mail-Bestätigung weiß Supabase nicht, wohin es weiterleiten soll.

**Fix erforderlich:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
  },
});
```

### 2. updateUser (E-Mail ändern) - FEHLT emailRedirectTo

**Datei:** `app/api/profile/change-email/route.ts:56-58`

**Aktueller Code:**
```typescript
const { data, error } = await supabase.auth.updateUser({
  email: newEmail,
});
```

**Problem:** Nach E-Mail-Bestätigung weiß Supabase nicht, wohin es weiterleiten soll.

**Fix erforderlich:**
```typescript
const { data, error } = await supabase.auth.updateUser({
  email: newEmail,
  options: {
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/profil`,
  },
});
```

### 3. resetPasswordForEmail - Nicht im Code gefunden

**Status:** Wird nicht direkt im Code verwendet (wird wahrscheinlich über Supabase API direkt aufgerufen, z.B. via curl).

**Wenn verwendet, muss `redirectTo` gesetzt werden:**
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/callback?next=/profil`,
});
```

### 4. inviteUserByEmail - Nicht implementiert

**Status:** Nicht im Code vorhanden.

**Wenn implementiert, muss `redirectTo` gesetzt werden:**
```typescript
const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
  redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/dashboard`,
});
```

## 🔧 Zusammenfassung

**Mit Custom SMTP und eigenen E-Mail-Templates funktioniert:**
- ✅ Google OAuth
- ✅ Auth Callback Route

**Muss angepasst werden:**
- ❌ signUp - `emailRedirectTo` hinzufügen
- ❌ updateUser (E-Mail ändern) - `emailRedirectTo` hinzufügen
- ⚠️ resetPasswordForEmail - Prüfen, ob verwendet wird
- ⚠️ inviteUserByEmail - Nicht implementiert (optional)

## 📝 Nächste Schritte

1. Fix für `signUp` in `components/AuthForm.tsx`
2. Fix für `updateUser` in `app/api/profile/change-email/route.ts`
3. Prüfen, ob `resetPasswordForEmail` verwendet wird
4. Optional: `inviteUserByEmail` implementieren

**Wichtig:** Nach den Fixes funktionieren alle Flows mit Custom SMTP ohne zusätzliche Mail-Logik im Code.






