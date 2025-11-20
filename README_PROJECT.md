# KI-gestütztes Klausurkorrektur-MVP

Dieses MVP dient zur automatisierten Analyse, Bewertung und Kommentierung von Chemie-Klausuren (EF/GK11). Ziel ist es, gescannte oder digitale PDF-Klausuren einzulesen, deren Inhalt zu extrahieren und anhand eines definierten Erwartungshorizonts automatisch korrigieren zu lassen.

## Features
- Upload von mehrseitigen PDF-Klausuren
- Upload eines Erwartungshorizonts / Bewertungsrasters
- Automatische Textextraktion über OpenAI Vision
- KI-gestützte Analyse (OpenAI GPT-4o)
- PDF-Ausgabe mit Feedback
- Digitales Ergebnis-Dashboard

## Technischer Aufbau
- Next.js 14 / App Router
- Uploadthing oder Vercel Blob für Uploads
- pdf-lib für PDF-Generierung
- OpenAI v4 SDK für Text-Extraktion und Bewertungspipeline
- Deployment: Vercel

## Struktur
- `/app/expectation` – Erwartungshorizont hochladen
- `/app/upload` – Klausuren hochladen
- `/app/results` – Ergebnisse anzeigen
- `/app/api/extract` – PDF-Textextraktion (OpenAI Vision)
- `/app/api/analyze` – KI-Analyse
- `/app/api/generate-pdf` – Ausgabe-PDF

## Beispiele
Im Ordner `/examples` liegen:
- `expectation_horizon.txt`
- `grading_rubric.txt`
- `exam_text.txt`
- `sample_feedback.txt`
