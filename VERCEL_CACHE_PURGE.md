# Vercel Cache löschen - Anleitung

## 🔧 Cache löschen

Du siehst zwei Cache-Optionen:

### 1. **Data Cache** (WICHTIG für Build-Fehler)

**Was macht es:**
- Löscht den Build-Cache
- Framework-Cache wird gelöscht
- **Das ist der richtige Cache für Build-Probleme!**

**Schritte:**
1. Klicke auf **"Purge Data Cache"**
2. Bestätige die Aktion
3. Starte ein neues Deployment

### 2. **CDN Cache** (Optional)

**Was macht es:**
- Löscht den CDN-Cache (für bereits deployede Inhalte)
- ISR, PPR, Image Optimization Cache
- **Nicht notwendig für Build-Fehler, aber kann helfen**

**Schritte:**
1. Klicke auf **"Purge CDN Cache"** (optional)
2. Bestätige die Aktion

---

## ✅ Nach dem Cache-Löschen

### 1. Neues Deployment starten

**Option A: Automatisch**
- Nach dem Cache-Löschen sollte Vercel automatisch einen neuen Build starten
- Oder: Push einen neuen Commit zu GitHub

**Option B: Manuell**
1. Gehe zu **Deployments**
2. Klicke auf **"Redeploy"** beim neuesten Deployment
3. **WICHTIG:** Deaktiviere **"Use existing Build Cache"**
4. Klicke auf **"Redeploy"**

---

## 🎯 Erwartetes Ergebnis

Nach dem Cache-Löschen sollte:
- ✅ Der Build die neueste Version aus dem Repository verwenden
- ✅ Der Stripe API-Version Fehler verschwinden
- ✅ Der Build erfolgreich sein

---

## 🆘 Falls es weiterhin nicht funktioniert

1. **Prüfe das Repository:**
   - Vercel Dashboard → Settings → Git
   - Sollte sein: `8melc/KI-Klausuren`
   - Branch: `main`

2. **Prüfe den Commit:**
   - In den Build-Logs sollte stehen: `Commit: 3aca24f` oder neuer
   - Falls älterer Commit: Repository ist falsch verbunden

3. **Repository neu verbinden:**
   - Settings → Git → Disconnect
   - Dann neu verbinden mit `8melc/KI-Klausuren`












