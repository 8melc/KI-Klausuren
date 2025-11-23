# Stripe Umgebungsvariablen einrichten

## 📋 Schritt 1: Price IDs aus Stripe kopieren

### Im Stripe Dashboard:

1. Gehen Sie zu [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Klicken Sie auf **"KorrekturPilot (25Stk.)"**
3. Unter dem Produkt sehen Sie die **Price ID** (beginnt mit `price_...`)
   - Beispiel: `price_1ABC123def456GHI789`
   - **Kopieren Sie diese ID** → Das ist Ihre `NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25`

4. Klicken Sie auf **"KorrekturPilot Einzelkorrektur"**
5. Kopieren Sie auch hier die **Price ID**
   - **Kopieren Sie diese ID** → Das ist Ihre `NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME`

---

## 📝 Schritt 2: .env.local Datei erstellen/bearbeiten

### Option A: Datei existiert bereits

Falls Sie bereits eine `.env.local` Datei haben, fügen Sie diese Zeilen hinzu:

```env
# Stripe Price IDs (aus Stripe Dashboard kopieren)
NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME=price_xxxxxxxxxxxxx

# Stripe Secret Key (aus Stripe Dashboard → Developers → API keys)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

### Option B: Neue Datei erstellen

1. Erstellen Sie eine Datei namens `.env.local` im Projektroot (gleicher Ordner wie `package.json`)
2. Fügen Sie folgenden Inhalt ein:

```env
# OpenAI
OPENAI_API_KEY=your-openai-api-key-here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME=price_xxxxxxxxxxxxx

# Stripe Webhook Secret (später für Production)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## 🔑 Schritt 3: Stripe Secret Key finden

### Test-Modus aktivieren (für Development)

1. Gehen Sie zu [Stripe Dashboard](https://dashboard.stripe.com)
2. **WICHTIG:** Prüfen Sie oben rechts, ob **"Test mode"** aktiviert ist
   - Falls nicht: Klicken Sie auf den Toggle-Schalter, um Test-Modus zu aktivieren
   - Der Schalter sollte **blau/aktiv** sein für Development

3. Gehen Sie zu **Developers → API keys** (oder [direkt hier](https://dashboard.stripe.com/apikeys))
4. Unter **"Secret key"** sehen Sie einen Key, der mit `sk_test_...` beginnt
   - **Kopieren Sie diesen Key** → Das ist Ihre `STRIPE_SECRET_KEY`
   - Falls Sie nur einen Key sehen, der mit `sk_live_...` beginnt, ist der Test-Modus nicht aktiviert!

### Test-Modus aktivieren (falls nicht sichtbar)

Falls Sie keinen Test-Modus sehen:

1. Klicken Sie oben rechts im Stripe Dashboard auf den **Toggle-Schalter** neben "Test mode"
2. Oder gehen Sie zu **Settings → Account → Test mode**
3. Aktivieren Sie den Test-Modus
4. Jetzt sollten Sie Test-Keys sehen (beginnen mit `sk_test_...`)

### Für Production später

- Verwenden Sie den **"Secret key"** aus dem **Live-Modus** (beginnt mit `sk_live_...`)
- Wechseln Sie oben rechts im Dashboard zu **"Live mode"**

---

## ✅ Schritt 4: Überprüfen

Ihre `.env.local` sollte jetzt so aussehen:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_51ABC123def456GHI789...
NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25=price_1ABC123def456GHI789...
NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME=price_1XYZ789ghi012JKL345...
```

**Wichtig:**
- Ersetzen Sie `price_...` mit Ihren tatsächlichen Price IDs aus Stripe
- Ersetzen Sie `sk_test_...` mit Ihrem tatsächlichen Secret Key
- **Keine Anführungszeichen** um die Werte!

---

## 🚀 Schritt 5: Development Server neu starten

Nach dem Hinzufügen der Umgebungsvariablen:

1. **Stoppen Sie den Development Server** (falls er läuft): `Ctrl + C`
2. **Starten Sie ihn neu**:
   ```bash
   npm run dev
   ```

**Wichtig:** Next.js lädt `.env.local` nur beim Start. Nach Änderungen immer neu starten!

---

## 🧪 Schritt 6: Testen

1. Öffnen Sie `http://localhost:3000/checkout`
2. Sie sollten jetzt Ihre beiden Produkte sehen:
   - KorrekturPilot (25Stk.)
   - KorrekturPilot Einzelkorrektur
3. Klicken Sie auf "Jetzt kaufen" (Test-Zahlung)
4. Verwenden Sie eine Test-Karte:
   - **Erfolgreich:** `4242 4242 4242 4242`
   - **Abgelehnt:** `4000 0000 0000 0002`

---

## 📋 Checkliste

- [ ] Price ID für "KorrekturPilot (25Stk.)" kopiert
- [ ] Price ID für "KorrekturPilot Einzelkorrektur" kopiert
- [ ] Stripe Secret Key kopiert
- [ ] `.env.local` Datei erstellt/bearbeitet
- [ ] Alle Umgebungsvariablen eingetragen
- [ ] Development Server neu gestartet
- [ ] Checkout-Seite getestet

---

## ⚠️ Wichtige Hinweise

### Test vs. Live Mode

- **Development:** Verwenden Sie **Test-Mode** Keys (`sk_test_...`, `price_...` aus Test-Modus)
- **Production:** Verwenden Sie **Live-Mode** Keys (`sk_live_...`, `price_...` aus Live-Modus)

### .env.local ist lokal

- Die `.env.local` Datei wird **nicht** zu Git hinzugefügt (steht in `.gitignore`)
- Für Production (Vercel) müssen Sie die Variablen im **Vercel Dashboard** eintragen

### Preis-Anzeige

Die Preise werden aktuell hardcoded in `app/checkout/page.tsx` angezeigt. Falls Sie die Preise aus Stripe dynamisch laden möchten, können wir das später anpassen.

---

## 🆘 Troubleshooting

### Problem: "Price ID not found"
- Prüfen Sie, ob die Price IDs korrekt kopiert wurden (keine Leerzeichen)
- Prüfen Sie, ob Sie Test-Mode Price IDs verwenden (für Development)

### Problem: "STRIPE_SECRET_KEY ist nicht konfiguriert"
- Prüfen Sie, ob `STRIPE_SECRET_KEY` in `.env.local` steht
- Haben Sie den Development Server neu gestartet?

### Problem: Checkout funktioniert nicht
- Prüfen Sie die Browser-Konsole auf Fehler
- Prüfen Sie, ob alle Umgebungsvariablen korrekt gesetzt sind
- Verwenden Sie Test-Karten für Test-Zahlungen

