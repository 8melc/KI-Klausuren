# Supabase Dashboard Setup

Die Dashboard-Seite ist jetzt mit Supabase verbunden. Hier ist, was du tun musst:

## 1. Migration in Supabase ausführen

Die neue Migration `002_create_corrections_table.sql` muss in deinem Supabase-Projekt ausgeführt werden.

### Option A: Über Supabase Dashboard (Empfohlen)

1. Öffne dein [Supabase Dashboard](https://app.supabase.com)
2. Gehe zu **SQL Editor**
3. Klicke auf **New Query**
4. Kopiere den Inhalt von `supabase/migrations/002_create_corrections_table.sql`
5. Füge ihn in den Editor ein
6. Klicke auf **Run** (oder drücke `Cmd/Ctrl + Enter`)

### Option B: Über Supabase CLI

```bash
# Falls du Supabase CLI installiert hast
supabase db push
```

## 2. Tabellen, die erstellt werden

Die Migration erstellt zwei neue Tabellen:

### `corrections` Tabelle
- Speichert alle Korrekturen/Ergebnisse
- Enthält: Studentenname, Dateiname, Kursdaten, Status, Analyse-Ergebnisse
- Automatisch mit User-ID verknüpft (Row Level Security aktiviert)

### `expectation_horizons` Tabelle
- Speichert hochgeladene Erwartungshorizonte
- Enthält: Dateiname, Inhalt
- Automatisch mit User-ID verknüpft

## 3. Was passiert automatisch

✅ **Dashboard zeigt echte Daten:**
- Anzahl aktiver Erwartungshorizonte
- Anzahl korrigierter Arbeiten (dieses Monat)
- Anzahl exportierter Berichte
- Letzte Korrekturen (gruppiert nach Fach)

✅ **Abonnement-Informationen:**
- Zeigt echten Abonnement-Status aus der `subscriptions` Tabelle
- Zeigt Ablaufdatum
- Zeigt Abonnement-Typ (Monatsabo, Jahresabo, Einzellauf)

## 4. Nächste Schritte

Die Dashboard-Seite lädt jetzt automatisch Daten aus Supabase. 

**Wichtig:** Damit die Daten auch gespeichert werden, müssen die Upload- und Analyse-Funktionen noch angepasst werden, um Daten in die `corrections` Tabelle zu schreiben. Aktuell werden die Daten noch in localStorage gespeichert.

## 5. Prüfen ob es funktioniert

1. Öffne das Dashboard: `/dashboard`
2. Die Statistiken sollten jetzt echte Daten zeigen (0, wenn noch keine Daten vorhanden sind)
3. Abonnement-Informationen werden aus der `subscriptions` Tabelle geladen

## Troubleshooting

**Fehler: "relation does not exist"**
- Die Migration wurde noch nicht ausgeführt
- Führe die Migration in Supabase aus (siehe Schritt 1)

**Keine Daten angezeigt**
- Das ist normal, wenn noch keine Korrekturen durchgeführt wurden
- Die Daten werden gespeichert, sobald die Upload-Funktionen angepasst sind

**RLS (Row Level Security) Fehler**
- Die Policies sollten automatisch erstellt werden
- Falls nicht, prüfe in Supabase → Authentication → Policies


