# Stripe Test-Modus aktivieren

## 🎯 Problem: Kein Test-Modus sichtbar

Wenn Sie in Stripe keinen Test-Modus sehen, folgen Sie diesen Schritten:

---

## ✅ Schritt 1: Test-Modus aktivieren

### Im Stripe Dashboard:

1. **Öffnen Sie das Stripe Dashboard**: [https://dashboard.stripe.com](https://dashboard.stripe.com)

2. **Suchen Sie oben rechts** nach einem Toggle-Schalter:
   - Sollte zwischen "Test mode" und "Live mode" wechseln
   - Der Schalter sollte **blau/aktiv** sein für Test-Modus

3. **Falls kein Schalter sichtbar:**
   - Gehen Sie zu **Settings → Account**
   - Suchen Sie nach "Test mode" oder "Toggle test mode"
   - Aktivieren Sie den Test-Modus

---

## 🔑 Schritt 2: Test-Keys finden

Nach Aktivierung des Test-Modus:

1. Gehen Sie zu **Developers → API keys**
   - Oder direkt: [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)

2. Sie sollten jetzt **zwei Bereiche** sehen:
   - **"Test mode keys"** (oben) - für Development
   - **"Live mode keys"** (unten) - für Production

3. Unter **"Test mode keys"** finden Sie:
   - **Publishable key** (beginnt mit `pk_test_...`)
   - **Secret key** (beginnt mit `sk_test_...`) ← **Das brauchen Sie!**

---

## 📝 Schritt 3: Test-Keys verwenden

### Für Development (.env.local):

```env
# Stripe Test-Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME=price_xxxxxxxxxxxxx
```

**Wichtig:**
- Verwenden Sie Keys, die mit `sk_test_...` beginnen
- Verwenden Sie Price IDs aus dem **Test-Modus**

---

## 🧪 Schritt 4: Test-Zahlungen durchführen

Mit Test-Keys können Sie Test-Zahlungen durchführen:

### Test-Kreditkarten:

- **Erfolgreich:** `4242 4242 4242 4242`
- **Abgelehnt:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

### Weitere Test-Karten:

Siehe: [Stripe Test Cards](https://stripe.com/docs/testing)

**Beliebige zukünftige Daten** für Ablaufdatum und CVC funktionieren.

---

## ⚠️ Wichtige Hinweise

### Test vs. Live Mode

- **Test-Modus (Development):**
  - Keys beginnen mit `sk_test_...` und `pk_test_...`
  - Keine echten Zahlungen
  - Perfekt zum Testen

- **Live-Modus (Production):**
  - Keys beginnen mit `sk_live_...` und `pk_live_...`
  - Echte Zahlungen
  - Nur für Production verwenden!

### Produkte in beiden Modi

- Produkte müssen **separat** in Test- und Live-Modus erstellt werden
- Test-Produkte haben andere Price IDs als Live-Produkte
- Verwenden Sie Test-Produkte für Development

---

## 🆘 Troubleshooting

### Problem: "Ich sehe nur Live-Keys"

**Lösung:**
1. Prüfen Sie, ob Test-Modus oben rechts aktiviert ist
2. Falls nicht: Klicken Sie auf den Toggle-Schalter
3. Seite neu laden (F5)

### Problem: "Test-Modus ist grau/ausgegraut"

**Lösung:**
- Möglicherweise müssen Sie zuerst Ihr Stripe-Konto vollständig verifizieren
- Gehen Sie zu **Settings → Account** und vervollständigen Sie Ihr Profil

### Problem: "Ich kann nicht zwischen Test und Live wechseln"

**Lösung:**
- Stellen Sie sicher, dass Sie als **Account Owner** oder **Admin** eingeloggt sind
- Kontaktieren Sie den Account Owner, falls Sie keine Berechtigung haben

---

## 📋 Checkliste

- [ ] Test-Modus im Stripe Dashboard aktiviert
- [ ] Test-Keys sichtbar (beginnen mit `sk_test_...`)
- [ ] Test-Produkte erstellt
- [ ] Test Price IDs kopiert
- [ ] Test-Keys in `.env.local` eingetragen
- [ ] Test-Zahlung erfolgreich durchgeführt

---

## 💡 Tipp

**Für Development immer Test-Modus verwenden!**

- Keine echten Zahlungen
- Unbegrenzte Test-Zahlungen
- Keine Gebühren
- Perfekt zum Testen der Integration






