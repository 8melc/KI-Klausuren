# Word-Datei Export - Funktionsweise

## 📄 Übersicht

Die Word-Datei wird mit der **`docx`** Bibliothek erzeugt. Hier ist der komplette Ablauf:

---

## 🔄 Ablauf der Word-Datei-Erzeugung

### 1. **Benutzer klickt auf "Word herunterladen"**

In der Results-Seite oder ResultCard-Komponente:
```typescript
// components/ResultCard.tsx oder app/results/page.tsx
downloadAnalysisDoc(klausurName, analysis)
```

### 2. **Client-seitige Funktion** (`lib/downloadDoc.ts`)

```typescript
export async function downloadAnalysisDoc(
  klausurName: string,
  analysis: KlausurAnalyse,
) {
  // Ruft die API-Route auf
  const response = await fetch('/api/generate-doc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      klausurName,
      analysis,
    }),
  });

  // Erstellt einen Download-Link
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${klausurName}_Bewertung.docx`;
  link.click();
}
```

### 3. **API-Route** (`app/api/generate-doc/route.ts`)

```typescript
export async function POST(req: Request) {
  const { klausurName, analysis } = await req.json();
  
  // Ruft die Word-Generierungs-Funktion auf
  const docBuffer = await generateFeedbackDoc({
    klausurName: klausurName || 'Klausur',
    analysis,
  });

  // Sendet die Word-Datei als Download zurück
  return new NextResponse(docBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${safeName}_Bewertung.docx"`,
    },
  });
}
```

### 4. **Word-Generierung** (`lib/generate-feedback-doc.ts`)

Die eigentliche Word-Datei wird mit der **`docx`** Bibliothek erstellt:

```typescript
import { Document, HeadingLevel, Paragraph, TextRun, Packer } from 'docx';

export async function generateFeedbackDoc(input: GenerateFeedbackDocInput): Promise<Buffer> {
  const paragraphs: Paragraph[] = [];

  // 1. Titel
  paragraphs.push(
    new Paragraph({
      text: 'Klausurbewertung',
      heading: HeadingLevel.TITLE,
    }),
  );

  // 2. Klausur-Informationen
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Klausur: ', bold: true }),
        new TextRun(klausurName),
      ],
    }),
  );

  // 3. Punkte
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Gesamtpunkte: ', bold: true }),
        new TextRun(`${analysis.erreichtePunkte} / ${analysis.gesamtpunkte}`),
      ],
    }),
  );

  // 4. Zusammenfassung
  paragraphs.push(
    new Paragraph({
      text: analysis.zusammenfassung,
    }),
  );

  // 5. Aufgaben-Details
  analysis.aufgaben.forEach((aufgabe, index) => {
    paragraphs.push(
      new Paragraph({
        text: `${index + 1}. ${aufgabe.aufgabe} (${aufgabe.erreichtePunkte}/${aufgabe.maxPunkte} Punkte)`,
        heading: HeadingLevel.HEADING_2,
      }),
    );

    paragraphs.push(
      new Paragraph({
        text: aufgabe.kommentar,
      }),
    );

    // Korrekturen als Bullet-Points
    aufgabe.korrekturen.forEach((korrektur) => {
      paragraphs.push(
        new Paragraph({
          text: korrektur,
          bullet: { level: 0 },
        }),
      );
    });
  });

  // 6. Dokument erstellen
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  // 7. Als Buffer konvertieren
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
```

---

## 📦 Verwendete Bibliothek

**`docx`** (Version 9.5.1)

- **Installation:** Bereits in `package.json` vorhanden
- **Dokumentation:** [docx.js.org](https://docx.js.org/)
- **Funktionalität:** Erstellt `.docx` Dateien programmatisch

---

## 📋 Struktur der Word-Datei

Die generierte Word-Datei enthält:

1. **Titel:** "Klausurbewertung"
2. **Klausur-Informationen:**
   - Klausurname
   - Gesamtpunkte (erreicht / maximal)
   - Prozent
3. **Zusammenfassung:**
   - Gesamtfeedback der KI
4. **Aufgaben-Details:**
   - Für jede Aufgabe:
     - Aufgabenname mit Punkten
     - Kommentar
     - Korrekturen (als Bullet-Points)

---

## 🎨 Formatierung

- **Seitenränder:** 1 inch (2.54 cm) auf allen Seiten
- **Schriftarten:** Standard Word-Schriftarten
- **Überschriften:** 
  - Titel: HeadingLevel.TITLE
  - Aufgaben: HeadingLevel.HEADING_2
- **Fettdruck:** Für Labels (z.B. "Klausur:", "Gesamtpunkte:")
- **Bullet-Points:** Für Korrekturen

---

## 🔧 Anpassungen

### Preis ändern

Falls Sie die Formatierung anpassen möchten, bearbeiten Sie `lib/generate-feedback-doc.ts`:

```typescript
// Beispiel: Andere Seitenränder
margin: {
  top: 1800,    // 1.25 inch
  bottom: 1800,
  left: 1440,
  right: 1440,
}
```

### Zusätzliche Felder hinzufügen

```typescript
// Beispiel: Datum hinzufügen
paragraphs.push(
  new Paragraph({
    children: [
      new TextRun({ text: 'Datum: ', bold: true }),
      new TextRun(new Date().toLocaleDateString('de-DE')),
    ],
  }),
);
```

---

## 🚀 Verwendung

Die Word-Datei wird automatisch heruntergeladen, wenn der Benutzer auf den Download-Button klickt:

1. In `ResultCard.tsx`: Button "Word herunterladen"
2. In `results/page.tsx`: Download-Funktion in der Tabelle

**Dateiname:** `{KlausurName}_Bewertung.docx`

---

## ⚠️ Wichtige Hinweise

- Die Word-Datei wird **serverseitig** generiert (nicht im Browser)
- Benötigt die `docx` Bibliothek (bereits installiert)
- Funktioniert nur mit der `KlausurAnalyse` Struktur aus `lib/openai.ts`
- Die Datei wird als **Buffer** zurückgegeben und dann als Blob heruntergeladen

---

## 🆘 Troubleshooting

### Problem: "Word-Dokument konnte nicht erstellt werden"

**Lösung:**
1. Prüfen Sie, ob `docx` installiert ist: `npm list docx`
2. Prüfen Sie die Browser-Konsole auf Fehler
3. Prüfen Sie die Server-Logs für Fehlerdetails

### Problem: Datei wird nicht heruntergeladen

**Lösung:**
1. Prüfen Sie, ob der Browser Downloads erlaubt
2. Prüfen Sie die Browser-Konsole auf Fehler
3. Prüfen Sie, ob die API-Route `/api/generate-doc` erreichbar ist

### Problem: Formatierung sieht falsch aus

**Lösung:**
- Bearbeiten Sie `lib/generate-feedback-doc.ts`
- Passen Sie die `Paragraph`-Objekte an
- Siehe [docx.js.org Dokumentation](https://docx.js.org/) für alle Optionen












