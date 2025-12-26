# Pre-Deploy Checkliste

**⚠️ WICHTIG: Diese Checkliste vor jedem wichtigen Deploy (oder nach größeren Changes) durchgehen!**

## 1. Happy Path – kleiner Klassensatz

**Test:**
- 3–5 typische Klausur-PDFs + Erwartungshorizont hochladen
- „Analyse starten" klicken

**Erwartung:**
- ✅ Upload-Balken laufen einmal sauber durch
- ✅ Analyse-Status geht Datei für Datei auf „fertig"
- ✅ In den Logs taucht jede Datei nur einmal pro Phase auf (Upload, Extraktion, Analyse)

---

## 2. Fehlender Erwartungshorizont

**Test:**
- Nur Schülerklausuren hochladen, ohne Erwartungshorizont/Musterlösung
- „Analyse starten"

**Erwartung:**
- ✅ UI zeigt klaren Fehlerhinweis (z.B. „Klausur-Text und Erwartungshorizont sind erforderlich")
- ✅ Jede Datei landet einmalig im Status „Fehler"
- ✅ Im Terminal keine Endlosschleifen von `/api/analyze` / `/api/extract-klausur`

---

## 3. Kaputte oder zu leere PDF

**Test:**
- Eine PDF mit sehr wenig oder keinem Text (z.B. leeres Blatt) hochladen

**Erwartung:**
- ✅ Fehler aus der Extraktions-Validierung („kein/zu wenig Text gefunden")
- ✅ Datei steht im Status „Fehler / bitte prüfen", „Erneut versuchen" ist möglich
- ✅ Kein automatischer Wiederhol-Upload/Extraktion für genau diese Datei

---

## 4. Back-Button / Tab schließen

**Test:**
- Klassensatz hochladen, Analyse starten
- Während Upload/Analyse:
  - Einmal „Zurück" im Browser oder Tab schließen und neu öffnen
  - Wieder auf `/correction` gehen

**Erwartung:**
- ✅ Keine Flut weiterer Requests im Terminal für bereits verlassene Jobs
- ✅ Entweder:
  - Du siehst denselben Job-Status wieder (Wiederaufnahme), oder
  - es laufen keine weiteren Upload/Analyse-Requests, bis du explizit neu startest

---

## 5. „Erneut versuchen"-Button

**Test:**
- Eine Datei bewusst in einen Fehler laufen lassen (z.B. PDF mit zu wenig Text oder Erwartungshorizont vorher entfernen)
- Dann im UI auf „Erneut versuchen" klicken

**Erwartung:**
- ✅ Nur diese eine Datei startet Upload + Extraktion + Analyse erneut
- ✅ Terminal zeigt pro neuem Versuch genau eine neue Sequenz `upload-url → extract-klausur → analyze` für diese Datei
- ✅ Kein paralleles Mehrfach-Feuern für denselben Dateinamen

---

## ✅ Abschluss

Wenn alle fünf Punkte so funktionieren, ist deine Upload- und Analyse-Pipeline für die Beta aus Sicht von Stabilität und Nutzererlebnis in einem guten Zustand.

---

**💡 Tipp:** Diese Checkliste vor jedem `git push` zu einem wichtigen Branch (z.B. `main` oder `production`) durchgehen!

---

## 🔔 Automatische Erinnerung

Ein Git `pre-push` Hook wurde eingerichtet, der dich automatisch an diese Checkliste erinnert, wenn du zu `main` oder `production` pushst.

**Hook deaktivieren (falls gewünscht):**
```bash
chmod -x .git/hooks/pre-push
```

**Hook wieder aktivieren:**
```bash
chmod +x .git/hooks/pre-push
```






