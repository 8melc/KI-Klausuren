# KI-Klausur-Korrektur MVP - Implementierungsleitfaden

## Projektkontext
**Ziel:** Automatische Korrektur von handgeschriebenen Schülerklausuren mit KI-Unterstützung.

**Tech-Stack:**
- Next.js 16 + Turbopack
- OpenAI GPT-4o (API v6.9.1)
- TypeScript
- unpdf (für gedruckte PDFs)
- pdf-lib (für PDF-Generierung)

---

## TEIL 1: Handschriftliche Klausuren verarbeiten

### Problem
`unpdf` kann nur gedruckten Text extrahieren. Handgeschriebene Klausuren benötigen OCR (Optical Character Recognition).

### Lösung: GPT-4o Vision API

GPT-4o kann Bilder analysieren und Handschrift transkribieren. PDFs müssen erst in Bilder umgewandelt werden.

---

### 1.1 Implementierung: PDF → Bilder → GPT-4o

**Benötigte Packages:**
```bash
npm install pdf-to-png-converter openai
```

**Erstelle: `lib/handwritten-pdf.ts`**

```typescript
import OpenAI from 'openai';
import { pdfToPng } from 'pdf-to-png-converter';

export async function extractHandwrittenPdfText(uint8: Uint8Array): Promise<string> {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    // SCHRITT 1: PDF → PNG-Bilder konvertieren
    const pngPages = await pdfToPng(Buffer.from(uint8), {
      outputType: 'buffer',
      disableFontFace: false,
      viewportScale: 2.0  // Höhere Auflösung für bessere OCR
    });

    console.log(`${pngPages.length} Seiten gefunden`);

    // SCHRITT 2: Jede Seite einzeln an GPT-4o schicken
    const pageTexts: string[] = [];

    for (let i = 0; i < pngPages.length; i++) {
      const page = pngPages[i];
      const base64Image = page.content.toString('base64');

      console.log(`Verarbeite Seite ${i + 1}/${pngPages.length}...`);

      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Transkribiere den gesamten handgeschriebenen Text auf dieser Klausurseite. Behalte die Struktur bei (Aufgabennummern, Absätze). Gib nur den reinen Text zurück."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 4096
      });

      const pageText = response.choices[0]?.message?.content || "";
      pageTexts.push(`--- SEITE ${i + 1} ---\n${pageText}`);
    }

    // SCHRITT 3: Alle Seiten zusammenfügen
    return pageTexts.join('\n\n');

  } catch (err) {
    console.error("Handwritten PDF extraction error:", err);
    throw new Error(`Handschrift-Extraktion fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
  }
}
```

**Erstelle: `app/api/extract-klausur/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { extractHandwrittenPdfText } from "@/lib/handwritten-pdf";

export async function POST(req: Request) {
  try {
    const arrayBuffer = await req.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    if (uint8.length === 0) {
      return NextResponse.json(
        { error: "Keine PDF-Daten im Request-Body gefunden" },
        { status: 400 }
      );
    }

    console.log("Starte Handschrift-Extraktion...");
    const text = await extractHandwrittenPdfText(uint8);
    console.log("Extraktion erfolgreich:", text.length, "Zeichen");

    return NextResponse.json({ text }, { status: 200 });
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json(
      { error: "Handschrift-Extraktion fehlgeschlagen" },
      { status: 500 }
    );
  }
}
```

**Wichtig:** 
- GPT-4o kostet ca. $0.01-0.03 pro Seite (je nach Token-Verbrauch)
- Bei 30 Klausuren × 3 Seiten = 90 API-Calls → ca. $1-3
- Für MVP absolut vertretbar

---

### 1.2 Alternative: Tesseract OCR (kostenlos, aber schlechter)

Falls Budget ein Problem ist:

```bash
npm install tesseract.js pdf-to-png-converter
```

```typescript
import Tesseract from 'tesseract.js';
import { pdfToPng } from 'pdf-to-png-converter';

export async function extractHandwrittenPdfTextOCR(uint8: Uint8Array): Promise<string> {
  const pngPages = await pdfToPng(Buffer.from(uint8), {
    outputType: 'buffer',
    viewportScale: 2.0
  });

  const pageTexts: string[] = [];

  for (const page of pngPages) {
    const { data: { text } } = await Tesseract.recognize(
      page.content,
      'deu',  // Deutsch
      { logger: m => console.log(m) }
    );
    pageTexts.push(text);
  }

  return pageTexts.join('\n\n');
}
```

**Nachteil:** Tesseract ist schlecht bei Handschrift. Empfehlung: GPT-4o.

---

## TEIL 2: STEP 3 - KI-Analyse + Bewertung

### Konzept
Der Server schickt an GPT-4o:
1. Erwartungshorizont
2. Bewertungskriterien
3. Klausuraufgaben
4. Schülerantworten
5. JSON-Schema für strukturierte Antwort

GPT-4o gibt zurück: Punkte, Analyse, Feedback pro Aufgabe.

---

### 2.1 JSON-Schema für Bewertung

**Erstelle: `lib/grading-schema.ts`**

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
};

export interface GradingResult {
  tasks: Array<{
    id: string;
    points: number;
    maxPoints: number;
    analysis: string;
    errors?: string;
    suggestion?: string;
  }>;
  totalPoints: number;
  maxPoints: number;
  grade: string;
  summary: string;
}
```

---

### 2.2 KI-Bewertung implementieren

**Erstelle: `lib/grade-klausur.ts`**

```typescript
import OpenAI from 'openai';
import { GradingResult, gradingSchema } from './grading-schema';

interface GradeKlausurInput {
  expectationHorizon: string;  // Erwartungshorizont
  gradingRubric: string;       // Bewertungskriterien
  examText: string;            // Klausuraufgaben
  studentAnswers: string;      // Schülerantworten (extrahiert)
}

export async function gradeKlausur(input: GradeKlausurInput): Promise<GradingResult> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const prompt = `Du bist ein erfahrener Lehrer und bewertest eine Klausur.

## ERWARTUNGSHORIZONT
${input.expectationHorizon}

## BEWERTUNGSKRITERIEN
${input.gradingRubric}

## KLAUSURAUFGABEN
${input.examText}

## SCHÜLERANTWORTEN
${input.studentAnswers}

---

**AUFGABE:**
Bewerte die Schülerantworten exakt nach dem Erwartungshorizont und den Bewertungskriterien.

**WICHTIG:**
- Gib für JEDE Teilaufgabe Punkte, Analyse, Fehler und Verbesserungsvorschläge an
- Sei fair, aber präzise
- Orientiere dich strikt am Erwartungshorizont
- Berechne die Gesamtpunktzahl korrekt
- Vergib eine Note nach deutschem Schulnotensystem (1-6, mit +/-)

**NOTENSKALA (Beispiel - passe an deine Vorgaben an):**
- 1 (sehr gut): 95-100%
- 2 (gut): 80-94%
- 3 (befriedigend): 65-79%
- 4 (ausreichend): 50-64%
- 5 (mangelhaft): 30-49%
- 6 (ungenügend): 0-29%

Gib deine Bewertung als strukturiertes JSON zurück.`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Du bist ein präziser, fairer Lehrer. Du bewertest Klausuren nach vorgegebenen Kriterien und gibst strukturiertes Feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "klausur_bewertung",
          schema: gradingSchema,
          strict: true
        }
      },
      temperature: 0.3  // Niedrig für konsistente Bewertung
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as GradingResult;

  } catch (err) {
    console.error("Grading error:", err);
    throw new Error(`Bewertung fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
  }
}
```

**Erstelle: `app/api/grade/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { gradeKlausur } from "@/lib/grade-klausur";

export async function POST(req: Request) {
  try {
    const { expectationHorizon, gradingRubric, examText, studentAnswers } = await req.json();

    // Validierung
    if (!expectationHorizon || !examText || !studentAnswers) {
      return NextResponse.json(
        { error: "Fehlende Eingabedaten" },
        { status: 400 }
      );
    }

    console.log("Starte Bewertung...");
    const result = await gradeKlausur({
      expectationHorizon,
      gradingRubric: gradingRubric || "",
      examText,
      studentAnswers
    });

    console.log("Bewertung abgeschlossen:", result.totalPoints, "/", result.maxPoints);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Grading error:", error);
    return NextResponse.json(
      { error: "Bewertung fehlgeschlagen" },
      { status: 500 }
    );
  }
}
```

---

## TEIL 3: STEP 4 - PDF-Generierung mit Korrektur

### Ziel
Aus dem Bewertungs-JSON ein professionelles PDF erstellen mit:
- Deckblatt mit Schülerdaten
- Punkteübersicht
- Detailliertes Feedback pro Aufgabe
- Verbales Gesamturteil

---

### 3.1 PDF-Generierung implementieren

**Benötigte Packages:**
```bash
npm install pdf-lib
```

**Erstelle: `lib/generate-feedback-pdf.ts`**

```typescript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { GradingResult } from './grading-schema';

interface GenerateFeedbackPdfInput {
  studentName: string;
  klausurTitle: string;
  date: string;
  gradingResult: GradingResult;
}

export async function generateFeedbackPdf(input: GenerateFeedbackPdfInput): Promise<Uint8Array> {
  // Neues PDF erstellen
  const pdfDoc = await PDFDocument.create();
  
  // Schriftarten laden
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pageWidth = 595.28;  // A4
  const pageHeight = 841.89;
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;
  
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  // Helper-Funktion: Text mit automatischem Seitenumbruch
  const drawText = (text: string, fontSize: number, bold: boolean = false, color = rgb(0, 0, 0)) => {
    const currentFont = bold ? fontBold : font;
    const lines = text.split('\n');
    
    for (const line of lines) {
      // Prüfen ob neue Seite nötig
      if (yPosition < margin + 50) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
      }
      
      currentPage.drawText(line, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: currentFont,
        color: color,
        maxWidth: contentWidth
      });
      
      yPosition -= fontSize * 1.5;
    }
  };
  
  // DECKBLATT
  drawText('Klausurbewertung', 24, true);
  yPosition -= 10;
  drawText('─'.repeat(50), 10);
  yPosition -= 20;
  
  drawText(`Schüler/in: ${input.studentName}`, 14, true);
  yPosition -= 5;
  drawText(`Klausur: ${input.klausurTitle}`, 12);
  yPosition -= 5;
  drawText(`Datum: ${input.date}`, 12);
  yPosition -= 30;
  
  // GESAMTBEWERTUNG (hervorgehoben)
  drawText('GESAMTERGEBNIS', 16, true);
  yPosition -= 10;
  
  const percentage = Math.round((input.gradingResult.totalPoints / input.gradingResult.maxPoints) * 100);
  drawText(
    `${input.gradingResult.totalPoints} / ${input.gradingResult.maxPoints} Punkte (${percentage}%)`,
    14,
    false,
    rgb(0, 0.4, 0.8)
  );
  yPosition -= 5;
  drawText(`Note: ${input.gradingResult.grade}`, 14, true, rgb(0, 0.4, 0.8));
  yPosition -= 30;
  
  // GESAMTFEEDBACK
  drawText('Gesamteinschätzung', 14, true);
  yPosition -= 10;
  drawText(input.gradingResult.summary, 11);
  yPosition -= 30;
  
  // DETAILBEWERTUNG
  drawText('Detailbewertung nach Aufgaben', 16, true);
  yPosition -= 20;
  
  for (const task of input.gradingResult.tasks) {
    // Prüfen ob neue Seite nötig
    if (yPosition < margin + 150) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      yPosition = pageHeight - margin;
    }
    
    // Aufgabennummer + Punkte
    drawText(`Aufgabe ${task.id}`, 13, true);
    yPosition -= 5;
    drawText(`${task.points} / ${task.maxPoints} Punkte`, 11, false, rgb(0.2, 0.2, 0.2));
    yPosition -= 10;
    
    // Analyse
    drawText('Analyse:', 11, true);
    yPosition -= 5;
    drawText(task.analysis, 10);
    yPosition -= 10;
    
    // Fehler (falls vorhanden)
    if (task.errors) {
      drawText('Fehler:', 11, true, rgb(0.8, 0, 0));
      yPosition -= 5;
      drawText(task.errors, 10);
      yPosition -= 10;
    }
    
    // Verbesserungsvorschlag (falls vorhanden)
    if (task.suggestion) {
      drawText('Verbesserungsvorschlag:', 11, true, rgb(0, 0.6, 0));
      yPosition -= 5;
      drawText(task.suggestion, 10);
      yPosition -= 10;
    }
    
    // Trennlinie
    yPosition -= 5;
    drawText('─'.repeat(60), 8, false, rgb(0.7, 0.7, 0.7));
    yPosition -= 15;
  }
  
  // PDF als Uint8Array zurückgeben
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
```

**Erstelle: `app/api/generate-feedback-pdf/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { generateFeedbackPdf } from "@/lib/generate-feedback-pdf";

export async function POST(req: Request) {
  try {
    const { studentName, klausurTitle, date, gradingResult } = await req.json();

    if (!studentName || !klausurTitle || !gradingResult) {
      return NextResponse.json(
        { error: "Fehlende Eingabedaten" },
        { status: 400 }
      );
    }

    console.log("Generiere Feedback-PDF...");
    const pdfBytes = await generateFeedbackPdf({
      studentName,
      klausurTitle,
      date: date || new Date().toLocaleDateString('de-DE'),
      gradingResult
    });

    console.log("PDF erfolgreich generiert:", pdfBytes.length, "bytes");

    // PDF als Download zurückgeben
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${studentName}_Bewertung.pdf"`
      }
    });

  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "PDF-Generierung fehlgeschlagen" },
      { status: 500 }
    );
  }
}
```

---

## TEIL 4: Integration - Der komplette Workflow

### 4.1 Frontend-Integration

**Erstelle: `app/grading/page.tsx`** (Beispiel-Page für kompletten Flow)

```typescript
'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';

export default function GradingPage() {
  const [expectationHorizon, setExpectationHorizon] = useState('');
  const [examText, setExamText] = useState('');
  const [studentAnswers, setStudentAnswers] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGrade = async () => {
    setIsGrading(true);
    try {
      // STEP 1: Bewertung anfordern
      const gradeResponse = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expectationHorizon,
          gradingRubric: '',
          examText,
          studentAnswers
        })
      });

      if (!gradeResponse.ok) throw new Error('Bewertung fehlgeschlagen');
      
      const gradingResult = await gradeResponse.json();
      setResult(gradingResult);

      // STEP 2: PDF generieren
      const pdfResponse = await fetch('/api/generate-feedback-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: 'Max Mustermann',  // TODO: Aus Form holen
          klausurTitle: 'Chemie Klausur',  // TODO: Aus Form holen
          date: new Date().toLocaleDateString('de-DE'),
          gradingResult
        })
      });

      if (!pdfResponse.ok) throw new Error('PDF-Generierung fehlgeschlagen');

      // PDF herunterladen
      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Bewertung.pdf';
      a.click();

    } catch (error) {
      console.error('Error:', error);
      alert('Fehler bei der Bewertung');
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">KI-Klausur-Korrektur</h1>

      <div className="space-y-6">
        {/* Upload Erwartungshorizont */}
        <UploadBox
          label="Erwartungshorizont hochladen"
          onUploadComplete={setExpectationHorizon}
        />

        {/* Upload Klausuraufgaben */}
        <UploadBox
          label="Klausuraufgaben hochladen"
          onUploadComplete={setExamText}
        />

        {/* Upload Schülerklausur (handgeschrieben) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Schülerklausur hochladen (handgeschrieben)
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              // Upload zur Handschrift-Route
              const response = await fetch('/api/extract-klausur', {
                method: 'POST',
                headers: { 'Content-Type': 'application/pdf' },
                body: file
              });

              const data = await response.json();
              setStudentAnswers(data.text);
            }}
            className="block w-full text-sm"
          />
        </div>

        {/* Bewertung starten */}
        <button
          onClick={handleGrade}
          disabled={!expectationHorizon || !examText || !studentAnswers || isGrading}
          className="w-full bg-blue-500 text-white py-3 rounded-lg disabled:opacity-50"
        >
          {isGrading ? 'Bewerte...' : 'Klausur bewerten'}
        </button>

        {/* Ergebnis anzeigen */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Bewertung abgeschlossen</h2>
            <p className="text-lg">
              <strong>Punkte:</strong> {result.totalPoints} / {result.maxPoints}
            </p>
            <p className="text-lg">
              <strong>Note:</strong> {result.grade}
            </p>
            <p className="mt-4">{result.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## TEIL 5: Wichtige Hinweise & Best Practices

### 5.1 Kosten-Optimierung

**GPT-4o Preise (Stand 2024):**
- Input: $2.50 / 1M Tokens
- Output: $10.00 / 1M Tokens

**Typische Kosten pro Klausur:**
- Handschrift-OCR (3 Seiten): ~$0.20-0.50
- Bewertung: ~$0.10-0.20
- **Gesamt: ~$0.30-0.70 pro Klausur**

**Bei 30 Schülern:** ~$9-21 → Für MVP absolut okay!

---

### 5.2 Error-Handling

**Wichtig:** Alle API-Calls können fehlschlagen. Implementiere Retry-Logik:

```typescript
async function retryApiCall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Retry ${i + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
}
```

---

### 5.3 Rate Limits

OpenAI API hat Rate Limits:
- **Tier 1:** 500 RPM (Requests per Minute)
- **Tier 2:** 5000 RPM

**Für 30 Klausuren gleichzeitig:** Implementiere Queue-System oder Batch-Processing.

---

### 5.4 Qualitätssicherung

**Prompt-Optimierung ist kritisch!**

Best Practices:
1. **Konkrete Beispiele** im Prompt geben
2. **Bewertungskriterien** explizit nennen
3. **Temperature niedrig halten** (0.2-0.4) für Konsistenz
4. **Few-Shot Examples** hinzufügen (falls Bewertung inkonsistent)

---

## TEIL 6: Testing & Debugging

### 6.1 Test-Workflow

**1. Teste jede Komponente einzeln:**

```bash
# Terminal 1: Dev Server
npm run dev

# Terminal 2: Test Handschrift-Extraktion
curl -X POST http://localhost:3000/api/extract-klausur \
  -H "Content-Type: application/pdf" \
  --data-binary "@test-klausur.pdf"

# Terminal 3: Test Bewertung
curl -X POST http://localhost:3000/api/grade \
  -H "Content-Type: application/json" \
  -d @test-data.json
```

**2. Prüfe Logs:**
```typescript
console.log("Extrahierter Text:", studentAnswers.substring(0, 200));
console.log("Anzahl Zeichen:", studentAnswers.length);
console.log("Bewertungs-Prompt-Länge:", prompt.length);
```

---

### 6.2 Häufige Fehler & Lösungen

| Fehler | Ursache | Lösung |
|--------|---------|--------|
| "1 Zeichen extrahiert" | unpdf bei Handschrift | Nutze GPT-4o Vision statt unpdf |
| 413 Request Too Large | PDF zu groß | Komprimiere PDF oder teile in Chunks |
| 429 Rate Limit | Zu viele API-Calls | Implementiere Queue/Delay |
| Inkonsistente Bewertung | Temperature zu hoch | Setze temperature: 0.3 |
| PDF-Generation langsam | Zu viel Text | Paginiere oder kürze Feedback |

---

## TEIL 7: Nächste Schritte (Post-MVP)

### Später hinzufügen:
1. **Multi-Schüler-Upload** (Batch-Processing)
2. **Dashboard** für alle Schüler
3. **Excel-Export** der Ergebnisse
4. **Notenskala-Konfiguration**
5. **Direkte PDF-Annotation** (Markierungen im Original-PDF)
6. **Lehrer-Feedback-Loop** (KI-Vorschläge manuell anpassen)

---

## ZUSAMMENFASSUNG: Die 4 kritischen Dateien

```
lib/
  ├── handwritten-pdf.ts        # GPT-4o Vision OCR
  ├── grade-klausur.ts          # KI-Bewertung
  ├── generate-feedback-pdf.ts  # PDF-Generierung
  └── grading-schema.ts         # TypeScript-Typen

app/api/
  ├── extract-klausur/route.ts  # Handschrift → Text
  ├── grade/route.ts            # Bewertung
  └── generate-feedback-pdf/route.ts  # PDF-Download
```

---

## CHECKLISTE für Codex/ChatGPT

Wenn du das an ChatGPT gibst, sage:

> "Implementiere EXAKT diese 4 Dateien:
> 1. lib/handwritten-pdf.ts mit GPT-4o Vision
> 2. lib/grade-klausur.ts mit JSON Schema
> 3. lib/generate-feedback-pdf.ts mit pdf-lib
> 4. app/api/extract-klausur/route.ts
> 
> Nutze KEINE anderen Packages außer: pdf-to-png-converter, openai, pdf-lib.
> Verwende GENAU die Funktion extractHandwrittenPdfText() wie oben beschrieben.
> Füge ausführliche console.logs hinzu.
> Teste mit der handgeschriebenen Chemie-Klausur."

---

## CODEX-PROMPT: Präzise Implementierung mit strikter Konsistenz

**KOPIERE DIESEN PROMPT 1:1 IN CODEX/CURSOR:**

```
# IMPLEMENTIERUNGSAUFTRAG: KI-Klausur-Korrektur MVP

## KRITISCHE ANFORDERUNGEN

### 1. STRIKTE NAMING-CONVENTIONS
Du MUSST diese exakten Namen verwenden - KEINE Variationen, KEINE Umbenennungen:

**Funktionsnamen (EXAKT so):**
- `extractPdfText()` - für gedruckte PDFs (bereits vorhanden in lib/pdf.ts)
- `extractHandwrittenPdfText()` - für handgeschriebene PDFs (NEU)
- `gradeKlausur()` - für KI-Bewertung (NEU)
- `generateFeedbackPdf()` - für PDF-Generierung (NEU)

**Dateinamen (EXAKT so):**
- `lib/pdf.ts` - NICHT ÄNDERN (bereits vorhanden)
- `lib/handwritten-pdf.ts` - NEU erstellen
- `lib/grade-klausur.ts` - NEU erstellen
- `lib/generate-feedback-pdf.ts` - NEU erstellen
- `lib/grading-schema.ts` - NEU erstellen

**API-Routes (EXAKT so):**
- `app/api/extract/route.ts` - NICHT ÄNDERN (bereits vorhanden)
- `app/api/extract-klausur/route.ts` - NEU erstellen
- `app/api/grade/route.ts` - NEU erstellen
- `app/api/generate-feedback-pdf/route.ts` - NEU erstellen

**TypeScript-Interfaces (EXAKT so):**
- `GradingResult` - Interface für Bewertungsergebnis
- `GradeKlausurInput` - Interface für Bewertungs-Input
- `GenerateFeedbackPdfInput` - Interface für PDF-Generation-Input

**Variablennamen (EXAKT so):**
- `expectationHorizon` (NICHT: expectation_horizon, erwartungshorizont, etc.)
- `gradingRubric` (NICHT: grading_rubric, rubric, etc.)
- `examText` (NICHT: exam_text, klausurText, etc.)
- `studentAnswers` (NICHT: student_answers, antworten, etc.)

---

## 2. IMPLEMENTIERUNGSREIHENFOLGE

Du MUSST in EXAKT dieser Reihenfolge vorgehen:

### SCHRITT 1: Basis-Setup
```bash
npm install pdf-to-png-converter pdf-lib
```

### SCHRITT 2: TypeScript-Typen definieren
Erstelle `lib/grading-schema.ts` mit:
- Export `gradingSchema` (JSON Schema)
- Export Interface `GradingResult`

### SCHRITT 3: Handschrift-Extraktion
Erstelle `lib/handwritten-pdf.ts` mit:
- Import von `openai` und `pdf-to-png-converter`
- Funktion `extractHandwrittenPdfText(uint8: Uint8Array): Promise<string>`
- KEINE anderen Funktionsnamen!

### SCHRITT 4: KI-Bewertung
Erstelle `lib/grade-klausur.ts` mit:
- Import von `OpenAI` und `./grading-schema`
- Interface `GradeKlausurInput` mit EXAKT diesen Properties:
  - expectationHorizon: string
  - gradingRubric: string
  - examText: string
  - studentAnswers: string
- Funktion `gradeKlausur(input: GradeKlausurInput): Promise<GradingResult>`

### SCHRITT 5: PDF-Generierung
Erstelle `lib/generate-feedback-pdf.ts` mit:
- Import von `pdf-lib` und `./grading-schema`
- Interface `GenerateFeedbackPdfInput` mit EXAKT diesen Properties:
  - studentName: string
  - klausurTitle: string
  - date: string
  - gradingResult: GradingResult
- Funktion `generateFeedbackPdf(input: GenerateFeedbackPdfInput): Promise<Uint8Array>`

### SCHRITT 6: API-Routes
Erstelle in EXAKT dieser Reihenfolge:
1. `app/api/extract-klausur/route.ts`
2. `app/api/grade/route.ts`
3. `app/api/generate-feedback-pdf/route.ts`

---

## 3. VERBOTENE AKTIONEN

Du DARFST NICHT:
- ❌ Bestehende Dateien umbenennen (lib/pdf.ts, app/api/extract/route.ts bleiben!)
- ❌ Funktionsnamen ändern (z.B. extractHandwrittenPdf → extractHandwritten)
- ❌ Variablennamen verkürzen (z.B. expectationHorizon → horizon)
- ❌ Deutsche Namen verwenden (z.B. erwartungshorizont → expectationHorizon)
- ❌ Underscores verwenden (z.B. student_answers → studentAnswers)
- ❌ Alternative Packages installieren (NUR: pdf-to-png-converter, pdf-lib, openai)
- ❌ Code aus existierenden Dateien löschen oder überschreiben

---

## 4. KONSISTENZ-CHECKLIST

Bevor du Code schreibst, prüfe:

✅ **Import-Paths konsistent?**
```typescript
import { extractText } from 'unpdf';  // ✅ RICHTIG
import { extractText } from './pdf';  // ❌ FALSCH
```

✅ **Function-Namen konsistent?**
```typescript
export async function extractHandwrittenPdfText(uint8: Uint8Array)  // ✅ RICHTIG
export async function extractHandwritten(uint8: Uint8Array)        // ❌ FALSCH
```

✅ **Variable-Namen konsistent?**
```typescript
const { expectationHorizon, examText, studentAnswers } = await req.json();  // ✅ RICHTIG
const { horizon, exam, answers } = await req.json();                        // ❌ FALSCH
```

✅ **TypeScript-Typen exportiert?**
```typescript
export interface GradingResult { ... }  // ✅ RICHTIG
interface GradingResult { ... }         // ❌ FALSCH (nicht exportiert!)
```

---

## 5. ERROR-HANDLING STANDARD

Jede Funktion MUSS dieses Error-Pattern verwenden:

```typescript
try {
  // Hauptlogik
  console.log("Starte [FUNKTIONSNAME]...");
  const result = await someOperation();
  console.log("[FUNKTIONSNAME] erfolgreich:", result);
  return result;
} catch (err) {
  console.error("[FUNKTIONSNAME] error:", err);
  throw new Error(`[BESCHREIBUNG] fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
}
```

**Beispiel:**
```typescript
try {
  console.log("Starte Handschrift-Extraktion...");
  const text = await extractHandwrittenPdfText(uint8);
  console.log("Handschrift-Extraktion erfolgreich:", text.length, "Zeichen");
  return text;
} catch (err) {
  console.error("Handschrift-Extraktion error:", err);
  throw new Error(`Handschrift-Extraktion fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
}
```

---

## 6. OPENAI API-CALLS: STRIKTE PARAMETER

**Für GPT-4o Vision (Handschrift-OCR):**
```typescript
await client.chat.completions.create({
  model: "gpt-4o",  // ✅ EXAKT so - NICHT "gpt-4o-mini" oder "gpt-4"
  messages: [...],
  max_tokens: 4096   // ✅ Exakt dieser Wert
});
```

**Für GPT-4o Bewertung (mit JSON Schema):**
```typescript
await client.chat.completions.create({
  model: "gpt-4o",
  messages: [...],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "klausur_bewertung",  // ✅ EXAKT so
      schema: gradingSchema,
      strict: true
    }
  },
  temperature: 0.3  // ✅ Exakt dieser Wert - NICHT 0.5 oder 0.7!
});
```

---

## 7. DEBUGGING-OUTPUT

Jede neu erstellte Funktion MUSS diese Console-Logs haben:

**In lib/handwritten-pdf.ts:**
```typescript
console.log(`PDF hat ${pngPages.length} Seiten`);
console.log(`Verarbeite Seite ${i + 1}/${pngPages.length}...`);
console.log("Handschrift-Extraktion abgeschlossen:", fullText.length, "Zeichen");
```

**In lib/grade-klausur.ts:**
```typescript
console.log("Starte KI-Bewertung...");
console.log("Prompt-Länge:", prompt.length, "Zeichen");
console.log("Bewertung abgeschlossen:", result.totalPoints, "/", result.maxPoints);
```

**In lib/generate-feedback-pdf.ts:**
```typescript
console.log("Generiere PDF für:", input.studentName);
console.log("Anzahl Aufgaben:", input.gradingResult.tasks.length);
console.log("PDF erfolgreich generiert:", pdfBytes.length, "bytes");
```

---

## 8. VALIDIERUNG VOR JEDEM COMMIT

Bevor du Code als "fertig" markierst, prüfe:

1. ✅ Alle 5 neuen Dateien erstellt?
   - lib/handwritten-pdf.ts
   - lib/grade-klausur.ts
   - lib/generate-feedback-pdf.ts
   - lib/grading-schema.ts
   - app/api/extract-klausur/route.ts
   - app/api/grade/route.ts
   - app/api/generate-feedback-pdf/route.ts

2. ✅ Keine bestehenden Dateien überschrieben?
   - lib/pdf.ts (muss unverändert bleiben!)
   - app/api/extract/route.ts (muss unverändert bleiben!)

3. ✅ Alle Funktionsnamen exakt wie vorgegeben?

4. ✅ Alle Imports funktionieren ohne Fehler?

5. ✅ TypeScript kompiliert ohne Errors?
   ```bash
   npm run build
   ```

6. ✅ Dev-Server startet ohne Fehler?
   ```bash
   npm run dev
   ```

---

## 9. TEST-ANLEITUNG

Nach der Implementierung, führe diese Tests durch:

**Test 1: Handschrift-Extraktion**
```bash
curl -X POST http://localhost:3000/api/extract-klausur \
  -H "Content-Type: application/pdf" \
  --data-binary "@test-klausur.pdf" \
  | jq '.text' | head -20
```
Erwartung: Transkribierter Text wird ausgegeben.

**Test 2: Bewertung**
```bash
curl -X POST http://localhost:3000/api/grade \
  -H "Content-Type: application/json" \
  -d '{
    "expectationHorizon": "Test...",
    "gradingRubric": "",
    "examText": "Aufgabe 1.1...",
    "studentAnswers": "Antwort..."
  }' | jq '.totalPoints'
```
Erwartung: JSON mit Bewertung wird zurückgegeben.

**Test 3: PDF-Generierung**
```bash
curl -X POST http://localhost:3000/api/generate-feedback-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "Test Student",
    "klausurTitle": "Test Klausur",
    "date": "20.11.2024",
    "gradingResult": {...}
  }' --output test.pdf
```
Erwartung: PDF-Datei wird heruntergeladen.

---

## 10. FINALE CHECKLISTE

Markiere jeden Punkt ab, wenn erledigt:

- [ ] `npm install pdf-to-png-converter pdf-lib` erfolgreich
- [ ] `lib/grading-schema.ts` erstellt mit Export von `GradingResult` und `gradingSchema`
- [ ] `lib/handwritten-pdf.ts` erstellt mit Funktion `extractHandwrittenPdfText()`
- [ ] `lib/grade-klausur.ts` erstellt mit Funktion `gradeKlausur()`
- [ ] `lib/generate-feedback-pdf.ts` erstellt mit Funktion `generateFeedbackPdf()`
- [ ] `app/api/extract-klausur/route.ts` erstellt
- [ ] `app/api/grade/route.ts` erstellt
- [ ] `app/api/generate-feedback-pdf/route.ts` erstellt
- [ ] `lib/pdf.ts` NICHT geändert
- [ ] `app/api/extract/route.ts` NICHT geändert
- [ ] Alle Console-Logs vorhanden
- [ ] TypeScript kompiliert ohne Errors
- [ ] Dev-Server startet ohne Fehler
- [ ] Test 1 (Handschrift-Extraktion) erfolgreich
- [ ] Test 2 (Bewertung) erfolgreich
- [ ] Test 3 (PDF-Generierung) erfolgreich

---

## 11. BEI FEHLERN

Falls ein Fehler auftritt, gib EXAKT diese Informationen:

1. **Welche Datei?** (z.B. lib/handwritten-pdf.ts)
2. **Welche Zeile?** (z.B. Zeile 23)
3. **Exakte Fehlermeldung** (kompletter Stack-Trace)
4. **Was wurde versucht?** (z.B. "PDF-Upload mit 85 KB Datei")
5. **Console-Logs** (die letzten 10 Zeilen)

---

## WICHTIG: DEINE AUFGABE

1. Lies diesen gesamten Prompt VOLLSTÄNDIG
2. Implementiere die 7 Dateien in der vorgegebenen Reihenfolge
3. Verwende EXAKT die vorgegebenen Namen
4. Füge Console-Logs hinzu
5. Teste jede Komponente einzeln
6. Melde Erfolg oder gib detaillierte Fehlerinfo

**STARTE JETZT MIT SCHRITT 1 (npm install).**
```

---

**VIEL ERFOLG! 🚀**

Bei Fragen: Genau diese Datei zeigen + konkrete Fehlermeldung.
