# Vercel Deployment - Schritt-für-Schritt Anleitung

## 🚀 Schnellstart

### Option 1: Via Vercel Dashboard (Empfohlen)

1. **Gehe zu [vercel.com](https://vercel.com)** und logge dich ein
2. **Klicke auf "Add New Project"**
3. **Importiere dein GitHub Repository**
   - Wähle das Repository `klausur-mvp` aus
   - Klicke auf "Import"
4. **Konfiguriere das Projekt:**
   - Framework Preset: **Next.js** (sollte automatisch erkannt werden)
   - Root Directory: `./` (Standard)
   - Build Command: `npm run build` (Standard)
   - Output Directory: `.next` (Standard)
5. **Klicke auf "Deploy"**

### Option 2: Via Vercel CLI

```bash
# Vercel CLI installieren (falls nicht vorhanden)
npm i -g vercel

# Login
vercel login

# Deployment
vercel

# Für Production
vercel --prod
```

---

## ⚙️ Schritt 1: Code committen und pushen

Bevor du deployst, stelle sicher, dass alle Änderungen committed sind:

```bash
# Alle Änderungen hinzufügen
git add .

# Commit erstellen
git commit -m "Add Stripe integration and prepare for deployment"

# Zu GitHub pushen
git push origin main
```

---

## 🔑 Schritt 2: Umgebungsvariablen in Vercel setzen

**WICHTIG:** Diese müssen **vor** dem ersten Deployment gesetzt werden!

1. Gehe zu **Vercel Dashboard → Dein Projekt → Settings → Environment Variables**
2. Füge folgende Variablen hinzu:

### Erforderliche Variablen:

```env
# OpenAI
OPENAI_API_KEY=your-openai-api-key-here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe (Test-Modus für jetzt, später Live-Keys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME=price_...
```

### Optional (für Production):

```env
# Stripe Webhook
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Wichtig:**
- Für jede Variable: **Environment** = `Production`, `Preview`, `Development` (alle auswählen)
- `NEXT_PUBLIC_*` Variablen sind für Client und Server verfügbar
- Andere Variablen sind nur server-seitig verfügbar

---

## 🔒 Schritt 3: Auth-Schutz aktivieren (KRITISCH!)

**WICHTIG:** Der Auth-Schutz ist während der Entwicklung deaktiviert. Du MUSST ihn für Production aktivieren!

### Datei 1: `components/ProtectedRoute.tsx`

Ändere Zeile 8:
```typescript
// VORHER:
const AUTH_ENABLED = false

// NACHHER:
const AUTH_ENABLED = true
```

### Datei 2: `lib/auth.ts`

Ändere Zeile 4:
```typescript
// VORHER:
export const AUTH_ENABLED = false

// NACHHER:
export const AUTH_ENABLED = true
```

**Dann committen und pushen:**
```bash
git add components/ProtectedRoute.tsx lib/auth.ts
git commit -m "Enable auth protection for production"
git push origin main
```

---

## 🌐 Schritt 4: Nach dem ersten Deployment

Nach dem ersten Deployment erhältst du eine URL wie:
`https://klausur-mvp-xxxxx.vercel.app`

### 4.1 Google OAuth Redirect URI hinzufügen

1. Gehe zu [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Öffne deine OAuth 2.0 Client ID
3. Füge unter **Authorized redirect URIs** hinzu:
   ```
   https://deine-vercel-domain.vercel.app/auth/callback
   ```
4. Speichere

### 4.2 Supabase Redirect URLs konfigurieren

1. Gehe zu **Supabase Dashboard → Authentication → URL Configuration**
2. Füge unter **Redirect URLs** hinzu:
   ```
   https://deine-vercel-domain.vercel.app/auth/callback
   ```
3. Speichere

### 4.3 Stripe Webhook konfigurieren (optional)

1. Gehe zu [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Klicke auf **"Add endpoint"**
3. URL: `https://deine-vercel-domain.vercel.app/api/stripe/webhook`
4. Events auswählen:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Kopiere das **Webhook Secret**
6. Füge es in Vercel als `STRIPE_WEBHOOK_SECRET` hinzu

---

## ✅ Schritt 5: Deployment testen

Nach dem Deployment prüfe:

- [ ] Startseite ist erreichbar: `https://deine-domain.vercel.app`
- [ ] Checkout-Seite funktioniert: `https://deine-domain.vercel.app/checkout`
- [ ] Login funktioniert (Google OAuth)
- [ ] Geschützte Seiten erfordern Login
- [ ] Stripe Checkout funktioniert (Test-Zahlung)

---

## 🔄 Automatische Deployments

Vercel deployt automatisch bei jedem Push zu `main`:

1. Push zu GitHub
2. Vercel erkennt den Push
3. Automatisches Build und Deployment
4. Neue Version ist live

---

## 🐛 Troubleshooting

### Problem: Build schlägt fehl

**Lösung:**
- Prüfe die Build-Logs in Vercel Dashboard
- Prüfe, ob alle Dependencies in `package.json` sind
- Prüfe, ob TypeScript-Fehler vorhanden sind

### Problem: Umgebungsvariablen werden nicht geladen

**Lösung:**
- Prüfe, ob alle Variablen in Vercel gesetzt sind
- Prüfe, ob `NEXT_PUBLIC_*` Variablen für alle Environments gesetzt sind
- Führe ein neues Deployment durch nach dem Hinzufügen von Variablen

### Problem: "Unauthorized" Fehler

**Lösung:**
- Prüfe, ob `AUTH_ENABLED = true` gesetzt ist
- Prüfe die Redirect URLs in Supabase und Google Cloud Console
- Prüfe, ob die Production-URL korrekt konfiguriert ist

### Problem: Stripe funktioniert nicht

**Lösung:**
- Prüfe, ob Test-Keys für Development oder Live-Keys für Production verwendet werden
- Prüfe, ob die Price IDs korrekt sind
- Prüfe die Stripe Dashboard Logs

---

## 📋 Pre-Deployment Checkliste

- [ ] Alle Änderungen committed und gepusht
- [ ] `AUTH_ENABLED = true` in beiden Dateien gesetzt
- [ ] Umgebungsvariablen in Vercel gesetzt
- [ ] Supabase Datenbank-Tabellen erstellt (falls benötigt)
- [ ] Code getestet lokal
- [ ] Build funktioniert lokal: `npm run build`

---

## 📋 Post-Deployment Checkliste

- [ ] Deployment erfolgreich
- [ ] Startseite erreichbar
- [ ] Google OAuth Redirect URI konfiguriert
- [ ] Supabase Redirect URL konfiguriert
- [ ] Login funktioniert
- [ ] Geschützte Seiten erfordern Login
- [ ] Stripe Checkout funktioniert
- [ ] Stripe Webhook konfiguriert (falls verwendet)

---

## 🎯 Nächste Schritte

Nach erfolgreichem Deployment:

1. **Custom Domain hinzufügen** (optional):
   - Vercel Dashboard → Settings → Domains
   - Eigene Domain verbinden

2. **Monitoring einrichten**:
   - Vercel Analytics aktivieren
   - Error Tracking (z.B. Sentry)

3. **Performance optimieren**:
   - Vercel Speed Insights
   - Image Optimization prüfen

---

## 💡 Tipps

- **Test-Deployments:** Jeder Branch bekommt eine Preview-URL
- **Rollback:** Alte Deployments können in Vercel wieder aktiviert werden
- **Environment Variables:** Können pro Environment unterschiedlich sein
- **Build Logs:** Immer in Vercel Dashboard einsehbar












