# Vollständige Architektur-Dokumentation – KI-Klausurkorrektur MVP

## 📋 Inhaltsverzeichnis

1. [Übersicht & Zielsetzung](#übersicht--zielsetzung)
2. [Gesamtarchitektur](#gesamtarchitektur)
3. [Technischer Stack & Begründungen](#technischer-stack--begründungen)
4. [Datenfluss & Workflow](#datenfluss--workflow)
5. [API-Design](#api-design)
6. [Datenmodelle & Schemata](#datenmodelle--schemata)
7. [Komponenten-Architektur](#komponenten-architektur)
8. [KI-Integration (OpenAI)](#ki-integration-openai)
9. [PDF-Verarbeitung](#pdf-verarbeitung)
10. [Designentscheidungen](#designentscheidungen)
11. [Komponenten für Google AI Studio](#komponenten-für-google-ai-studio)
12. [Integration Patterns](#integration-patterns)

---

## Übersicht & Zielsetzung

### Problemstellung

Lehrer müssen handgeschriebene Klausuren manuell korrigieren, was sehr zeitaufwändig ist. Das MVP automatisiert diesen Prozess durch KI-Unterstützung.

### Lösung

Ein vollständiger Workflow, der:
1. **PDFs extrahiert** (sowohl gedruckt als auch handgeschrieben)
2. **Text analysiert** mit KI anhand eines Erwartungshorizonts
3. **Bewertung durchführt** mit strukturiertem Feedback
4. **Korrektur-PDFs generiert** für Rückgabe an Schüler

### Zielgruppe

- Lehrer in weiterführenden Schulen
- Insbesondere für Chemie-Klausuren (EF/GK11)
- Erweiterbar auf andere Fächer

---

## Gesamtarchitektur

### High-Level-Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Home   │  │Expectation│  │  Upload  │  │ Results  │   │
│  │   Page   │  │   Page    │  │   Page   │  │   Page   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Shared Components (React)                   │  │
│  │  • UploadBox (Drag & Drop)                           │  │
│  │  • ResultCard (Ergebnis-Anzeige)                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/JSON
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Next.js App Router)               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes (Server Actions)                         │  │
│  │  • /api/extract          → PDF-Text-Extraktion       │  │
│  │  • /api/extract-klausur  → Handschrift-OCR           │  │
│  │  • /api/analyze          → KI-Analyse (alt)          │  │
│  │  • /api/grade            → KI-Bewertung (neu)        │  │
│  │  • /api/generate-pdf     → PDF-Generierung (alt)     │  │
│  │  • /api/generate-feedback-pdf → Feedback-PDF (neu)   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ SDK/API
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic (lib/)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   pdf.ts     │  │  openai.ts   │  │ handwritten- │     │
│  │ (gedruckt)   │  │  (Analyse)   │  │   pdf.ts     │     │
│  │              │  │              │  │  (OCR)       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │grade-klausur.│  │grading-schema│  │generate-     │     │
│  │     ts       │  │     .ts      │  │feedback-pdf. │     │
│  │ (Bewertung)  │  │  (Typen)     │  │     ts       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ API
┌─────────────────────────────────────────────────────────────┐
│                   External Services                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  OpenAI API                                          │  │
│  │  • GPT-4o Vision (OCR für Handschrift)              │  │
│  │  • GPT-4o (Bewertung mit JSON Schema)               │  │
│  │  • GPT-4o-mini (Alternative für Analyse)            │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  System Tools                                        │  │
│  │  • Poppler (PDF → PNG Konvertierung)                │  │
│  │  • Sharp (Bildkompression)                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Architektur-Prinzipien

1. **Separation of Concerns**
   - Frontend: Präsentation & User-Interaktion
   - API-Layer: Request-Validierung & Routing
   - Business Logic: Kernfunktionalität isoliert
   - External Services: Abstrahiert über Wrapper

2. **Modularität**
   - Jede Funktion hat eine klare Verantwortung
   - Wiederverwendbare Komponenten
   - Unabhängig testbare Module

3. **Type Safety**
   - TypeScript überall
   - Explizite Interfaces für alle Datenstrukturen
   - JSON Schema für KI-Output-Validierung

4. **Error Handling**
   - Try-Catch auf jeder Ebene
   - Aussagekräftige Fehlermeldungen
   - Logging für Debugging

---

## Technischer Stack & Begründungen

### Frontend

| Technologie | Version | Begründung |
|------------|---------|------------|
| **Next.js** | 14.x | App Router für moderne React-Architektur, SSR/SSG, einfaches API-Routing |
| **React** | 19.2.0 | UI-Bibliothek, Client Components für Interaktivität |
| **TypeScript** | ^5 | Type Safety, bessere DX, weniger Runtime-Fehler |
| **Tailwind CSS** | ^4 | Utility-first CSS, schnelles Styling, responsive Design |

### Backend (integriert in Next.js)

| Technologie | Verwendung | Begründung |
|------------|-----------|------------|
| **Next.js App Router** | API Routes | Unified Framework, keine separate Backend-Infrastruktur |
| **TypeScript** | Überall | Type Safety auch im Backend |

### PDF-Verarbeitung

| Package | Verwendung | Begründung |
|---------|-----------|------------|
| **pdf-lib** | PDF-Generierung | Client-seitig nutzbar, einfache API, volle Kontrolle |
| **node-poppler** | PDF → PNG (Handschrift) | Native PDF-Rendering, hohe Qualität |
| **sharp** | Bildoptimierung | Schnelle Kompression, Größenreduzierung für API |

### KI-Integration

| Package | Verwendung | Begründung |
|---------|-----------|------------|
| **openai** | SDK v6.9.1 | Offizielle SDK, Vision-Support, JSON Schema Support |

### Warum diese Entscheidungen?

1. **Next.js als Full-Stack-Framework**
   - Reduziert Komplexität (ein Framework statt zwei)
   - Deployment auf Vercel einfach
   - API Routes ohne zusätzliche Server

2. **OpenAI Vision für Handschrift**
   - Bessere Qualität als traditionelle OCR (Tesseract)
   - Kontextbewusste Transkription
   - Kosteneffizient für MVP (~$0.20-0.50 pro Klausur)

3. **Zwei PDF-Extraktionswege**
   - **Gedruckt**: Direkte PDF-Parsing über OpenAI API (schnell, günstig)
   - **Handgeschrieben**: PDF → PNG → Vision (langsamer, aber notwendig)

4. **JSON Schema für Bewertung**
   - Garantiert strukturierte Antworten
   - Type-Safe Parsing
   - Konsistente Output-Formate

---

## Datenfluss & Workflow

### Kompletter Workflow (End-to-End)

```
┌─────────────┐
│   Lehrer    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  1. ERWARTUNGSHORIZONT HOCHLADEN                    │
│     • Upload als PDF                                │
│     • Extraktion via /api/extract                   │
│     • Speicherung in localStorage                   │
└─────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  2. KLAUSUR HOCHLADEN                               │
│     • PDF-Upload (gedruckt ODER handgeschrieben)   │
│     • Automatische Erkennung des Typs              │
│     • Text-Extraktion                               │
│       - Gedruckt: /api/extract                      │
│       - Handschrift: /api/extract-klausur          │
└─────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  3. KI-BEWERTUNG                                    │
│     • API-Call: /api/grade                          │
│     • Input:                                        │
│       - expectationHorizon (string)                 │
│       - examText (string)                           │
│       - studentAnswers (string)                     │
│       - gradingRubric (string, optional)            │
│     • OpenAI GPT-4o mit JSON Schema                │
│     • Output: GradingResult (JSON)                  │
└─────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  4. ERGEBNIS-ANZEIGE                                │
│     • Frontend zeigt:                               │
│       - Punkte pro Aufgabe                          │
│       - Gesamtpunktzahl                             │
│       - Note                                        │
│       - Detailliertes Feedback                      │
└─────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  5. FEEDBACK-PDF GENERIEREN                         │
│     • API-Call: /api/generate-feedback-pdf          │
│     • Input: GradingResult + Metadaten              │
│     • PDF-Generierung mit pdf-lib                   │
│     • Download für Lehrer/Schüler                   │
└─────────────────────────────────────────────────────┘
```

### Datenfluss-Details

#### Phase 1: PDF-Upload & Extraktion

```
Frontend (UploadBox)
    │
    ▼
POST /api/extract (gedruckt)
    │
    ├─→ lib/pdf.ts::extractPdfText()
    │     │
    │     ├─→ OpenAI Files API (PDF Upload)
    │     │
    │     └─→ OpenAI Responses API (Text Extraction)
    │
    └─→ JSON { text: string, filename: string, size: number }

ODER

POST /api/extract-klausur (handgeschrieben)
    │
    ├─→ lib/handwritten-pdf.ts::extractHandwrittenPdfText()
    │     │
    │     ├─→ PDF → PNG (Poppler)
    │     │
    │     ├─→ Bildoptimierung (Sharp)
    │     │
    │     ├─→ GPT-4o Vision (pro Seite)
    │     │     │
    │     │     └─→ Transkription
    │     │
    │     └─→ Seiten zusammenfügen
    │
    └─→ JSON { text: string }
```

#### Phase 2: KI-Bewertung

```
Frontend (Results Page)
    │
    ▼
POST /api/grade
    │
    ├─→ Request Validation
    │
    ├─→ lib/grade-klausur.ts::gradeKlausur()
    │     │
    │     ├─→ Prompt-Konstruktion
    │     │     • expectationHorizon
    │     │     • gradingRubric
    │     │     • examText
    │     │     • studentAnswers
    │     │
    │     ├─→ OpenAI Chat Completions API
    │     │     │
    │     │     ├─→ Model: gpt-4o
    │     │     ├─→ Temperature: 0.3 (konsistent)
    │     │     ├─→ JSON Schema (strict mode)
    │     │     │
    │     │     └─→ Response (GradingResult)
    │     │
    │     └─→ JSON Parsing & Validation
    │
    └─→ JSON Response (GradingResult)
```

#### Phase 3: PDF-Generierung

```
Frontend (Results Page)
    │
    ▼
POST /api/generate-feedback-pdf
    │
    ├─→ lib/generate-feedback-pdf.ts::generateFeedbackPdf()
    │     │
    │     ├─→ PDFDocument erstellen (pdf-lib)
    │     │
    │     ├─→ Seiten-Layout berechnen
    │     │
    │     ├─→ Text-Rendering (mit automatischem Seitenumbruch)
    │     │     • Deckblatt
    │     │     • Gesamtbewertung
    │     │     • Detailbewertung pro Aufgabe
    │     │     • Gesamtfeedback
    │     │
    │     └─→ PDF als Uint8Array zurückgeben
    │
    └─→ Binary Response (application/pdf)
```

---

## API-Design

### RESTful API-Endpunkte

#### 1. `/api/extract` (POST)

**Zweck**: Text-Extraktion aus gedruckten PDFs

**Request**:
```typescript
Content-Type: multipart/form-data
FormData:
  - file: File (PDF)
```

**Response**:
```json
{
  "text": string,
  "filename": string,
  "size": number
}
```

**Fehler**:
- `400`: Keine Datei oder falscher Typ
- `500`: Extraktion fehlgeschlagen

---

#### 2. `/api/extract-klausur` (POST)

**Zweck**: OCR für handgeschriebene PDFs

**Request**:
```typescript
Content-Type: application/pdf
Body: Uint8Array (PDF-Daten)
```

**Response**:
```json
{
  "text": string
}
```

**Fehler**:
- `400`: Keine PDF-Daten
- `500`: OCR fehlgeschlagen

---

#### 3. `/api/grade` (POST)

**Zweck**: KI-basierte Klausurbewertung

**Request**:
```json
{
  "expectationHorizon": string,
  "gradingRubric": string,    // optional
  "examText": string,
  "studentAnswers": string
}
```

**Response**:
```json
{
  "tasks": Array<{
    "id": string,
    "points": number,
    "maxPoints": number,
    "analysis": string,
    "errors"?: string,
    "suggestion"?: string
  }>,
  "totalPoints": number,
  "maxPoints": number,
  "grade": string,
  "summary": string
}
```

**Fehler**:
- `400`: Fehlende Eingabedaten
- `500`: Bewertung fehlgeschlagen

---

#### 4. `/api/generate-feedback-pdf` (POST)

**Zweck**: PDF-Generierung mit Feedback

**Request**:
```json
{
  "studentName": string,
  "klausurTitle": string,
  "date": string,
  "gradingResult": GradingResult
}
```

**Response**:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="[studentName]_Bewertung.pdf"
Body: Uint8Array (PDF-Bytes)
```

**Fehler**:
- `400`: Fehlende Eingabedaten
- `500`: PDF-Generierung fehlgeschlagen

---

#### 5. `/api/analyze` (POST) - Legacy

**Zweck**: Alternative Analyse (verwendet gpt-4o-mini)

**Request**:
```json
{
  "klausurText": string,
  "erwartungshorizont": string
}
```

**Response**:
```json
{
  "gesamtpunkte": number,
  "erreichtePunkte": number,
  "prozent": number,
  "aufgaben": Array<{
    "aufgabe": string,
    "maxPunkte": number,
    "erreichtePunkte": number,
    "kommentar": string,
    "korrekturen": string[]
  }>,
  "zusammenfassung": string
}
```

---

### API-Design-Prinzipien

1. **Konsistente Fehlerbehandlung**
   - Alle Fehler als JSON: `{ error: string }`
   - HTTP-Status-Codes: 400 (Client), 500 (Server)

2. **Typisierung**
   - Request/Response-Typen in TypeScript definiert
   - Validierung auf API-Ebene

3. **Logging**
   - Console-Logs für jeden Schritt
   - Fehler-Logging mit Stack-Traces

---

## Datenmodelle & Schemata

### TypeScript Interfaces

#### `GradingResult` (JSON Schema-basiert)

```typescript
export interface GradingResult {
  tasks: Array<{
    id: string;                    // Aufgabennummer, z.B. "1.1"
    points: number;                // Erreichte Punkte
    maxPoints: number;             // Maximal mögliche Punkte
    analysis: string;              // Detaillierte Analyse (required)
    errors?: string;               // Konkrete Fehler
    suggestion?: string;           // Verbesserungsvorschlag
  }>;
  totalPoints: number;             // Gesamtpunktzahl
  maxPoints: number;               // Maximal erreichbare Gesamtpunktzahl
  grade: string;                   // Note, z.B. "2+" oder "2.3"
  summary: string;                 // Verbales Gesamtfeedback (3-5 Sätze)
}
```

**JSON Schema Definition** (für OpenAI):
```typescript
export const gradingSchema = {
  type: "object",
  properties: {
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "Aufgabennummer, z.B. '1.1'" },
          points: { type: "number", description: "Erreichte Punkte" },
          maxPoints: { type: "number", description: "Maximal mögliche Punkte" },
          analysis: { type: "string", description: "Detaillierte Analyse der Schülerantwort" },
          errors: { type: "string", description: "Konkrete Fehler oder Auslassungen" },
          suggestion: { type: "string", description: "Verbesserungsvorschlag für Schüler" }
        },
        required: ["id", "points", "maxPoints", "analysis"]
      }
    },
    totalPoints: { type: "number", description: "Gesamtpunktzahl" },
    maxPoints: { type: "number", description: "Maximal erreichbare Gesamtpunktzahl" },
    grade: { type: "string", description: "Note (z.B. '2+' oder '2.3')" },
    summary: { type: "string", description: "Verbales Gesamtfeedback (3-5 Sätze)" }
  },
  required: ["tasks", "totalPoints", "maxPoints", "grade", "summary"]
} as const;
```

---

#### `GradeKlausurInput`

```typescript
export interface GradeKlausurInput {
  expectationHorizon: string;  // Erwartungshorizont (vollständiger Text)
  gradingRubric: string;       // Bewertungskriterien (optional)
  examText: string;            // Klausuraufgaben (vollständiger Text)
  studentAnswers: string;      // Schülerantworten (extrahiert aus PDF)
}
```

---

#### `GenerateFeedbackPdfInput`

```typescript
export interface GenerateFeedbackPdfInput {
  studentName: string;         // Name des Schülers
  klausurTitle: string;        // Titel der Klausur
  date: string;                // Datum (Format: "DD.MM.YYYY")
  gradingResult: GradingResult; // Bewertungsergebnis
}
```

---

#### `KlausurAnalyse` (Legacy-Format)

```typescript
export interface KlausurAnalyse {
  gesamtpunkte: number;
  erreichtePunkte: number;
  prozent: number;
  aufgaben: Array<{
    aufgabe: string;
    maxPunkte: number;
    erreichtePunkte: number;
    kommentar: string;
    korrekturen: string[];
  }>;
  zusammenfassung: string;
}
```

---

### Datenvalidierung

- **Runtime**: TypeScript-Typen zur Compile-Zeit
- **API-Input**: Validierung in API-Routes (manuelle Checks)
- **KI-Output**: JSON Schema (strict mode) garantiert Format
- **Optional**: Zod-Schema für erweiterte Validierung (nicht implementiert)

---

## Komponenten-Architektur

### Frontend-Komponenten

#### 1. `UploadBox` (`components/UploadBox.tsx`)

**Verantwortung**: Drag & Drop Datei-Upload

**Props**:
```typescript
interface UploadBoxProps {
  onUploadComplete?: (text: string) => void;
  label?: string;
  endpoint?: string;
}
```

**Features**:
- Drag & Drop Interface
- Datei-Auswahl über Button
- Upload-Status (Loading, Success)
- Automatische API-Integration
- Error Handling mit User-Feedback

**Verwendung**:
```typescript
<UploadBox
  label="Erwartungshorizont hochladen"
  endpoint="/api/extract"
  onUploadComplete={(text) => setExpectationHorizon(text)}
/>
```

---

#### 2. `ResultCard` (`components/ResultCard.tsx`)

**Verantwortung**: Anzeige von Bewertungsergebnissen

**Props**:
```typescript
interface ResultCardProps {
  result: GradingResult;
  studentName?: string;
  klausurTitle?: string;
  onDownloadPdf?: () => void;
}
```

**Features**:
- Punkte-Anzeige (pro Aufgabe + gesamt)
- Note-Darstellung
- Detailliertes Feedback
- PDF-Download-Button

---

#### 3. Pages

**`app/page.tsx`** (Home)
- Navigation zu allen Features
- Übersicht über Workflow

**`app/expectation/page.tsx`**
- Upload Erwartungshorizont
- Speicherung in localStorage

**`app/upload/page.tsx`**
- Upload Klausur-PDF
- Automatische Extraktion
- Wahl zwischen gedruckt/handgeschrieben

**`app/results/page.tsx`**
- Anzeige aller hochgeladenen Klausuren
- KI-Bewertung starten
- Ergebnisse anzeigen & PDF generieren

---

### Backend-Komponenten (lib/)

#### 1. `lib/pdf.ts` - Gedruckte PDF-Extraktion

**Funktion**: `extractPdfText(buffer: Buffer): Promise<string>`

**Prozess**:
1. PDF als File-Upload zu OpenAI Files API
2. OpenAI Responses API mit Vision-Model
3. Text-Extraktion direkt aus PDF

**Vorteile**:
- Schnell (ein API-Call)
- Günstig (keine Bildkonvertierung)
- Funktioniert nur bei gedrucktem Text

---

#### 2. `lib/handwritten-pdf.ts` - Handschrift-OCR

**Funktion**: `extractHandwrittenPdfText(uint8: Uint8Array): Promise<string>`

**Prozess**:
1. PDF temporär speichern
2. Poppler: PDF → PNG (pro Seite, 300 DPI)
3. Sharp: Bildoptimierung (max 2000x2000px)
4. Base64-Kodierung
5. GPT-4o Vision (pro Seite): Transkription
6. Seiten zusammenfügen

**Vorteile**:
- Funktioniert bei Handschrift
- Hohe Qualität (GPT-4o Vision)
- Nachteil: Langsam & teurer (pro Seite API-Call)

**Dependencies**:
- `node-poppler`: PDF → PNG
- `sharp`: Bildkompression
- `openai`: Vision API

---

#### 3. `lib/grade-klausur.ts` - KI-Bewertung

**Funktion**: `gradeKlausur(input: GradeKlausurInput): Promise<GradingResult>`

**Prozess**:
1. Prompt-Konstruktion (expectationHorizon + examText + studentAnswers)
2. OpenAI Chat Completions API:
   - Model: `gpt-4o`
   - Temperature: `0.3` (konsistent)
   - JSON Schema (strict mode)
3. JSON Parsing & Type Validation
4. Rückgabe als `GradingResult`

**Prompt-Struktur**:
```
Du bist ein erfahrener Lehrer und bewertest eine Klausur.

## ERWARTUNGSHORIZONT
[...]

## BEWERTUNGSKRITERIEN
[...]

## KLAUSURAUFGABEN
[...]

## SCHÜLERANTWORTEN
[...]

**AUFGABE:**
Bewerte die Schülerantworten exakt nach dem Erwartungshorizont und den Bewertungskriterien.

**WICHTIG:**
- Gib für JEDE Teilaufgabe Punkte, Analyse, Fehler und Verbesserungsvorschläge an
- Sei fair, aber präzise
- Orientiere dich strikt am Erwartungshorizont
- Berechne die Gesamtpunktzahl korrekt
- Vergib eine Note nach deutschem Schulnotensystem (1-6, mit +/-)

**NOTENSKALA:**
- 1 (sehr gut): 95-100%
- 2 (gut): 80-94%
- [...]
```

**Konfiguration**:
- `temperature: 0.3`: Niedrig für konsistente Bewertungen
- `strict: true`: Garantiert Schema-Compliance
- `max_tokens`: Nicht gesetzt (OpenAI wählt automatisch)

---

#### 4. `lib/generate-feedback-pdf.ts` - PDF-Generierung

**Funktion**: `generateFeedbackPdf(input: GenerateFeedbackPdfInput): Promise<Uint8Array>`

**Prozess**:
1. PDFDocument erstellen (pdf-lib)
2. Schriftarten laden (Helvetica, HelveticaBold)
3. Layout-Berechnung (A4: 595.28 × 841.89 pt, Margin: 50 pt)
4. Text-Rendering mit automatischem Seitenumbruch:
   - Deckblatt (Schüler, Klausur, Datum)
   - Gesamtbewertung (Punkte, Note)
   - Detailbewertung (pro Aufgabe)
   - Gesamtfeedback
5. PDF als Uint8Array zurückgeben

**Features**:
- Automatischer Seitenumbruch
- Text-Wrapping (bei zu langen Zeilen)
- Strukturiertes Layout (Trennlinien, Absätze)

**Layout-Struktur**:
```
┌────────────────────────────────────────┐
│  Klausurbewertung                      │
│  ─────────────────────────             │
│  Schüler: [Name]                       │
│  Klausur: [Titel]                      │
│  Datum: [Datum]                        │
│                                        │
│  Gesamtpunkte: X / Y                   │
│  Note: [Note]                          │
│                                        │
│  Detailbewertung:                      │
│  ─────────────────────────             │
│  Aufgabe 1.1                           │
│  Punkte: X / Y                         │
│  Analyse: [...]                        │
│  Fehler: [...]                         │
│  Verbesserung: [...]                   │
│  ─────────────────────────             │
│  [weitere Aufgaben...]                 │
│                                        │
│  Gesamtfeedback:                       │
│  [...]                                 │
└────────────────────────────────────────┘
```

---

#### 5. `lib/grading-schema.ts` - Typen & Schema

**Zweck**: Zentrale Definition von Datenstrukturen

**Exporte**:
- `GradingResult` (TypeScript Interface)
- `gradingSchema` (JSON Schema für OpenAI)

---

#### 6. `lib/openai.ts` - OpenAI Client (Legacy)

**Funktion**: `analyzeKlausur(klausurText, erwartungshorizont): Promise<KlausurAnalyse>`

**Zweck**: Alternative Bewertung mit `gpt-4o-mini` (günstiger, aber weniger präzise)

**Verwendung**: Kann für einfachere Analysen verwendet werden

---

## KI-Integration (OpenAI)

### Modelle & Verwendung

#### 1. GPT-4o Vision (OCR)

**Verwendung**: Handschrift-Transkription

**API-Call**:
```typescript
await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{
    role: "user",
    content: [
      { type: "text", text: "Transkribiere den gesamten handgeschriebenen Text..." },
      { type: "image_url", image_url: { url: `data:image/png;base64,${base64Image}` } }
    ]
  }],
  max_tokens: 4096
});
```

**Kosten**: ~$0.01-0.03 pro Seite

**Parameter**:
- `max_tokens: 4096`: Genug für eine Seite Text

---

#### 2. GPT-4o (Bewertung)

**Verwendung**: Hauptbewertung mit strukturiertem Output

**API-Call**:
```typescript
await client.chat.completions.create({
  model: "gpt-4o",
  messages: [...],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "klausur_bewertung",
      schema: gradingSchema,
      strict: true
    }
  },
  temperature: 0.3
});
```

**Kosten**: ~$0.10-0.20 pro Klausur

**Parameter**:
- `temperature: 0.3`: Niedrig für konsistente Bewertungen
- `strict: true`: Garantiert Schema-Compliance

---

#### 3. GPT-4o-mini (Alternative Analyse)

**Verwendung**: Legacy-Analyse (einfacher, aber weniger präzise)

**API-Call**:
```typescript
await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [...],
  temperature: 0.3,
  response_format: { type: "json_object" }
});
```

**Kosten**: ~$0.05-0.10 pro Klausur (günstiger)

---

### Prompt-Engineering

#### Bewertungs-Prompt-Struktur

**Komponenten**:
1. **System-Message**: Rolle des LLM (Lehrer, präzise, fair)
2. **Context**: Erwartungshorizont, Bewertungskriterien, Aufgaben, Antworten
3. **Instructions**: Präzise Anweisungen zur Bewertung
4. **Notenskala**: Explizite Definition der Notenvergabe

**Best Practices**:
- Klare Strukturierung mit Markdown
- Explizite Anweisungen ("Gib für JEDE Teilaufgabe...")
- Beispiele (Notenskala)
- Fokus auf Präzision ("strikt am Erwartungshorizont")

---

### Kosten-Optimierung

**Typische Kosten pro Klausur**:
- Handschrift-OCR (3 Seiten): $0.20-0.50
- Bewertung (GPT-4o): $0.10-0.20
- **Gesamt: ~$0.30-0.70 pro Klausur**

**Optimierungen**:
1. Bildkompression (Sharp) reduziert Token-Verbrauch
2. GPT-4o-mini für einfachere Analysen
3. Caching von Erwartungshorizonten (nicht implementiert)

---

## PDF-Verarbeitung

### Zwei Wege: Gedruckt vs. Handgeschrieben

#### Weg 1: Gedruckte PDFs (`lib/pdf.ts`)

**Vorgehen**:
1. PDF direkt zu OpenAI Files API hochladen
2. OpenAI Responses API extrahiert Text direkt

**Vorteile**:
- ✅ Schnell (ein API-Call)
- ✅ Günstig
- ✅ Keine lokale Verarbeitung nötig

**Nachteile**:
- ❌ Funktioniert nicht bei Handschrift

**Code**:
```typescript
const uploadFile = new File([uint8Array], 'klausur.pdf', { type: 'application/pdf' });
const uploaded = await client.files.create({
  file: uploadFile as Uploadable,
  purpose: 'assistants',
});

const response = await client.responses.create({
  model: 'gpt-4.1',
  input: [{
    role: 'user',
    content: [
      { type: 'input_text', text: EXTRACTION_PROMPT },
      { type: 'input_file', file_id: uploaded.id }
    ]
  }]
});
```

---

#### Weg 2: Handgeschriebene PDFs (`lib/handwritten-pdf.ts`)

**Vorgehen**:
1. PDF → PNG (Poppler, 300 DPI)
2. Bildoptimierung (Sharp, max 2000×2000px)
3. Base64-Kodierung
4. GPT-4o Vision (pro Seite)
5. Seiten zusammenfügen

**Vorteile**:
- ✅ Funktioniert bei Handschrift
- ✅ Hohe Qualität (GPT-4o Vision)

**Nachteile**:
- ❌ Langsam (pro Seite API-Call)
- ❌ Teurer

**Code**:
```typescript
// PDF → PNG
await poppler.pdfToCairo(pdfPath, outputPath, {
  pngFile: true,
  singleFile: true,
  firstPageToConvert: pageNum,
  lastPageToConvert: pageNum,
  resolutionXYAxis: 300
});

// Bildoptimierung
const compressedBuffer = await sharp(imageBuffer)
  .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
  .png({ quality: 90 })
  .toBuffer();

// Vision OCR
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Transkribiere den gesamten handgeschriebenen Text...' },
      { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } }
    ]
  }],
  max_tokens: 4096
});
```

---

### PDF-Generierung (`lib/generate-feedback-pdf.ts`)

**Library**: `pdf-lib`

**Prozess**:
1. Neues PDFDocument erstellen
2. Schriftarten laden (Helvetica, HelveticaBold)
3. Seiten hinzufügen (automatisch bei Bedarf)
4. Text rendern mit automatischem Wrapping
5. PDF speichern als Uint8Array

**Features**:
- Automatischer Seitenumbruch
- Text-Wrapping (bei zu langen Zeilen)
- Strukturiertes Layout

**Layout**:
- A4 (595.28 × 841.89 pt)
- Margin: 50 pt
- Zeilenabstand: 1.5 × Font-Size

---

## Designentscheidungen

### Warum Next.js?

1. **Full-Stack Framework**
   - Frontend + Backend in einem Projekt
   - Keine separate Server-Infrastruktur
   - Einfaches Deployment (Vercel)

2. **App Router**
   - Moderne React-Architektur
   - Server Components für Performance
   - API Routes integriert

3. **TypeScript**
   - Type Safety überall
   - Bessere DX (Autocomplete, Refactoring)
   - Weniger Runtime-Fehler

---

### Warum zwei PDF-Extraktionswege?

**Problem**: Gedruckte PDFs können direkt geparst werden, Handschrift benötigt OCR.

**Lösung**: Automatische Erkennung oder explizite Wahl durch User.

**Implementierung**:
- `/api/extract`: Gedruckt (schnell, günstig)
- `/api/extract-klausur`: Handschrift (langsam, teurer)

**Alternative**: Automatische Erkennung könnte implementiert werden (z.B. über erste Seite prüfen).

---

### Warum JSON Schema für Bewertung?

**Vorteile**:
1. **Type Safety**: Garantiert strukturierte Antworten
2. **Strict Mode**: OpenAI validiert Output
3. **Konsistenz**: Immer gleiches Format
4. **Fehlervermeidung**: Keine Parsing-Fehler durch fehlende Felder

**Nachteil**:
- Weniger Flexibilität (aber für MVP OK)

---

### Warum localStorage statt Datenbank?

**MVP-Entscheidung**:
- Schnell zu implementieren
- Keine externe Infrastruktur nötig
- Für Tests ausreichend

**Nachteile**:
- Daten nur lokal (keine Synchronisation)
- Begrenzte Speicherkapazität
- Keine Persistenz über Browser hinweg

**Erweiterung**:
- Supabase, PostgreSQL oder MongoDB für Production

---

### Warum zwei Bewertungs-APIs (`/api/analyze` vs `/api/grade`)?

**Geschichte**:
- `/api/analyze`: Erstes MVP mit `gpt-4o-mini` und einfacherem Schema
- `/api/grade`: Verbesserte Version mit `gpt-4o` und JSON Schema

**Aktueller Status**:
- `/api/grade` ist die empfohlene Route
- `/api/analyze` bleibt für Kompatibilität

---

## Komponenten für Google AI Studio

### Überblick: Welche Komponenten können übernommen werden?

Die folgenden Komponenten sind **unabhängig** von OpenAI und können in Google AI Studio (Gemini) übernommen werden:

#### ✅ Übernehmbar (ohne Änderungen)

1. **Frontend-Komponenten**
   - `UploadBox.tsx` (UI-Komponente, keine AI-Abhängigkeit)
   - `ResultCard.tsx` (UI-Komponente)
   - Alle Pages (UI-Logik)

2. **PDF-Verarbeitung**
   - `lib/generate-feedback-pdf.ts` (PDF-Generierung, keine AI)
   - `lib/grading-schema.ts` (nur Typen/Schema)

3. **API-Struktur**
   - Request/Response-Formate
   - Error Handling Pattern

---

#### 🔄 Anpassbar (AI-Service ersetzen)

1. **PDF-Extraktion**
   - `lib/pdf.ts` → Anpassung für Gemini Vision API
   - `lib/handwritten-pdf.ts` → Anpassung für Gemini Vision API

2. **KI-Bewertung**
   - `lib/grade-klausur.ts` → Anpassung für Gemini API
   - `lib/openai.ts` → Ersetzen durch `lib/gemini.ts`

3. **API-Routes**
   - `/api/extract` → Gemini Vision API verwenden
   - `/api/extract-klausur` → Gemini Vision API verwenden
   - `/api/grade` → Gemini API mit JSON Schema verwenden

---

### Migration-Guide: OpenAI → Gemini

#### 1. PDF-Extraktion (Gedruckt)

**OpenAI (aktuell)**:
```typescript
const uploadFile = new File([uint8Array], 'klausur.pdf', { type: 'application/pdf' });
const uploaded = await client.files.create({ file: uploadFile, purpose: 'assistants' });
const response = await client.responses.create({ model: 'gpt-4.1', input: [...] });
```

**Gemini (angepasst)**:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// PDF als Base64 oder File-Handle
const result = await model.generateContent([
  { text: 'Extrahiere den vollständigen Text aus dieser PDF...' },
  { fileData: { mimeType: 'application/pdf', data: base64Pdf } }
]);
```

---

#### 2. Handschrift-OCR

**OpenAI (aktuell)**:
```typescript
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'Transkribiere...' },
      { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } }
    ]
  }]
});
```

**Gemini (angepasst)**:
```typescript
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-vision' });

const result = await model.generateContent([
  { text: 'Transkribiere den gesamten handgeschriebenen Text...' },
  { inlineData: { mimeType: 'image/png', data: base64Image } }
]);

const text = result.response.text();
```

---

#### 3. KI-Bewertung

**OpenAI (aktuell)**:
```typescript
const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [...],
  response_format: {
    type: 'json_schema',
    json_schema: { name: 'klausur_bewertung', schema: gradingSchema, strict: true }
  },
  temperature: 0.3
});
```

**Gemini (angepasst)**:
```typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro',
  generationConfig: {
    temperature: 0.3,
    responseMimeType: 'application/json',
    responseSchema: gradingSchema  // JSON Schema
  }
});

const result = await model.generateContent([prompt]);
const gradingResult = JSON.parse(result.response.text()) as GradingResult;
```

**Hinweis**: Gemini unterstützt JSON Schema (Function Calling), aber die Syntax kann leicht abweichen.

---

### Neue Dateien für Gemini-Migration

#### `lib/gemini.ts` (Neu)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

let cachedClient: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API Key nicht konfiguriert');
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return cachedClient;
}

export async function extractPdfTextGemini(buffer: Buffer): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  
  const base64Pdf = buffer.toString('base64');
  
  const result = await model.generateContent([
    { text: 'Extrahiere den vollständigen Text aus dieser PDF-Datei. Gib nur Text zurück, ohne Analyse.' },
    { fileData: { mimeType: 'application/pdf', data: base64Pdf } }
  ]);
  
  return result.response.text();
}

export async function extractHandwrittenPdfTextGemini(uint8: Uint8Array): Promise<string> {
  // Ähnlich wie OpenAI-Version, aber mit Gemini Vision API
  // ...
}

export async function gradeKlausurGemini(input: GradeKlausurInput): Promise<GradingResult> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-pro',
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
      responseSchema: gradingSchema
    }
  });
  
  const prompt = `...`; // Gleicher Prompt wie OpenAI-Version
  
  const result = await model.generateContent([prompt]);
  return JSON.parse(result.response.text()) as GradingResult;
}
```

---

### Abhängigkeiten-Änderung

**package.json** (Anpassung):
```json
{
  "dependencies": {
    "@google/generative-ai": "^latest",
    // "openai": "^6.9.1" → Entfernen
  }
}
```

**Installation**:
```bash
npm install @google/generative-ai
npm uninstall openai
```

---

### Environment-Variablen

**.env.local** (Anpassung):
```env
# OPENAI_API_KEY=...  → Entfernen
GEMINI_API_KEY=your-gemini-api-key
```

---

## Integration Patterns

### 1. API-Route Pattern

**Struktur**:
```typescript
// app/api/[route]/route.ts
import { NextResponse } from 'next/server';
import { businessLogic } from '@/lib/...';

export async function POST(req: Request) {
  try {
    // 1. Request-Validierung
    const data = await req.json();
    if (!data.requiredField) {
      return NextResponse.json({ error: 'Fehlende Eingabedaten' }, { status: 400 });
    }

    // 2. Business Logic
    const result = await businessLogic(data);

    // 3. Response
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[Route] error:', error);
    return NextResponse.json(
      { error: 'Fehler' },
      { status: 500 }
    );
  }
}
```

---

### 2. Library-Funktion Pattern

**Struktur**:
```typescript
// lib/[module].ts
import { ExternalService } from '...';

export async function businessFunction(input: InputType): Promise<OutputType> {
  try {
    console.log('Starte [Funktion]...');
    
    // 1. Validierung
    if (!input.required) {
      throw new Error('Ungültige Eingabe');
    }

    // 2. External Service Call
    const result = await externalService.call(input);

    // 3. Transformation
    const transformed = transform(result);

    console.log('[Funktion] erfolgreich');
    return transformed;
  } catch (err) {
    console.error('[Funktion] error:', err);
    throw new Error(`[Funktion] fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
  }
}
```

---

### 3. Frontend-Component Pattern

**Struktur**:
```typescript
'use client';

import { useState } from 'react';

export default function Component({ onComplete }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* data */ })
      });
      
      if (!response.ok) throw new Error('Fehler');
      
      const result = await response.json();
      onComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

---

### 4. Error Handling Pattern

**Konsistente Fehlerbehandlung**:
- API: JSON `{ error: string }` + HTTP-Status
- Library: `throw new Error(...)` mit aussagekräftiger Message
- Frontend: Error-State + User-Feedback

---

## Zusammenfassung

### Kern-Architektur

1. **Frontend**: Next.js 14 mit React & TypeScript
2. **Backend**: Next.js API Routes (integriert)
3. **PDF-Verarbeitung**: Zwei Wege (gedruckt vs. handgeschrieben)
4. **KI-Integration**: OpenAI GPT-4o für OCR & Bewertung
5. **PDF-Generierung**: pdf-lib für Feedback-PDFs

### Übernahme in Google AI Studio

**Unverändert**:
- Frontend-Komponenten (UI)
- PDF-Generierung
- API-Struktur & Patterns

**Anpassbar**:
- AI-Service-Wrapper (OpenAI → Gemini)
- API-Calls (SDK-Wechsel)
- Environment-Variablen

**Neue Dateien**:
- `lib/gemini.ts` (Gemini-Client)
- Optional: `lib/pdf-gemini.ts`, `lib/handwritten-pdf-gemini.ts`

### Nächste Schritte

1. Gemini SDK installieren
2. `lib/gemini.ts` implementieren
3. API-Routes anpassen (OpenAI → Gemini)
4. Environment-Variablen aktualisieren
5. Tests durchführen

---

**Dokument erstellt für**: Komponenten-Übernahme in Google AI Studio  
**Version**: 1.0  
**Datum**: $(date)

