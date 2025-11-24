# Vercel Build-Fehler beheben

## 🔴 Problem

Vercel zeigt immer noch den Fehler:
```
Type error: Type '"2024-12-18.acacia"' is not assignable to type '"2025-11-17.clover"'.
```

Aber in unserem Repository ist die Datei korrekt (ohne API-Version).

## 🔍 Mögliche Ursachen

1. **Falsches Repository in Vercel**
   - Vercel verwendet möglicherweise `korrektur-pilot` statt `KI-Klausuren`
   - Prüfe: Vercel Dashboard → Settings → Git → Repository

2. **Build-Cache**
   - Vercel verwendet einen alten Build-Cache
   - Lösung: Cache löschen

3. **Falscher Branch**
   - Vercel deployed von einem anderen Branch
   - Prüfe: Vercel Dashboard → Settings → Git → Production Branch

## ✅ Lösungen

### Lösung 1: Repository prüfen

1. Gehe zu **Vercel Dashboard → Settings → Git**
2. Prüfe das **Repository:**
   - Sollte sein: `8melc/KI-Klausuren`
   - Falls falsch: Repository ändern oder neues Projekt erstellen

### Lösung 2: Build-Cache löschen

1. Gehe zu **Vercel Dashboard → Dein Projekt → Settings**
2. Suche nach **"Build & Development Settings"** oder **"Build Cache"**
3. Klicke auf **"Clear Build Cache"** oder **"Clear Cache"**
4. Starte ein neues Deployment

### Lösung 3: Manuelles Redeploy ohne Cache

1. Gehe zu **Vercel Dashboard → Deployments**
2. Klicke auf den neuesten Deployment
3. Klicke auf **"Redeploy"**
4. **WICHTIG:** Deaktiviere **"Use existing Build Cache"**
5. Klicke auf **"Redeploy"**

### Lösung 4: Repository neu verbinden

Falls nichts hilft:

1. Gehe zu **Vercel Dashboard → Settings → Git**
2. Klicke auf **"Disconnect"** (Repository trennen)
3. Klicke auf **"Connect Git Repository"**
4. Wähle **`8melc/KI-Klausuren`** aus
5. Branch: **`main`**
6. Klicke auf **"Connect"**

## 🔍 Prüfen welches Repository Vercel verwendet

In den Build-Logs siehst du:
```
Cloning github.com/8melc/...
```

**Sollte sein:**
```
Cloning github.com/8melc/KI-Klausuren
```

**Falls du siehst:**
```
Cloning github.com/8melc/korrektur-pilot
```
→ Dann ist das falsche Repository verbunden!

## ✅ Schnell-Checkliste

- [ ] Repository in Vercel prüfen (`8melc/KI-Klausuren`)
- [ ] Branch prüfen (`main`)
- [ ] Build-Cache löschen
- [ ] Manuelles Redeploy ohne Cache
- [ ] Falls nötig: Repository neu verbinden

## 🆘 Falls nichts hilft

Falls das Problem weiterhin besteht:

1. **Prüfe die Build-Logs** in Vercel:
   - Welches Repository wird geklont?
   - Welcher Commit wird verwendet?

2. **Erstelle ein neues Vercel-Projekt:**
   - Neues Projekt erstellen
   - Repository `8melc/KI-Klausuren` verbinden
   - Branch `main` verwenden
   - Alle Environment Variables erneut setzen

