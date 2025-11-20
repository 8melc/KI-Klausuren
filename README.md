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
```

3. **Development Server starten**:
```bash
npm run dev
```

4. **Anwendung öffnen**:
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
- Die Anwendung speichert Daten temporär im Browser-LocalStorage

## Build für Production

```bash
npm run build
npm start
```

## Deploy auf Vercel

Die einfachste Möglichkeit ist das Deployment auf [Vercel](https://vercel.com):

1. Verbinden Sie Ihr GitHub-Repository
2. Fügen Sie die Umgebungsvariablen in den Vercel-Einstellungen hinzu
3. Deploy automatisch bei jedem Push
