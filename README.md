# KI-Klausur-Korrektur MVP

Eine Next.js-Anwendung zur automatischen Korrektur von Klausuren mit KI-Unterstützung (OpenAI).

## Features

- 📋 **Erwartungshorizont hochladen**: Laden Sie den Erwartungshorizont als PDF hoch
- 📄 **Klausuren hochladen**: Laden Sie zu korrigierende Klausuren als PDF hoch
- 🤖 **KI-Analyse**: Automatische Analyse und Bewertung der Klausuren mit OpenAI
- ✅ **Detaillierte Ergebnisse**: Sehen Sie Punktzahlen, Kommentare und Korrekturen
- 📥 **PDF-Export**: Laden Sie korrigierte PDFs herunter

## Technologie-Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** - Authentifizierung & Datenbank
- **pdf-lib** - PDF-Generierung
- **OpenAI SDK** - KI-Analyse & Vision-basierte Textextraktion

## Installation

1. **Dependencies installieren** (bereits erledigt):
```bash
npm install
```

2. **Umgebungsvariablen konfigurieren**:
Erstellen Sie eine `.env.local` Datei im Projektroot:
```env
OPENAI_API_KEY=your-openai-api-key-here
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. **Google OAuth in Supabase konfigurieren**:
   - Öffnen Sie das [Supabase Dashboard](https://app.supabase.com)
   - Gehen Sie zu **Authentication → Providers**
   - Aktivieren Sie **Google**
   - Erstellen Sie eine OAuth 2.0 Client ID in der [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Fügen Sie die **Authorized redirect URI** hinzu: `https://xxxxx.supabase.co/auth/v1/callback`
     (Ersetzen Sie `xxxxx` mit Ihrer Supabase-Projekt-ID)
   - Tragen Sie **Client ID** und **Client Secret** in Supabase ein

4. **Development Server starten**:
```bash
npm run dev
```

5. **Anwendung öffnen**:
Öffnen Sie [http://localhost:3000](http://localhost:3000) im Browser.

## Verwendung

1. **Erwartungshorizont hochladen**:
   - Gehen Sie zu `/expectation`
   - Laden Sie den Erwartungshorizont als PDF hoch

2. **Klausuren hochladen**:
   - Gehen Sie zu `/upload`
   - Laden Sie die zu korrigierenden Klausuren hoch

3. **Analysieren**:
   - Gehen Sie zu `/results`
   - Klicken Sie auf "Klausur analysieren"
   - Die KI analysiert die Klausur anhand des Erwartungshorizonts

4. **Ergebnisse ansehen**:
   - Sehen Sie detaillierte Bewertungen, Punktzahlen und Kommentare
   - Laden Sie korrigierte PDFs herunter

## Projektstruktur

```
/app
  /expectation      → Erwartungshorizont hochladen
  /upload           → Klausuren hochladen
  /results          → Ergebnisse anzeigen
  /api
    /extract        → PDF Text extrahieren
    /analyze        → OpenAI-Analyse
    /generate-pdf   → korrigiertes PDF erstellen

/lib
  pdf.ts            → Vision-Extraktion & PDF-Generator
  openai.ts         → OpenAI API-Client

/components
  UploadBox.tsx     → Upload-Komponente
  ResultCard.tsx    → Ergebnis-Karte
```

## Hinweise

- **OpenAI API Key**: Erforderlich für die KI-Analyse. Erhalten Sie einen Key unter [platform.openai.com](https://platform.openai.com)
- **OpenAI API Key**: Wird ebenfalls für die Vision-basierte Textextraktion verwendet
- **Supabase**: Erforderlich für die Authentifizierung. Erstellen Sie ein Projekt unter [supabase.com](https://supabase.com)
- **Google OAuth**: Muss in Supabase und Google Cloud Console konfiguriert werden (siehe Schritt 3)
- Die Anwendung speichert Daten temporär im Browser-LocalStorage

## Build für Production

```bash
npm run build
npm start
```

## Authentifizierung

Die Anwendung verwendet Supabase für die Authentifizierung mit Google OAuth. **Während der Entwicklung ist der Auth-Schutz deaktiviert**, damit Sie ohne Login arbeiten können.

### Auth-Schutz aktivieren (für Production)

⚠️ **WICHTIG**: Vor dem Deployment auf Vercel müssen Sie den Auth-Schutz aktivieren!

1. **In `components/ProtectedRoute.tsx`**:
   ```typescript
   const AUTH_ENABLED = true  // Ändere false zu true
   ```

2. **In `lib/auth.ts`**:
   ```typescript
   export const AUTH_ENABLED = true  // Ändere false zu true
   ```

Nach der Aktivierung sind folgende Seiten und APIs nur noch für eingeloggte Benutzer zugänglich:
- `/expectation` - Erwartungshorizont hochladen
- `/upload` - Klausuren hochladen
- `/results` - Ergebnisse ansehen
- Alle API-Routen (`/api/*`)

Die Startseite (`/`) bleibt öffentlich zugänglich.

## Deploy auf Vercel

Die einfachste Möglichkeit ist das Deployment auf [Vercel](https://vercel.com):

1. Verbinden Sie Ihr GitHub-Repository
2. Fügen Sie die Umgebungsvariablen in den Vercel-Einstellungen hinzu:
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **⚠️ WICHTIG**: Aktivieren Sie den Auth-Schutz (siehe Abschnitt "Authentifizierung" oben)
4. Deploy automatisch bei jedem Push

Siehe auch `DEPLOYMENT.md` für eine detaillierte Deployment-Checkliste.
