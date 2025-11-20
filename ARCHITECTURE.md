# Architekturübersicht – KI-Klausurkorrektur-MVP

## 1. Gesamtfluss

User Flow:
1. Erwartungshorizont hochladen → Speicherung → Parsing in Text
2. Klausur-PDF hochladen → Textextraktion pro Seite
3. Analyse-Pipeline erzeugt strukturiertes JSON:
   - Aufgabenbezüge
   - Bewertung je Teilaufgabe
   - Punkte
   - Verbales Feedback
4. PDF-Generator baut ein Ergebnis-PDF
5. Dashboard zeigt Punkte & Feedback an

## 2. API-Layer

### /api/extract (Server Route)
- Input: PDF-File
- Output: Plaintext
- Tools: OpenAI Vision (direkte PDF-Verarbeitung)

### /api/analyze
- Input:
  - Erwartungshorizont-Text
  - Klausur-Text
- Output (JSON):
  - Punkte je Aufgabe
  - Verbales Feedback
  - Gesamturteil
- Modell: GPT-4o / GPT-4o-mini

### /api/generate-pdf
- Input: Analyse-JSON
- Output: PDF mit Feedback
- Tools: pdf-lib

## 3. Datenmodell (vereinfacht)

```typescript
type AnalysisResult = {
  totalPoints: number;
  maxPoints: number;
  tasks: Array<{
    id: string;
    title: string;
    studentAnswer: string;
    analysis: string;
    points: number;
    maxPoints: number;
  }>;
  summary: string;
};
```

## 4. Frontend-Struktur
- ExpectationUploadPage
- ExamUploadPage
- ResultsPage

Alle Komponenten minimalistisch, Tailwind-basiert.
