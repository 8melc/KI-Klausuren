# Stripe Integration testen - Schritt-für-Schritt

## ✅ Voraussetzungen prüfen

Bevor du testest, stelle sicher:

- [ ] Development Server läuft (`npm run dev`)
- [ ] Stripe Keys in `.env.local` eingetragen
- [ ] Test-Produkte in Stripe Dashboard erstellt
- [ ] Test-Modus in Stripe aktiviert

---

## 🧪 Test-Schritte

### Schritt 1: Checkout-Seite öffnen

1. Öffne im Browser: `http://localhost:3000/checkout`
2. Du solltest sehen:
   - ✅ KorrekturPilot (25Stk.) - mit "Empfohlen" Badge
   - ✅ KorrekturPilot Einzelkorrektur

**Falls die Seite nicht lädt:**
- Prüfe, ob der Server läuft
- Prüfe die Browser-Konsole (F12) auf Fehler
- Prüfe, ob `AUTH_ENABLED = false` in `components/ProtectedRoute.tsx` (für Development)

---

### Schritt 2: Test-Zahlung starten

1. Klicke auf **"Jetzt kaufen"** bei einem Produkt
2. Du solltest zu **Stripe Checkout** weitergeleitet werden
3. Die URL sollte so aussehen: `https://checkout.stripe.com/...`

**Falls Checkout nicht öffnet:**
- Prüfe die Browser-Konsole (F12) auf Fehler
- Prüfe die Network-Tab (F12 → Network) - siehst du einen Fehler bei `/api/stripe/checkout`?
- Prüfe die Server-Logs im Terminal

---

### Schritt 3: Test-Kreditkarte verwenden

Im Stripe Checkout-Formular:

1. **Kartennummer:** `4242 4242 4242 4242`
2. **Ablaufdatum:** Beliebige zukünftige Daten (z.B. `12/25`)
3. **CVC:** Beliebige 3 Ziffern (z.B. `123`)
4. **ZIP/Postleitzahl:** Beliebige (z.B. `12345`)
5. Klicke auf **"Pay"** oder **"Zahlen"**

**Weitere Test-Karten:**

| Kartennummer | Ergebnis |
|-------------|----------|
| `4242 4242 4242 4242` | ✅ Erfolgreich |
| `4000 0000 0000 0002` | ❌ Abgelehnt |
| `4000 0025 0000 3155` | 🔐 3D Secure erforderlich |

---

### Schritt 4: Erfolgsseite prüfen

Nach erfolgreicher Zahlung solltest du weitergeleitet werden zu:
- `http://localhost:3000/checkout/success?session_id=cs_test_...`

**Du solltest sehen:**
- ✅ "Zahlung erfolgreich!" Meldung
- ✅ "Zur Startseite" Button

**Falls Fehler:**
- Prüfe die Browser-Konsole
- Prüfe die URL (enthält sie `session_id`?)
- Prüfe die Server-Logs

---

## 🔍 Was wird getestet?

### ✅ Frontend
- Checkout-Seite lädt korrekt
- Produkte werden angezeigt
- "Jetzt kaufen" Button funktioniert
- Weiterleitung zu Stripe Checkout

### ✅ Backend API
- `/api/stripe/checkout` Route funktioniert
- Stripe Session wird erstellt
- Redirect-URLs sind korrekt

### ✅ Stripe Integration
- Checkout öffnet sich
- Test-Zahlung funktioniert
- Weiterleitung zur Success-Seite

---

## 🐛 Troubleshooting

### Problem: "Checkout konnte nicht erstellt werden"

**Prüfe:**

1. **Browser-Konsole (F12):**
   ```javascript
   // Siehst du einen Fehler?
   // Prüfe die Network-Tab für /api/stripe/checkout
   ```

2. **Server-Logs im Terminal:**
   ```bash
   # Siehst du Fehler wie:
   # "STRIPE_SECRET_KEY ist nicht konfiguriert"
   # "Price ID not found"
   ```

3. **Umgebungsvariablen prüfen:**
   ```bash
   cat .env.local | grep STRIPE
   ```
   
   Sollte zeigen:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25=price_...
   NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME=price_...
   ```

**Lösung:**
- Prüfe, ob alle Keys korrekt eingetragen sind
- Prüfe, ob du Test-Keys verwendest (beginnen mit `sk_test_...`)
- Starte den Server neu: `npm run dev`

---

### Problem: "Price ID not found"

**Prüfe:**

1. **Stripe Dashboard:**
   - Sind die Produkte im **Test-Modus** erstellt?
   - Sind die Price IDs korrekt kopiert?

2. **`.env.local`:**
   - Beginnt die Price ID mit `price_...`?
   - Keine Leerzeichen oder Anführungszeichen?

**Lösung:**
- Erstelle die Produkte im Test-Modus neu
- Kopiere die Price IDs erneut
- Starte den Server neu

---

### Problem: Checkout öffnet sich nicht

**Prüfe:**

1. **Browser-Konsole:**
   - Siehst du JavaScript-Fehler?
   - Wird `/api/stripe/checkout` aufgerufen?

2. **Network-Tab:**
   - Status-Code von `/api/stripe/checkout`?
   - Response-Body?

**Lösung:**
- Prüfe die Server-Logs
- Prüfe, ob `STRIPE_SECRET_KEY` gesetzt ist
- Prüfe die Browser-Konsole auf Fehler

---

### Problem: Zahlung wird nicht akzeptiert

**Prüfe:**

1. **Test-Karte korrekt?**
   - Verwende: `4242 4242 4242 4242`
   - Zukünftiges Ablaufdatum
   - Beliebige CVC

2. **Stripe Dashboard:**
   - Siehst du die Zahlung im Dashboard?
   - Unter "Payments" → Test-Modus

**Lösung:**
- Verwende eine andere Test-Karte
- Prüfe, ob Test-Modus in Stripe aktiviert ist

---

## 📊 Erfolgreicher Test - Checkliste

- [ ] Checkout-Seite öffnet (`/checkout`)
- [ ] Beide Produkte werden angezeigt
- [ ] "Jetzt kaufen" Button funktioniert
- [ ] Stripe Checkout öffnet sich
- [ ] Test-Kreditkarte wird akzeptiert
- [ ] Weiterleitung zur Success-Seite funktioniert
- [ ] Zahlung erscheint im Stripe Dashboard (Test-Modus)

---

## 🎯 Nächste Schritte nach erfolgreichem Test

1. **Webhook testen** (optional):
   - Konfiguriere Webhook in Stripe Dashboard
   - URL: `http://localhost:3000/api/stripe/webhook` (für lokales Testen: Stripe CLI verwenden)

2. **Production vorbereiten:**
   - Erstelle Live-Produkte in Stripe
   - Kopiere Live-Keys
   - Konfiguriere Production-Webhook

3. **Auth-Schutz aktivieren** (wenn bereit):
   - `components/ProtectedRoute.tsx` → `AUTH_ENABLED = true`
   - `lib/auth.ts` → `AUTH_ENABLED = true`

---

## 💡 Tipps

- **Immer Test-Modus für Development verwenden!**
- **Test-Karten kosten nichts**
- **Unbegrenzte Test-Zahlungen möglich**
- **Zahlungen erscheinen im Stripe Dashboard unter "Payments" → Test-Modus**

---

## 🔗 Nützliche Links

- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Dashboard](https://dashboard.stripe.com/test/payments)
- [Stripe Webhooks Testing](https://stripe.com/docs/webhooks/test)

