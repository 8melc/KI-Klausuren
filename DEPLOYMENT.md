# Deployment-Checkliste für Vercel

Diese Checkliste hilft Ihnen, die Anwendung erfolgreich auf Vercel zu deployen.

## ✅ Vor dem Deployment

### 1. Umgebungsvariablen in Vercel konfigurieren

Gehen Sie zu **Vercel Dashboard → Ihr Projekt → Settings → Environment Variables** und fügen Sie hinzu:

```
OPENAI_API_KEY=your-openai-api-key-here
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. ⚠️ Auth-Schutz aktivieren (KRITISCH!)

**WICHTIG**: Der Auth-Schutz ist während der Entwicklung deaktiviert. Sie MÜSSEN ihn vor dem Production-Deployment aktivieren!

#### Schritt 1: `components/ProtectedRoute.tsx`

Ändern Sie Zeile 8:
```typescript
// VORHER (Development):
const AUTH_ENABLED = false

// NACHHER (Production):
const AUTH_ENABLED = true
```

#### Schritt 2: `lib/auth.ts`

Ändern Sie Zeile 4:
```typescript
// VORHER (Development):
export const AUTH_ENABLED = false

// NACHHER (Production):
export const AUTH_ENABLED = true
```

### 3. Google OAuth Redirect URI für Production

In der **Google Cloud Console** müssen Sie die Production-URL als Redirect URI hinzufügen:

1. Gehen Sie zu [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Öffnen Sie Ihre OAuth 2.0 Client ID
3. Fügen Sie unter **Authorized redirect URIs** hinzu:
   ```
   https://ihre-domain.vercel.app/auth/callback
   ```
   (Ersetzen Sie `ihre-domain.vercel.app` mit Ihrer tatsächlichen Vercel-Domain)

### 4. Supabase Redirect URLs konfigurieren

Im **Supabase Dashboard**:

1. Gehen Sie zu **Authentication → URL Configuration**
2. Fügen Sie unter **Redirect URLs** hinzu:
   ```
   https://ihre-domain.vercel.app/auth/callback
   ```
   (Ersetzen Sie `ihre-domain.vercel.app` mit Ihrer tatsächlichen Vercel-Domain)

## 🚀 Deployment-Schritte

1. **Code committen und pushen**:
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Vercel Deployment**:
   - Vercel deployt automatisch bei jedem Push
   - Oder manuell: Vercel Dashboard → Deployments → Redeploy

3. **Nach dem Deployment prüfen**:
   - ✅ Startseite ist öffentlich zugänglich
   - ✅ `/expectation`, `/upload`, `/results` erfordern Login
   - ✅ Google OAuth funktioniert
   - ✅ API-Routen sind geschützt

## 🔍 Troubleshooting

### Problem: "Unauthorized" Fehler nach Login
- Prüfen Sie, ob `AUTH_ENABLED = true` in beiden Dateien gesetzt ist
- Prüfen Sie die Redirect URLs in Supabase und Google Cloud Console

### Problem: Google OAuth funktioniert nicht
- Prüfen Sie, ob die Production-URL in Google Cloud Console als Redirect URI eingetragen ist
- Prüfen Sie, ob die Production-URL in Supabase als Redirect URL eingetragen ist

### Problem: Umgebungsvariablen werden nicht geladen
- Prüfen Sie, ob alle Variablen in Vercel unter Environment Variables gesetzt sind
- Stellen Sie sicher, dass `NEXT_PUBLIC_*` Variablen für Production verfügbar sind
- Führen Sie einen neuen Deployment durch, nachdem Sie Variablen hinzugefügt haben

## 📝 Quick Reference

**Dateien, die vor Deployment geändert werden müssen:**

1. `components/ProtectedRoute.tsx` → `AUTH_ENABLED = true`
2. `lib/auth.ts` → `AUTH_ENABLED = true`

**Nach dem Deployment prüfen:**

- [ ] Auth-Schutz ist aktiviert
- [ ] Umgebungsvariablen sind gesetzt
- [ ] Google OAuth Redirect URIs sind konfiguriert
- [ ] Supabase Redirect URLs sind konfiguriert
- [ ] Login funktioniert
- [ ] Geschützte Seiten erfordern Login

