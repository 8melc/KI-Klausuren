# 🗺️ KorrekturPilot Roadmap

**Stand:** Beta-Release (Sonntag Deadline)  
**Phase:** 1 (Beta) ✅ | Phase 2 (Zukünftige Features) 📋

---

## ✅ Phase 1: Beta-Release (Aktuell)

### Implementiert
- ✅ Basis-Navigation (Korrektur starten, Ergebnisse, Dashboard)
- ✅ Supabase-Integration für persistente Datenspeicherung
- ✅ Analyse-Pipeline mit konsistenter Bepunktung
- ✅ Auth-System mit Email/Google Login
- ✅ Credits-System für Klausur-Verarbeitung

---

## 📋 Phase 2: Zukünftige Features

### 1. Flexible Kursdaten

**Problem:** Aktuelle Dropdowns sind zu starr für verschiedene Schulformen.

**Lösung:**
- **Comboboxen statt Dropdowns:** Freitext + intelligente Vorschläge
  - Nutzer kann eigene Fächer/Klassen eingeben
  - System schlägt ähnliche Einträge vor (z.B. "Mathe" → "Mathematik")
  - Autocomplete für häufig genutzte Werte

- **Oberstufen-Formate:**
  - Unterstützung für GK/LK (Grundkurs/Leistungskurs)
  - Q1/Q2/Q3/Q4 Semester-System
  - Kurs-Bezeichnungen (z.B. "Bio-LK Q2")

**Priorität:** Mittel  
**Geschätzter Aufwand:** 2-3 Tage

---

### 2. Erweitertes UX-Feedback

**Problem:** Während der Analyse fehlt klare Kommunikation über den Fortschritt.

**Lösung:**
- **Progress-Bar während der Analyse:**
  - Zeigt Fortschritt pro Klausur (z.B. "3/10 Klausuren analysiert")
  - Geschätzte verbleibende Zeit
  - Welche Klausur gerade verarbeitet wird

- **Info-Text: "Du wirst automatisch weitergeleitet"**
  - Klare Kommunikation, dass der User warten soll
  - Verhindert versehentliches Schließen des Tabs
  - Optional: "Analyse läuft im Hintergrund" (für zukünftige Background-Jobs)

**Priorität:** Mittel  
**Geschätzter Aufwand:** 1-2 Tage

---

### 3. Upload-Erweiterungen

**Problem:** Aktuell nur PDF-Format, keine Bulk-Uploads für große Klassen.

**Lösung:**
- **Bilder (JPG/PNG) statt nur PDF:**
  - OCR-Vorstufe für Musterlösungen
  - Automatische Konvertierung zu PDF im Hintergrund
  - Unterstützung für Foto-Uploads direkt vom Handy

- **Bulk-Upload für >10 Dateien:**
  - Queue-System für sequenzielle Verarbeitung
  - Fortschrittsanzeige pro Datei
  - Fehlerbehandlung pro Datei (eine fehlgeschlagene Datei stoppt nicht den ganzen Batch)

**Priorität:** Hoch (für Produktivität)  
**Geschätzter Aufwand:** 3-4 Tage

---

### 4. Backend-Jobs (Async Processing)

**Problem:** Aktuell läuft die Analyse synchron. Wenn der Tab geschlossen wird, geht der Fortschritt verloren.

**Lösung:**
- **Umbau auf echtes Async-Processing:**
  - Background Jobs (z.B. mit Vercel Cron Jobs oder Supabase Edge Functions)
  - Analyse läuft weiter, auch wenn Tab geschlossen wird
  - User erhält Email-Benachrichtigung bei Abschluss (optional)

- **Job-Status-Tracking:**
  - Datenbank-Tracking für jeden Analyse-Job
  - Retry-Mechanismus bei Fehlern
  - Status-Updates in Echtzeit (WebSocket oder Polling)

**Priorität:** Hoch (für Stabilität)  
**Geschätzter Aufwand:** 5-7 Tage

---

## 🎯 Priorisierung für Phase 2

1. **Backend-Jobs** (Höchste Priorität)
   - Stabilität und Zuverlässigkeit sind kritisch
   - Verhindert Datenverlust bei Tab-Schließung

2. **Bulk-Upload** (Hohe Priorität)
   - Direkter Produktivitätsgewinn für Lehrer
   - Ermöglicht Verarbeitung ganzer Klassen

3. **UX-Feedback** (Mittlere Priorität)
   - Verbessert User Experience
   - Reduziert Support-Anfragen

4. **Flexible Kursdaten** (Mittlere Priorität)
   - Nice-to-have Feature
   - Erhöht Flexibilität für verschiedene Schulformen

---

## 📝 Notizen für Implementierung

- Alle Features sollten rückwärtskompatibel sein
- Migrationen für Datenbank-Änderungen vorbereiten
- Testing-Strategie für jedes Feature definieren
- Dokumentation parallel zur Implementierung aktualisieren

---

**Letzte Aktualisierung:** Beta-Release Vorbereitung






