# ✅ Stripe Integration Test-Checkliste

## 🎉 Setup abgeschlossen!

Sie haben erfolgreich:
- ✅ Test-Modus in Stripe aktiviert
- ✅ Test-Produkte erstellt
- ✅ Keys in `.env.local` eingetragen

---

## 🔄 Nächste Schritte

### 1. Development Server neu starten

**WICHTIG:** Next.js lädt `.env.local` nur beim Start. Nach Änderungen immer neu starten!

```bash
# Server stoppen (falls läuft): Ctrl + C
# Dann neu starten:
npm run dev
```

### 2. Checkout-Seite öffnen

Öffnen Sie im Browser:
```
http://localhost:3000/checkout
```

Sie sollten jetzt sehen:
- ✅ KorrekturPilot (25Stk.) - mit "Empfohlen" Badge
- ✅ KorrekturPilot Einzelkorrektur

### 3. Test-Zahlung durchführen

1. Klicken Sie auf **"Jetzt kaufen"** bei einem Produkt
2. Sie werden zu Stripe Checkout weitergeleitet
3. Verwenden Sie eine **Test-Kreditkarte**:
   - **Kartennummer:** `4242 4242 4242 4242`
   - **Ablaufdatum:** Beliebige zukünftige Daten (z.B. `12/25`)
   - **CVC:** Beliebige 3 Ziffern (z.B. `123`)
   - **ZIP/Postleitzahl:** Beliebige (z.B. `12345`)

4. Klicken Sie auf **"Pay"** oder **"Zahlen"**
5. Sie sollten zur Erfolgsseite weitergeleitet werden: `/checkout/success`

---

## 🧪 Was wird getestet?

- ✅ Checkout-Seite lädt korrekt
- ✅ Produkte werden angezeigt
- ✅ Stripe Checkout öffnet sich
- ✅ Test-Zahlung funktioniert
- ✅ Weiterleitung zur Success-Seite

---

## 🆘 Troubleshooting

### Problem: "Checkout konnte nicht erstellt werden"

**Lösung:**
1. Prüfen Sie, ob der Development Server neu gestartet wurde
2. Prüfen Sie die Browser-Konsole (F12) auf Fehler
3. Prüfen Sie, ob alle Umgebungsvariablen korrekt sind:
   ```bash
   cat .env.local | grep STRIPE
   ```

### Problem: "Price ID not found"

**Lösung:**
1. Prüfen Sie, ob die Price IDs korrekt kopiert wurden
2. Prüfen Sie, ob Sie Test-Mode Price IDs verwenden (für Development)
3. Prüfen Sie im Stripe Dashboard, ob die Produkte im Test-Modus existieren

### Problem: Checkout öffnet sich nicht

**Lösung:**
1. Prüfen Sie die Browser-Konsole auf Fehler
2. Prüfen Sie, ob `STRIPE_SECRET_KEY` korrekt gesetzt ist
3. Prüfen Sie die Network-Tab im Browser (F12 → Network)

---

## 📋 Checkliste

- [ ] Development Server neu gestartet
- [ ] Checkout-Seite öffnet (`/checkout`)
- [ ] Beide Produkte werden angezeigt
- [ ] "Jetzt kaufen" Button funktioniert
- [ ] Stripe Checkout öffnet sich
- [ ] Test-Zahlung erfolgreich
- [ ] Weiterleitung zur Success-Seite funktioniert

---

## 🚀 Nächste Schritte (nach erfolgreichem Test)

1. **Webhook konfigurieren** (für Production):
   - Stripe Dashboard → Webhooks
   - URL: `https://ihre-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, etc.

2. **Production Keys vorbereiten**:
   - Wechseln Sie zu Live-Modus in Stripe
   - Erstellen Sie Live-Produkte
   - Kopieren Sie Live-Keys für Vercel

3. **Auth-Schutz aktivieren** (wenn bereit):
   - `components/ProtectedRoute.tsx` → `AUTH_ENABLED = true`
   - `lib/auth.ts` → `AUTH_ENABLED = true`

---

## 💡 Tipp

**Für Development immer Test-Modus verwenden!**

- Keine echten Zahlungen
- Unbegrenzte Test-Zahlungen
- Keine Gebühren
- Perfekt zum Testen












