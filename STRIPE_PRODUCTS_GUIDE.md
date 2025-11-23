# Stripe Produkterstellung - KorrekturPilot

## 📋 Übersicht der Produkte

Basierend auf Ihrer Anwendung erstellen Sie **3 Produkte** in Stripe:

---

## 🎯 PRODUKT 1: Monatliches Abonnement

### Produkt-Informationen

**Produktname:**
```
KorrekturPilot Monatlich
```

**Beschreibung:**
```
KI-gestützte Klausurkorrektur mit unbegrenzten Korrekturen. Perfekt für regelmäßige Nutzung. Erwartungshorizont hochladen, Klausuren scannen, automatische KI-Analyse mit detailliertem Feedback, PDF- und Word-Export.
```

**Preis erstellen:**

1. **Preis-Typ:** Wiederkehrend (Recurring)
2. **Billing-Intervall:** Monatlich (Monthly)
3. **Preis:** `29.00 EUR`
4. **Preis-ID notieren:** Diese wird später als `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY` verwendet

**Features (für Produktbeschreibung):**
- ✅ Unbegrenzte Klausur-Korrekturen
- ✅ KI-gestützte Analyse mit OpenAI GPT-4o
- ✅ Detaillierte Bewertung mit Punkten und Kommentaren
- ✅ PDF-Export für Schüler-Feedback
- ✅ Word-Export für manuelle Ergänzungen
- ✅ Notenspiegel für Lehrkräfte
- ✅ Erwartungshorizont-Verwaltung
- ✅ Handschrift-Erkennung (OCR)

---

## 🎯 PRODUKT 2: Jährliches Abonnement

### Produkt-Informationen

**Produktname:**
```
KorrekturPilot Jährlich
```

**Beschreibung:**
```
KI-gestützte Klausurkorrektur mit unbegrenzten Korrekturen. Jährliche Zahlung mit 2 Monaten geschenkt (17% Ersparnis). Erwartungshorizont hochladen, Klausuren scannen, automatische KI-Analyse mit detailliertem Feedback, PDF- und Word-Export.
```

**Preis erstellen:**

1. **Preis-Typ:** Wiederkehrend (Recurring)
2. **Billing-Intervall:** Jährlich (Yearly)
3. **Preis:** `299.00 EUR`
4. **Preis-ID notieren:** Diese wird später als `NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY` verwendet

**Features (für Produktbeschreibung):**
- ✅ Unbegrenzte Klausur-Korrekturen
- ✅ KI-gestützte Analyse mit OpenAI GPT-4o
- ✅ Detaillierte Bewertung mit Punkten und Kommentaren
- ✅ PDF-Export für Schüler-Feedback
- ✅ Word-Export für manuelle Ergänzungen
- ✅ Notenspiegel für Lehrkräfte
- ✅ Erwartungshorizont-Verwaltung
- ✅ Handschrift-Erkennung (OCR)
- ✅ **2 Monate geschenkt** (24,92€/Monat statt 29€/Monat)

---

## 🎯 PRODUKT 3: Einmalige Zahlung

### Produkt-Informationen

**Produktname:**
```
KorrekturPilot Einzelkorrektur
```

**Beschreibung:**
```
Einzelne Klausur-Korrektur mit KI-Unterstützung. Ideal für gelegentliche Nutzung oder zum Testen. Erwartungshorizont hochladen, eine Klausur scannen, automatische KI-Analyse mit detailliertem Feedback, PDF-Export.
```

**Preis erstellen:**

1. **Preis-Typ:** Einmalig (One-time)
2. **Billing-Intervall:** Nicht zutreffend (One-time payment)
3. **Preis:** `9.00 EUR`
4. **Preis-ID notieren:** Diese wird später als `NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME` verwendet

**Features (für Produktbeschreibung):**
- ✅ 1 Klausur-Korrektur
- ✅ KI-gestützte Analyse mit OpenAI GPT-4o
- ✅ Detaillierte Bewertung mit Punkten und Kommentaren
- ✅ PDF-Export für Schüler-Feedback
- ✅ Erwartungshorizont-Verwaltung
- ✅ Handschrift-Erkennung (OCR)

---

## 📝 Schritt-für-Schritt Anleitung für Stripe Dashboard

### 1. Produkt 1 erstellen (Monatlich)

1. Gehen Sie zu [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Klicken Sie auf **"+ Add product"**
3. **Name:** `KorrekturPilot Monatlich`
4. **Description:** (siehe oben)
5. Klicken Sie auf **"Add pricing"**
   - **Pricing model:** Standard pricing
   - **Price:** `29.00`
   - **Currency:** EUR (€)
   - **Billing period:** Monthly
   - **Recurring:** ✅ Aktiviert
6. Klicken Sie auf **"Save product"**
7. **WICHTIG:** Kopieren Sie die **Price ID** (beginnt mit `price_...`)
   - Diese ist Ihre `NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY`

### 2. Produkt 2 erstellen (Jährlich)

1. Klicken Sie erneut auf **"+ Add product"**
2. **Name:** `KorrekturPilot Jährlich`
3. **Description:** (siehe oben)
4. Klicken Sie auf **"Add pricing"**
   - **Pricing model:** Standard pricing
   - **Price:** `299.00`
   - **Currency:** EUR (€)
   - **Billing period:** Yearly
   - **Recurring:** ✅ Aktiviert
5. Klicken Sie auf **"Save product"**
6. **WICHTIG:** Kopieren Sie die **Price ID** (beginnt mit `price_...`)
   - Diese ist Ihre `NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY`

### 3. Produkt 3 erstellen (Einmalig)

1. Klicken Sie erneut auf **"+ Add product"**
2. **Name:** `KorrekturPilot Einzelkorrektur`
3. **Description:** (siehe oben)
4. Klicken Sie auf **"Add pricing"**
   - **Pricing model:** Standard pricing
   - **Price:** `9.00`
   - **Currency:** EUR (€)
   - **Billing period:** One time
   - **Recurring:** ❌ Deaktiviert
5. Klicken Sie auf **"Save product"**
6. **WICHTIG:** Kopieren Sie die **Price ID** (beginnt mit `price_...`)
   - Diese ist Ihre `NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME`

---

## 🔑 Umgebungsvariablen setzen

Nachdem Sie alle Produkte erstellt haben, fügen Sie die Price IDs zu Ihrer `.env.local` hinzu:

```env
# Stripe Price IDs (aus Stripe Dashboard kopieren)
NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME=price_xxxxxxxxxxxxx
```

**Wichtig:** 
- Verwenden Sie **Test-Mode Price IDs** für Development (`price_...`)
- Verwenden Sie **Live-Mode Price IDs** für Production (`price_...`)

---

## 💡 Zusätzliche Tipps

### Produktbilder (optional)
- Sie können ein Logo oder Screenshot hinzufügen
- Empfohlene Größe: 640x640px
- Format: PNG oder JPG

### Steuer-Informationen
- Falls Sie in Deutschland Steuern erheben müssen, konfigurieren Sie dies in Stripe
- Gehen Sie zu **Settings → Tax rates**

### Coupons (optional)
- Sie können später Rabattcodes erstellen (z.B. "BETA50" für 50% Rabatt)
- Gehen Sie zu **Products → Coupons**

### Test-Modus
- Verwenden Sie Test-Karten für Development:
  - Erfolgreich: `4242 4242 4242 4242`
  - Abgelehnt: `4000 0000 0000 0002`
  - Weitere Test-Karten: [Stripe Test Cards](https://stripe.com/docs/testing)

---

## ✅ Checkliste

- [ ] Produkt 1 (Monatlich) erstellt
- [ ] Price ID für Monatlich kopiert
- [ ] Produkt 2 (Jährlich) erstellt
- [ ] Price ID für Jährlich kopiert
- [ ] Produkt 3 (Einmalig) erstellt
- [ ] Price ID für Einmalig kopiert
- [ ] Price IDs in `.env.local` eingetragen
- [ ] Test-Zahlung durchgeführt (optional)

---

## 🚀 Nächste Schritte

Nach der Produkterstellung:

1. ✅ Price IDs in `.env.local` eintragen
2. ✅ Webhook konfigurieren (siehe `DEPLOYMENT.md`)
3. ✅ Test-Zahlung durchführen
4. ✅ Checkout-Seite testen (`/checkout`)

