# DOCX-Datei Erstellung im Backend - Detaillierte Erklärung

## 📋 Übersicht

Die DOCX-Datei wird **serverseitig** mit der `docx` Bibliothek erstellt. Hier ist der komplette Prozess:

---

## 🔧 Schritt-für-Schritt: Wie die DOCX-Datei erstellt wird

### 1. **Bibliothek: `docx`**

```typescript
import { Document, HeadingLevel, Paragraph, TextRun, Packer } from 'docx';
```

**Was macht jede Komponente:**
- `Document`: Haupt-Container für das Word-Dokument
- `HeadingLevel`: Überschriften-Ebenen (TITLE, HEADING_1, HEADING_2, etc.)
- `Paragraph`: Ein Absatz im Dokument
- `TextRun`: Ein Text-Abschnitt mit Formatierung (fett, kursiv, etc.)
- `Packer`: Konvertiert das Document-Objekt in einen Buffer (binäre Datei)

---

### 2. **Die Funktion: `generateFeedbackDoc`**

**Datei:** `lib/generate-feedback-doc.ts`

```typescript
export async function generateFeedbackDoc(input: GenerateFeedbackDocInput): Promise<Buffer> {
  const { klausurName, analysis } = input;
  
  // Array für alle Absätze im Dokument
  const paragraphs: Paragraph[] = [];
  
  // ... Absätze hinzufügen ...
  
  // Dokument erstellen
  const doc = new Document({ ... });
  
  // Als Buffer konvertieren
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
```

---

### 3. **Dokument-Struktur aufbauen**

#### Schritt 1: Titel hinzufügen

```typescript
paragraphs.push(
  new Paragraph({
    text: 'Klausurbewertung',
    heading: HeadingLevel.TITLE,  // Größte Überschrift
    spacing: { after: 300 },        // Abstand nach dem Titel
  }),
);
```

#### Schritt 2: Klausur-Informationen

```typescript
paragraphs.push(
  new Paragraph({
    children: [
      new TextRun({ text: 'Klausur: ', bold: true }),  // Fett
      new TextRun(klausurName),                        // Normal
    ],
    spacing: { after: 120 },
  }),
);
```

**Erklärung:**
- `children`: Array von `TextRun`-Objekten für verschiedene Formatierungen
- `bold: true`: Macht den Text fett
- `spacing.after`: Abstand nach dem Absatz (in twips, 1 twip = 1/20 Punkt)

#### Schritt 3: Punkte anzeigen

```typescript
paragraphs.push(
  new Paragraph({
    children: [
      new TextRun({ text: 'Gesamtpunkte: ', bold: true }),
      new TextRun(`${analysis.erreichtePunkte} / ${analysis.gesamtpunkte}`),
    ],
    spacing: { after: 80 },
  }),
);
```

#### Schritt 4: Zusammenfassung

```typescript
paragraphs.push(
  new Paragraph({
    children: [
      new TextRun({ text: 'Zusammenfassung', bold: true, break: 1 }),
      // break: 1 = Zeilenumbruch vor dem Text
    ],
    spacing: { before: 200, after: 120 },
  }),
);

paragraphs.push(
  new Paragraph({
    text: analysis.zusammenfassung,  // Der Text aus der KI-Analyse
    spacing: { after: 200 },
  }),
);
```

#### Schritt 5: Aufgaben-Details (Loop)

```typescript
analysis.aufgaben.forEach((aufgabe, index) => {
  // Überschrift für jede Aufgabe
  paragraphs.push(
    new Paragraph({
      text: `${index + 1}. ${aufgabe.aufgabe} (${aufgabe.erreichtePunkte}/${aufgabe.maxPunkte} Punkte)`,
      heading: HeadingLevel.HEADING_2,  // Zweite Überschriften-Ebene
      spacing: { before: 200, after: 80 },
    }),
  );

  // Kommentar zur Aufgabe
  paragraphs.push(
    new Paragraph({
      text: aufgabe.kommentar,
      spacing: { after: 80 },
    }),
  );

  // Korrekturen als Bullet-Points
  if (aufgabe.korrekturen && aufgabe.korrekturen.length > 0) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: 'Korrekturen:', bold: true })],
        spacing: { after: 80 },
      }),
    );

    aufgabe.korrekturen.forEach((korrektur) => {
      paragraphs.push(
        new Paragraph({
          text: korrektur,
          bullet: { level: 0 },  // Bullet-Point, Level 0
        }),
      );
    });
  }
});
```

**Erklärung:**
- `forEach`: Iteriert über alle Aufgaben aus der KI-Analyse
- `heading: HeadingLevel.HEADING_2`: Zweite Überschriften-Ebene
- `bullet: { level: 0 }`: Erstellt einen Bullet-Point (•)

---

### 4. **Dokument zusammenstellen**

```typescript
const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: defaultMargin,     // 1440 twips = 1 inch = 2.54 cm
            bottom: defaultMargin,
            left: defaultMargin,
            right: defaultMargin,
          },
        },
      },
      children: paragraphs,  // Alle Absätze, die wir erstellt haben
    },
  ],
});
```

**Erklärung:**
- `sections`: Ein Dokument kann mehrere Sektionen haben
- `properties.page.margin`: Seitenränder definieren
- `children`: Alle Absätze, die wir in das Array `paragraphs` gepusht haben

---

### 5. **In Buffer konvertieren**

```typescript
const buffer = await Packer.toBuffer(doc);
return buffer;
```

**Was passiert hier:**
- `Packer.toBuffer()`: Konvertiert das Document-Objekt in einen **binären Buffer**
- Der Buffer ist das tatsächliche `.docx` Dateiformat (ZIP-Archiv mit XML-Dateien)
- Dieser Buffer kann direkt als Datei gespeichert oder als HTTP-Response gesendet werden

---

## 🔄 Kompletter Ablauf im Backend

### API-Route: `app/api/generate-doc/route.ts`

```typescript
export async function POST(req: Request) {
  // 1. Daten aus dem Request-Body holen
  const { klausurName, analysis } = await req.json();

  // 2. Validierung
  if (!analysis) {
    return NextResponse.json({ error: 'Analyse-Daten fehlen' }, { status: 400 });
  }

  // 3. DOCX-Datei generieren
  const docBuffer = await generateFeedbackDoc({
    klausurName: klausurName || 'Klausur',
    analysis,
  });

  // 4. Dateiname sicher machen (keine Sonderzeichen)
  const safeName = (klausurName || 'Klausur').replace(/[^a-zA-Z0-9_-]+/g, '_');

  // 5. Als HTTP-Response zurückgeben
  return new NextResponse(docBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // ↑ MIME-Type für .docx Dateien
      'Content-Disposition': `attachment; filename="${safeName}_Bewertung.docx"`,
      // ↑ Sagt dem Browser: "Lade diese Datei herunter"
    },
  });
}
```

---

## 📐 Formatierung-Details

### Abstände (Spacing)

```typescript
spacing: {
  before: 200,  // Abstand vor dem Absatz (in twips)
  after: 120,   // Abstand nach dem Absatz (in twips)
}
```

**Twips:** 1 twip = 1/20 Punkt = 1/1440 Inch
- 1440 twips = 1 inch = 2.54 cm
- 200 twips ≈ 0.35 cm

### Überschriften-Ebenen

```typescript
HeadingLevel.TITLE    // Größte Überschrift
HeadingLevel.HEADING_1
HeadingLevel.HEADING_2
HeadingLevel.HEADING_3
// etc.
```

### Text-Formatierung

```typescript
new TextRun({
  text: 'Text',
  bold: true,      // Fett
  italics: true,   // Kursiv
  underline: {},   // Unterstrichen
  color: 'FF0000', // Farbe (Hex)
  size: 24,        // Schriftgröße (in halben Punkten)
})
```

---

## 🎯 Datenfluss

```
Frontend (downloadAnalysisDoc)
    ↓
POST /api/generate-doc
    ↓
generateFeedbackDoc()
    ↓
1. Paragraphs Array erstellen
2. Titel hinzufügen
3. Informationen hinzufügen
4. Aufgaben-Loop
5. Document-Objekt erstellen
6. Packer.toBuffer() → Buffer
    ↓
NextResponse mit Buffer
    ↓
Browser lädt DOCX herunter
```

---

## 🔍 Was ist ein DOCX-Datei?

Eine `.docx` Datei ist eigentlich ein **ZIP-Archiv** mit XML-Dateien:

```
document.docx
├── [Content_Types].xml
├── _rels/
├── word/
│   ├── document.xml      ← Hauptinhalt
│   ├── styles.xml        ← Formatierungen
│   └── ...
└── ...
```

Die `docx` Bibliothek erstellt diese Struktur automatisch im Speicher und packt sie in einen Buffer.

---

## 💡 Anpassungen

### Andere Seitenränder

```typescript
margin: {
  top: 1800,    // 1.25 inch
  bottom: 1440, // 1 inch
  left: 1440,
  right: 1440,
}
```

### Zusätzliche Felder

```typescript
// Datum hinzufügen
paragraphs.push(
  new Paragraph({
    children: [
      new TextRun({ text: 'Datum: ', bold: true }),
      new TextRun(new Date().toLocaleDateString('de-DE')),
    ],
  }),
);
```

### Tabellen hinzufügen

```typescript
import { Table, TableRow, TableCell } from 'docx';

const table = new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph('Aufgabe')] }),
        new TableCell({ children: [new Paragraph('Punkte')] }),
      ],
    }),
  ],
});
```

---

## 🆘 Troubleshooting

### Problem: "Buffer ist leer"

**Lösung:**
- Prüfen Sie, ob `analysis` Daten enthält
- Prüfen Sie die Console-Logs

### Problem: "Formatierung stimmt nicht"

**Lösung:**
- Twips-Werte anpassen
- Spacing-Werte erhöhen/verringern

### Problem: "Datei öffnet sich nicht"

**Lösung:**
- Prüfen Sie den Content-Type Header
- Prüfen Sie, ob der Buffer korrekt erstellt wurde

---

## 📚 Weitere Ressourcen

- [docx.js.org Dokumentation](https://docx.js.org/)
- [docx GitHub](https://github.com/dolanmiu/docx)
- [Beispiele](https://github.com/dolanmiu/docx/tree/master/demo)


