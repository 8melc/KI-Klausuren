# Umgebungsvariablen für Vercel - Checkliste

## ✅ Welche Variablen in Vercel setzen?

### 🔴 ERFORDERLICH (Muss gesetzt werden):

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Stripe (wenn Zahlungen aktiviert)
STRIPE_SECRET_KEY=sk_test_... (für Test) oder sk_live_... (für Production)
NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME=price_...
```

### 🟡 OPTIONAL (Nur wenn verwendet):

```env
# Stripe Webhook (nur wenn Webhooks konfiguriert)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### ❌ NICHT in Vercel setzen:

- **Lokale Development-Keys** (wenn du separate Test-Keys hast)
- **Persönliche API-Keys** (die nur für lokale Entwicklung sind)
- **Veraltete oder nicht mehr verwendete Keys**

---

## 📋 Schritt-für-Schritt in Vercel

### 1. Gehe zu Vercel Dashboard

1. Öffne [vercel.com](https://vercel.com)
2. Wähle dein Projekt aus
3. Gehe zu **Settings → Environment Variables**

### 2. Füge jede Variable hinzu

Für jede Variable:

1. Klicke auf **"Add New"**
2. **Key:** Name der Variable (z.B. `OPENAI_API_KEY`)
3. **Value:** Der Wert aus deiner `.env.local`
4. **Environment:** Wähle alle aus:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Klicke auf **"Save"**

### 3. Wichtig für `NEXT_PUBLIC_*` Variablen

**`NEXT_PUBLIC_*` Variablen sind öffentlich!**
- Sie werden im Client-Bundle eingebunden
- Jeder kann sie im Browser sehen
- Verwende nur für nicht-sensible Daten

**Sicher:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` (öffentliche URL)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (öffentlicher Key, hat Row Level Security)
- ✅ `NEXT_PUBLIC_STRIPE_PRICE_ID_*` (nur IDs, keine Secrets)

**NICHT als `NEXT_PUBLIC_*`:**
- ❌ `STRIPE_SECRET_KEY` (bleibt server-seitig)
- ❌ `OPENAI_API_KEY` (bleibt server-seitig)
- ❌ `STRIPE_WEBHOOK_SECRET` (bleibt server-seitig)

---

## 🔐 Sicherheits-Checkliste

- [ ] **Nur Production-Keys** für Production-Deployment
- [ ] **Test-Keys** für Preview/Development (optional)
- [ ] **Keine Keys in Git** committen (`.env.local` ist in `.gitignore`)
- [ ] **Regelmäßig rotieren** (Keys ändern)
- [ ] **Minimale Berechtigungen** (nur das Nötigste)

---

## 📝 Beispiel-Konfiguration

### Für Production:

```env
# OpenAI
OPENAI_API_KEY=sk-proj-... (Production Key)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (Production Key)

# Stripe (Live-Modus)
STRIPE_SECRET_KEY=sk_live_... (Live Key)
NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25=price_... (Live Price ID)
NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME=price_... (Live Price ID)
STRIPE_WEBHOOK_SECRET=whsec_... (Live Webhook Secret)
```

### Für Preview/Development (optional):

Du kannst unterschiedliche Keys für verschiedene Environments setzen:

- **Production:** Live-Keys
- **Preview:** Test-Keys
- **Development:** Test-Keys

---

## ⚠️ Wichtige Hinweise

### 1. Keys aus `.env.local` kopieren

**Aber:** Verwende für Production **Live-Keys**, nicht Test-Keys!

- **Test-Keys** (beginnen mit `sk_test_`, `pk_test_`) → für Development/Preview
- **Live-Keys** (beginnen mit `sk_live_`, `pk_live_`) → für Production

### 2. Nach dem Hinzufügen

- **Neues Deployment starten** (Redeploy)
- Oder warten, bis Vercel automatisch neu deployed

### 3. Prüfen ob gesetzt

Nach dem Deployment kannst du prüfen:
- Gehe zu Vercel Dashboard → Dein Projekt → Settings → Environment Variables
- Alle Variablen sollten dort aufgelistet sein

---

## 🆘 Troubleshooting

### Problem: "Variable not found"

**Lösung:**
- Prüfe, ob die Variable in Vercel gesetzt ist
- Prüfe, ob sie für das richtige Environment gesetzt ist
- Starte ein neues Deployment

### Problem: "Invalid API Key"

**Lösung:**
- Prüfe, ob du Test-Keys für Production verwendest
- Verwende Live-Keys für Production
- Prüfe, ob der Key korrekt kopiert wurde (keine Leerzeichen)

### Problem: Build schlägt fehl

**Lösung:**
- Prüfe, ob alle erforderlichen Variablen gesetzt sind
- Prüfe die Build-Logs in Vercel
- Stelle sicher, dass `NEXT_PUBLIC_*` Variablen für alle Environments gesetzt sind

---

## ✅ Checkliste

- [ ] `OPENAI_API_KEY` gesetzt
- [ ] `NEXT_PUBLIC_SUPABASE_URL` gesetzt
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` gesetzt
- [ ] `STRIPE_SECRET_KEY` gesetzt (falls verwendet)
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25` gesetzt (falls verwendet)
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME` gesetzt (falls verwendet)
- [ ] `STRIPE_WEBHOOK_SECRET` gesetzt (optional, falls verwendet)
- [ ] Alle Variablen für alle Environments gesetzt (Production, Preview, Development)
- [ ] Neues Deployment gestartet












