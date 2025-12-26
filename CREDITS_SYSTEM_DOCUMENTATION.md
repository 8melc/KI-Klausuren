# Credits-System Dokumentation

## Übersicht

Das Credits-System verwaltet kostenlose Test-Klausuren und bezahlte Klausur-Pakete für Nutzer.

## Funktionsweise

### 1. Automatische Vergabe bei Registrierung

Jeder neue User erhält **automatisch 1 kostenloses Credit** bei der Registrierung.

**Implementierung:**
- Supabase Trigger `on_auth_user_created` wird ausgelöst
- Funktion `give_free_test_credit()` fügt automatisch 1 Credit hinzu
- Keine App-Logik nötig – funktioniert auch bei OAuth, Magic Link, etc.

### 2. Datenbank-Struktur

**Tabelle: `users`**
```sql
id UUID PRIMARY KEY REFERENCES auth.users(id)
credits INTEGER NOT NULL DEFAULT 0
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

**RPC-Funktion: `add_credits(user_id, amount)`**
- Fügt Credits zu einem User hinzu
- Wird vom Stripe-Webhook verwendet

### 3. Credit-Verbrauch

**Bei jeder Klausur-Analyse:**
1. API prüft ob User Credits hat (`getUserCredits()`)
2. Wenn Credits < 1: Fehler 402 (Payment Required)
3. Nach erfolgreicher Analyse: 1 Credit wird verbraucht (`consumeCredit()`)
4. Response enthält verbleibende Credits

**API-Route: `/api/analyze`**
```typescript
// Prüfe Credits
const credits = await getUserCredits(user.id);
if (credits < 1) {
  return NextResponse.json({ error: 'Nicht genug Credits' }, { status: 402 });
}

// ... Analyse durchführen ...

// Verbrauche Credit
await consumeCredit(user.id);
```

### 4. Credits kaufen (Stripe)

**Checkout:**
- User kauft 25 Klausuren für €7.90
- Stripe Checkout Session wird erstellt
- Nach erfolgreicher Zahlung: Webhook wird ausgelöst

**Webhook: `/api/stripe/webhook`**
```typescript
// Bei erfolgreicher Zahlung (€7.90 = 790 Cent)
if (amountInCents === 790) {
  await addCredits(userId, 25);
}
```

### 5. Frontend-Anzeige

**Komponente: `CreditsDisplay`**
- Zeigt aktuelle Credits im Header
- Spezielle Anzeige für kostenlose Test-Klausur (1 Credit)
- Link zum Kauf wenn Credits < 5

## Migration ausführen

### 1. In Supabase Dashboard

1. Gehe zu **SQL Editor**
2. Öffne die Datei `supabase/migrations/004_create_users_table_with_credits.sql`
3. Kopiere den Inhalt
4. Führe das SQL aus

### 2. Via Supabase CLI

```bash
supabase migration up
```

## Testing

### 1. Registrierung testen

1. Registriere neuen User
2. Prüfe in Supabase: `SELECT * FROM users WHERE id = 'user-id'`
3. Sollte `credits = 1` haben

### 2. Credit-Verbrauch testen

1. Führe Analyse durch
2. Prüfe: Credits sollten auf 0 gesunken sein
3. Versuche erneut zu analysieren → sollte Fehler 402 geben

### 3. Stripe-Integration testen

1. Kaufe 25 Klausuren für €7.90
2. Prüfe Webhook-Logs
3. Prüfe in Supabase: Credits sollten auf 25 gestiegen sein

## Fehlerbehandlung

### Keine Credits mehr

**API Response:**
```json
{
  "error": "Nicht genug Credits",
  "credits": 0,
  "message": "Du hast keine Credits mehr. Bitte kaufe ein Paket mit 25 Klausuren für €7.90."
}
```

**Frontend:**
- Zeigt Warnung im Header
- Link zum Checkout

### User nicht eingeloggt

**API Response:**
```json
{
  "error": "Unauthorized"
}
```

**Status Code:** 401

## Preise

- **Kostenlose Test-Klausur:** 1 Credit (automatisch bei Registrierung)
- **25 Klausuren:** €7.90 = 25 Credits

## Sicherheit

- **Row Level Security (RLS):** Users können nur ihre eigenen Credits sehen/ändern
- **Server-side Prüfung:** Credits werden immer server-side geprüft
- **Trigger-Funktion:** `SECURITY DEFINER` für automatische Credit-Vergabe

## Erweiterungen

### Mögliche zukünftige Features:

1. **Credit-Historie:** Tabelle für Credit-Transaktionen
2. **Credit-Pakete:** Verschiedene Paketgrößen (10, 25, 50, 100)
3. **Abo-Modell:** Monatliche Credits statt einmaliger Käufe
4. **Credit-Verlauf:** Ablaufdatum für Credits (optional)











