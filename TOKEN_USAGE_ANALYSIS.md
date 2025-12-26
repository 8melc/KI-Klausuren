# Token-Nutzung Analyse (AKTUALISIERT)

## Übersicht: API-Calls pro hochgeladene Klausur

### Workflow 1: Neue universelle Analyse (Standard)

**Pfad:** `/api/analyze` mit `useUniversal=true`

#### Schritt 1: Master-Analyse (`performMasterAnalysis`)
- **Model:** `gpt-4o-mini`
- **System Prompt:** ~300 Tokens
  - `MASTER_ANALYSIS_SYSTEM_PROMPT`: ~100 Tokens
  - `JSON_SCHEMA_ENFORCEMENT`: ~200 Tokens
- **User Prompt:** ~1.000-3.000 Tokens
  - Basis-Prompt: ~200 Tokens
  - Erwartungshorizont: ~300-1.500 Tokens (variabel)
  - Klausur-Text: ~500-1.500 Tokens (variabel)
- **Response (JSON):** ~800-3.000 Tokens
  - Abhängig von Anzahl Aufgaben und Detailgrad
- **Gesamt:** ~2.100-6.300 Tokens

#### Schritt 2: Render (optional, je nach Anwendungsfall)

- **Für Lehrer:** `renderForTeacher()`
  - **Model:** `gpt-4o-mini`
  - **System Prompt:** ~50 Tokens
  - **User Prompt:** ~1.000-4.000 Tokens (komplettes Analysis JSON)
  - **Response:** ~1.000-3.000 Tokens (formatierter Text)
  - **Gesamt:** ~2.050-7.050 Tokens

- **Für Schüler (NEUER WORKFLOW):** `renderForStudent()` + Polishing
  - **Schritt 2a: Render (1 API-Call)**
    - **Model:** `gpt-4o-mini`
    - **System Prompt:** ~50 Tokens
    - **User Prompt:** ~1.000-4.000 Tokens (komplettes Analysis JSON)
    - **Response (JSON):** ~500-1.500 Tokens (strengths + nextSteps Arrays)
    - **Gesamt:** ~1.550-5.550 Tokens
  
  - **Schritt 2b: Polishing (MEHRERE API-CALLS!)**
    - **Model:** `gpt-4o-mini` (pro Text-Element)
    - **Anzahl Calls:** 6-10 Calls (parallel)
      - 3-5 Calls für `strengths` Array (je Element)
      - 3-5 Calls für `nextSteps` Array (je Element)
    - **Pro Call:**
      - System Prompt: ~100 Tokens
      - User Prompt: ~50-200 Tokens (einzelner Text)
      - Response: ~50-200 Tokens
      - **Gesamt pro Call:** ~200-500 Tokens
    - **Gesamt Polishing:** ~1.200-5.000 Tokens (6-10 Calls)
  
  - **Gesamt (Render + Polishing):** ~2.750-10.550 Tokens

- **Für Schüler (FALLBACK-WORKFLOW):** `renderAndPolishStudentDocSections()`
  - **Rendering:** Synchron (keine API-Calls)
  - **Polishing (VIELE API-CALLS!):**
    - **Summary-Polishing:** 3 Calls
      - `yourStrengths` Array (1 Call pro Element)
      - `yourNextSteps` Array (1 Call pro Element)
      - `overallMessage` (1 Call)
    - **Task-Polishing:** 4 Calls pro Aufgabe
      - `whatYouDidWell` Array
      - `whatNeedsImprovement` Array
      - `tipsForYou` Array
      - `corrections` Array
    - **Bei 5 Aufgaben:** 3 + (5 × 4) = **23 API-Calls!**
    - **Pro Call:** ~200-500 Tokens
    - **Gesamt Polishing:** ~4.600-11.500 Tokens (bei 5 Aufgaben)

#### Gesamt-Workflow (nur Analyse):
- **Nur Master-Analyse:** ~2.100-6.300 Tokens
- **Master-Analyse + Lehrer-Render:** ~4.150-13.350 Tokens
- **Master-Analyse + Schüler-Render (NEU):** ~4.850-16.850 Tokens
- **Master-Analyse + Schüler-Render (FALLBACK):** ~6.700-17.800 Tokens

---

### Workflow 2: Alte Analyse-Funktion (Rückwärtskompatibilität)

**Pfad:** `/api/analyze` mit `useUniversal=false`

#### `analyzeKlausur()`
- **Model:** `gpt-4o-mini`
- **System Prompt:** ~200 Tokens
- **User Prompt:** ~1.500-4.000 Tokens
  - Basis-Prompt: ~200 Tokens
  - `ANALYSIS_TEMPLATE`: ~600 Tokens (fest)
  - Erwartungshorizont: ~300-1.500 Tokens
  - Klausur-Text: ~500-1.500 Tokens
- **Response (JSON):** ~500-2.000 Tokens
- **Gesamt:** ~2.200-6.200 Tokens

---

### Workflow 3: Alternative Bewertung (`gradeKlausur`)

**Pfad:** `/api/grade`

#### `gradeKlausur()`
- **Model:** `gpt-4o` ⚠️ (teurer als gpt-4o-mini!)
- **System Prompt:** ~50 Tokens
- **User Prompt:** ~1.000-3.000 Tokens
  - Erwartungshorizont: ~300-1.500 Tokens
  - Schülerantworten: ~500-1.500 Tokens
  - Basis-Prompt: ~200 Tokens
- **Response (JSON):** ~500-2.000 Tokens
- **Gesamt:** ~1.550-5.050 Tokens

---

### Workflow 4: PDF-Extraktion (nicht OpenAI)

**Pfad:** `/api/extract` oder `/api/extract-klausur`

- **Model:** `gemini-2.0-flash-exp` (Google AI, nicht OpenAI)
- **Keine OpenAI-Token-Nutzung**

---

## Token-Schätzungen pro Klausur (typische Größe) - AKTUALISIERT

### Annahmen:
- **Klausur-Text:** 2.000 Zeichen (~500 Tokens)
- **Erwartungshorizont:** 3.000 Zeichen (~750 Tokens)
- **Anzahl Aufgaben:** 5-8 Aufgaben
- **Durchschnittliche Punktzahl:** 60% (mittlerer Detailgrad)
- **Strengths/NextSteps:** 3-5 Elemente pro Array

### Typische Token-Nutzung:

#### 1. Nur Analyse (neue universelle Funktion):
- **Input:** ~1.500 Tokens (System + User Prompt)
- **Output:** ~1.500 Tokens (JSON Response)
- **Gesamt:** ~3.000 Tokens

#### 2. Analyse + Lehrer-Render:
- **Analyse:** ~3.000 Tokens
- **Render:** ~2.500 Tokens (Input: 1.500, Output: 1.000)
- **Gesamt:** ~5.500 Tokens

#### 3. Analyse + Schüler-Render (NEUER WORKFLOW):
- **Analyse:** ~3.000 Tokens
- **Render (1 Call):** ~2.500 Tokens (Input: 1.500, Output: 1.000)
- **Polishing (6-10 Calls parallel):** ~2.400-5.000 Tokens
  - 3-5 Calls für strengths (je ~300 Tokens)
  - 3-5 Calls für nextSteps (je ~300 Tokens)
- **Gesamt:** ~7.900-10.500 Tokens

#### 4. Analyse + Schüler-Render (FALLBACK-WORKFLOW):
- **Analyse:** ~3.000 Tokens
- **Rendering:** 0 Tokens (synchron)
- **Polishing (23 Calls bei 5 Aufgaben!):** ~4.600-11.500 Tokens
  - Summary: 3 Calls (~900 Tokens)
  - Tasks: 20 Calls (~3.700-10.600 Tokens)
- **Gesamt:** ~7.600-14.500 Tokens

#### 5. Alte Analyse-Funktion:
- **Gesamt:** ~3.500 Tokens

#### 6. Alternative Bewertung (gpt-4o):
- **Gesamt:** ~2.500 Tokens (aber teurer wegen gpt-4o!)

---

## Kosten-Schätzung (OpenAI Preise Stand 2024) - AKTUALISIERT

### gpt-4o-mini Preise:
- **Input:** $0.15 / 1M Tokens
- **Output:** $0.60 / 1M Tokens

### gpt-4o Preise:
- **Input:** $2.50 / 1M Tokens
- **Output:** $10.00 / 1M Tokens

### Typische Kosten pro Klausur:

#### 1. Nur Analyse (gpt-4o-mini):
- Input: 1.500 Tokens × $0.15 / 1M = **$0.000225**
- Output: 1.500 Tokens × $0.60 / 1M = **$0.0009**
- **Gesamt: ~$0.0011 pro Klausur**

#### 2. Analyse + Lehrer-Render (gpt-4o-mini):
- **Gesamt: ~$0.0020 pro Klausur**

#### 3. Analyse + Schüler-Render (NEUER WORKFLOW):
- **Analyse:** ~$0.0011
- **Render (1 Call):** ~$0.0009
- **Polishing (6-10 Calls):** ~$0.0014-0.0030
  - Pro Call: ~$0.0002-0.0003
- **Gesamt: ~$0.0034-0.0050 pro Klausur**

#### 4. Analyse + Schüler-Render (FALLBACK-WORKFLOW):
- **Analyse:** ~$0.0011
- **Rendering:** $0 (synchron)
- **Polishing (23 Calls bei 5 Aufgaben):** ~$0.0028-0.0069
  - Pro Call: ~$0.0001-0.0003
- **Gesamt: ~$0.0039-0.0080 pro Klausur**

#### 5. Alternative Bewertung (gpt-4o):
- Input: 1.000 Tokens × $2.50 / 1M = **$0.0025**
- Output: 1.500 Tokens × $10.00 / 1M = **$0.015**
- **Gesamt: ~$0.0175 pro Klausur** ⚠️ (15x teurer!)

---

## Zusammenfassung (AKTUALISIERT)

### Minimale Token-Nutzung (nur Analyse):
- **~3.000 Tokens** pro Klausur
- **Kosten:** ~$0.0011 pro Klausur

### Typische Token-Nutzung (Analyse + Render):
- **Lehrer-Render:** ~5.500 Tokens (~$0.0020 pro Klausur)
- **Schüler-Render (NEU):** ~7.900-10.500 Tokens (~$0.0034-0.0050 pro Klausur)
- **Schüler-Render (FALLBACK):** ~7.600-14.500 Tokens (~$0.0039-0.0080 pro Klausur)

### Maximale Token-Nutzung (komplexe Klausur, alle Schritte):
- **~17.000-20.000 Tokens** pro Klausur
- **Kosten:** ~$0.006-0.012 pro Klausur

### Bei 30 Klausuren:
- **Minimal (nur Analyse):** ~90.000 Tokens (~$0.033)
- **Typisch (Lehrer-Render):** ~165.000 Tokens (~$0.06)
- **Typisch (Schüler-Render NEU):** ~237.000-315.000 Tokens (~$0.10-0.15)
- **Typisch (Schüler-Render FALLBACK):** ~228.000-435.000 Tokens (~$0.12-0.24)
- **Maximal:** ~510.000-600.000 Tokens (~$0.18-0.36)

## ⚠️ WICHTIGE ÄNDERUNGEN NACH IMPLEMENTIERUNG:

1. **Polishing führt zu vielen zusätzlichen API-Calls:**
   - Neuer Workflow: 6-10 zusätzliche Calls für strengths/nextSteps
   - Fallback-Workflow: 23+ Calls bei 5 Aufgaben!

2. **Kosten sind höher als ursprünglich geschätzt:**
   - Schüler-Render kostet jetzt ~$0.0034-0.0080 statt ~$0.0028
   - Grund: Viele kleine Polishing-Calls addieren sich

3. **Optimierungsmöglichkeiten:**
   - Polishing könnte optional gemacht werden
   - Batch-Polishing (mehrere Texte in einem Call) wäre effizienter
   - Caching von häufig verwendeten Phrasen

---

## Empfehlungen

1. **Token-Tracking implementieren:** Logge `response.usage` von allen OpenAI API-Calls
2. **Kosten-Monitoring:** Erstelle Dashboard für Token-Nutzung pro Benutzer/Session
3. **Optimierung:** 
   - Verwende `gpt-4o-mini` wo möglich (nicht `gpt-4o`)
   - Cache häufige Prompts/Templates
   - Reduziere `ANALYSIS_TEMPLATE` Größe falls möglich
4. **Retry-Logik:** Aktuell bis zu 3 Retries bei Fehlern → kann Token-Nutzung erhöhen

