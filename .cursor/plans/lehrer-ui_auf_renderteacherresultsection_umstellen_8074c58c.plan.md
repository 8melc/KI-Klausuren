# Lehrer-UI auf renderTeacherResultSection umstellen

## Problem

Aktuell verwenden `ResultCompactView` und `DetailDrawer` `buildTeacherFeedbackModel`, das Heuristiken (`parseSummary`, `splitIntoArray`) verwendet, um Stärken/Entwicklungsbereiche zu extrahieren. Stattdessen sollen sie `renderTeacherResultSection` verwenden, das `ParsedAnalysis` benötigt, das mit polierten Texten aus der Analyse-Pipeline befüllt wird.

## Lösung

1. **Verwende direkt `mapToParsedAnalysis` + `renderTeacherResultSection`** - Die Renderer existieren bereits in `lib/renderers/teacher-renderer.ts` und sollen genau so verwendet werden
2. **Entferne alle Heuristiken** aus `buildTeacherFeedbackModel` und den Komponenten
3. **Passe `mapToParsedAnalysis` an**, um die pädagogische Zusammenfassung aus `analysis.zusammenfassung` zu verwenden (die jetzt mit dem neuen Prompt erzeugt wird)

## Implementierung

### 1. Passe mapToParsedAnalysis an
**Datei:** `types/analysis.ts`

- Die Funktion `mapToParsedAnalysis` erstellt bereits `ParsedAnalysis` aus `KlausurAnalyse`
- Aktuell extrahiert sie `strengths` und `nextSteps` mit Heuristiken aus `zusammenfassung`
- **Änderung:** Da `analysis.zusammenfassung` jetzt eine pädagogische Zusammenfassung ist (8-12 Sätze), sollte `ParsedAnalysis.summary` direkt `analysis.zusammenfassung` sein
- Für `strengths` und `nextSteps`: Diese sollten aus der pädagogischen Zusammenfassung extrahiert werden, ABER nur wenn sie strukturiert vorhanden sind (z.B. mit "STÄRKEN:" / "ENTWICKLUNGSBEREICHE:" Markierungen)
- Falls keine strukturierten Daten: `strengths` und `nextSteps` als leere Arrays, nur `summary` befüllen
- **WICHTIG:** Keine generischen Fallback-Sätze wie "Grundlegendes Verständnis der Aufgabenstellung" mehr

### 2. Erstelle Helper-Funktion für Lehrer-UI
**Datei:** `lib/build-teacher-feedback-model.ts` (vereinfachen oder ersetzen)

- Erstelle Funktion `buildTeacherViewFromAnalysis(analysis: KlausurAnalyse, courseInfo?: CourseInfo)`
- Diese Funktion:
  - Ruft `mapToParsedAnalysis(analysis, gradeLabel)` auf
  - Ruft dann `renderTeacherResultSection(parsed, gradeLevel)` auf
  - Gibt das Ergebnis von `renderTeacherResultSection` zurück (enthält `summary`, `tasks`, `overall`)
- **ODER:** Entferne `buildTeacherFeedbackModel` komplett und verwende direkt `mapToParsedAnalysis` + `renderTeacherResultSection` in den Komponenten

### 3. Passe ResultCompactView an
**Datei:** `components/ResultCompactView.tsx`

- Entferne `buildTeacherFeedbackModel` Import
- Entferne `parseSummary` Import und alle `splitIntoArray` Logik
- Importiere `mapToParsedAnalysis` aus `@/types/analysis` und `renderTeacherResultSection` aus `@/lib/renderers/teacher-renderer`
- Im `useEffect`:
  - Rufe `mapToParsedAnalysis(analysis, gradeLabel)` auf
  - Rufe dann `renderTeacherResultSection(parsed, gradeLevel)` auf
  - Speichere das Ergebnis in State
- Verwende `teacherView.summary.strengths` und `teacherView.summary.developmentAreas` direkt
- Verwende `teacherView.summary.overallSummary` als Fallback, falls keine strukturierten Daten

### 4. Passe DetailDrawer an
**Datei:** `components/DetailDrawer.tsx`

- Entferne `buildTeacherFeedbackModel` Import und `TeacherFeedbackModel` Type
- Entferne `TeacherFeedbackTaskModel` Type (verwende `TeacherTaskView` aus `teacher-renderer`)
- Importiere `mapToParsedAnalysis` und `renderTeacherResultSection`
- Im `useEffect`:
  - Rufe `mapToParsedAnalysis(entry.analysis, gradeLabel)` auf
  - Rufe dann `renderTeacherResultSection(parsed, gradeLevel)` auf
  - Speichere das Ergebnis in State
- Verwende `teacherView.tasks` direkt (Typ: `TeacherTaskView[]`)
- Passe `TaskAccordion` Props an:
  - `task: TeacherTaskView` statt `TeacherFeedbackTaskModel`
  - Mappe Felder:
    - `whatWasGood` → `task.correctAspects`
    - `whatToImprove` → `task.deductions`
    - `tipsForYou` → `task.improvementHints`
    - `corrections` → `task.corrections`
    - Punkte: `task.points` (Format "2/5") oder `task.erreichtePunkte / task.maxPunkte` aus `ParsedAnalysis.aufgaben`

### 5. Entferne Heuristiken aus buildTeacherFeedbackModel
**Datei:** `lib/build-teacher-feedback-model.ts`

- Option A: Vereinfache die Funktion, sodass sie nur `mapToParsedAnalysis` + `renderTeacherResultSection` aufruft
- Option B: Markiere die Datei als deprecated und entferne sie (Komponenten verwenden dann direkt die Renderer)

## Dateien die geändert werden

1. **Ändern:** `types/analysis.ts` - `mapToParsedAnalysis` anpassen (keine generischen Fallbacks, nur strukturierte Extraktion)
2. **Ändern:** `components/ResultCompactView.tsx` - Direkte Verwendung von `mapToParsedAnalysis` + `renderTeacherResultSection`
3. **Ändern:** `components/DetailDrawer.tsx` - Direkte Verwendung von `mapToParsedAnalysis` + `renderTeacherResultSection`
4. **Ändern/Entfernen:** `lib/build-teacher-feedback-model.ts` - Vereinfachen oder entfernen

## Wichtige Punkte

- `renderTeacherResultSection`, `renderTeacherTask`, `renderTeacherSummary` existieren bereits in `lib/renderers/teacher-renderer.ts` und sollen GENAU so verwendet werden
- `ParsedAnalysis` wird aus `KlausurAnalyse` via `mapToParsedAnalysis` erstellt
- `ParsedAnalysis.strengths` und `ParsedAnalysis.nextSteps` sollen nur befüllt werden, wenn sie strukturiert in `analysis.zusammenfassung` vorhanden sind (keine Heuristiken, keine generischen Fallbacks)
- `ParsedAnalysis.summary` = `analysis.zusammenfassung` (die pädagogische Zusammenfassung aus dem neuen Prompt)
- Schüler-Feedback bleibt unverändert und nutzt weiterhin `buildFeedbackModel`

