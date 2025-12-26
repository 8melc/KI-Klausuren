import { NextResponse } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';
import type { TeacherTaskView } from '@/lib/renderers/teacher-renderer';
import { polishLanguage, polishMultipleTexts } from '@/lib/language-polisher';

export interface TeacherSummaryOutput {
  strengthsSummary: string[]; // 3-5 Sätze
  developmentAreasSummary: string[]; // 0-5 Sätze, nur bei Note > 3 oder wenn genügend Material
}

export async function POST(req: Request) {
  let tasks: TeacherTaskView[] = [];
  let percentage = 0;
  
  try {
    const body = await req.json() as {
      tasks: TeacherTaskView[];
      percentage: number;
    };
    tasks = body.tasks || [];
    percentage = body.percentage || 0;
  } catch (parseError) {
    return NextResponse.json(
      { error: 'Ungültige Eingabedaten' },
      { status: 400 }
    );
  }
  
  try {

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json(
        { error: 'Ungültige Eingabedaten' },
        { status: 400 }
      );
    }

    // Sammle alle Feedbacks aus den Tasks
    const allStrengths: string[] = [];
    const allImprovements: string[] = [];
    const allTips: string[] = [];
    const allCorrections: string[] = [];

    tasks.forEach((task) => {
      allStrengths.push(...task.correctAspects);
      allImprovements.push(...task.deductions);
      allTips.push(...task.improvementHints);
      allCorrections.push(...task.corrections);
    });

    // Berechne Note (vereinfacht)
    const note = percentage >= 80 ? 2 : percentage >= 65 ? 3 : percentage >= 50 ? 4 : percentage >= 30 ? 5 : 6;
    const showDevelopmentAreas = note > 3 || allImprovements.length > 0 || allTips.length > 0;

    // Definiere Notenbereiche für unterschiedliche Gewichtungen
    const isNote1to2 = percentage >= 80;
    const isNote3 = percentage >= 65 && percentage < 80;
    const isNote4 = percentage >= 50 && percentage < 65;
    const isNote5to6 = percentage < 50;

    // Erstelle Prompt für OpenAI
    const openai = getOpenAIClient();

    // Notenabhängige Anweisungen für den Prompt
    let gradeSpecificInstructions = '';
    let strengthsCount = 3;
    let developmentAreasCount = 3;

    if (isNote1to2) {
      gradeSpecificInstructions = `
**NOTENBEREICH: Note 1-2 (sehr gut / gut) - GEWICHTUNG: 70-80% Stärken, 20-30% Feintuning**

**FOKUS:**
- Klare Benennung der herausragenden Kompetenzen (z.B. sehr sichere Fachbegriffsnutzung, selbstständige Anwendung von Modellen, strukturierte Argumentation)
- Entwicklungsbereiche nur als "Feinschliff" (z.B. noch präzisere Formulierungen, gelegentliche Flüchtigkeitsfehler)
- Nächste Schritte: Vertiefung, anspruchsvollere Aufgaben, Transfer auf neue Kontexte

**ANZAHL DER SÄTZE:**
- Stärken: 4-5 Sätze (herausragende Kompetenzen detailliert beschreiben)
- Entwicklungsbereiche: 1-2 Sätze (nur Feintuning, keine grundlegenden Defizite)`;
      strengthsCount = 5;
      developmentAreasCount = 2;
    } else if (isNote3) {
      gradeSpecificInstructions = `
**NOTENBEREICH: Note 3 (befriedigend) - GEWICHTUNG: ca. 50% Stärken, 50% Entwicklungsbereiche**

**FOKUS:**
- Betonung, dass die grundlegenden Kompetenzen vorhanden sind, aber noch nicht stabil
- Konkrete Hinweise, in welchen Bereichen Unsicherheiten bestehen (z.B. Nomenklatur, Auswertung von Materialien, Begründungstiefe)
- Nächste Schritte: gezieltes Üben in 2-3 klar benannten Schwerpunkten mit konkreten Lernstrategien

**ANZAHL DER SÄTZE:**
- Stärken: 2-3 Sätze (vorhandene Kompetenzen, aber noch nicht stabil)
- Entwicklungsbereiche: 2-3 Sätze (konkrete Unsicherheiten und Übungsschwerpunkte)`;
      strengthsCount = 3;
      developmentAreasCount = 3;
    } else if (isNote4) {
      gradeSpecificInstructions = `
**NOTENBEREICH: Note 4 (ausreichend) - GEWICHTUNG: ca. 30-40% Stärken, 60-70% Entwicklungsbereiche**

**FOKUS:**
- Benenne 1-2 wirklich vorhandene Stärken (z.B. richtige Grundideen, einzelne korrekt gelöste Aufgaben), um motivierend zu bleiben
- Klare Beschreibung der Lücken in Kernkompetenzen (z.B. Verständnis zentraler Begriffe, unvollständige Begründungen, unsichere Rechenwege)
- Nächste Schritte: sehr konkrete, kleine Lernziele ("zuerst ... üben, dann ..."), ggf. Empfehlung zu zusätzlicher Unterstützung

**ANZAHL DER SÄTZE:**
- Stärken: 1-2 Sätze (nur wirklich vorhandene Stärken, motivierend)
- Entwicklungsbereiche: 3-4 Sätze (klare Lücken und sehr konkrete, schrittweise Lernziele)`;
      strengthsCount = 2;
      developmentAreasCount = 4;
    } else {
      // Note 5-6
      gradeSpecificInstructions = `
**NOTENBEREICH: Note 5-6 (mangelhaft / ungenügend) - FOKUS: Defizite, aber wertschätzend**

**FOKUS:**
- Deutlich machen, dass die Mindestanforderungen nicht erreicht wurden (z.B. viele Aufgaben leer/falsch, zentrale Konzepte nicht verstanden)
- 1-2 positive Ansatzpunkte suchen (z.B. Ansätze in einzelnen Teilaufgaben)
- Sehr konkrete, schrittweise Empfehlungen, wie die Schülerin/der Schüler auf ein ausreichendes Niveau kommen kann (z.B. Grundlagenkapitel X wiederholen, mit Lehrkraft Übungen zu Thema Y, Vokabeln/Fachbegriffe trainieren)
- Sprache: klar, aber respektvoll; keine beschönigenden Standardfloskeln

**ANZAHL DER SÄTZE:**
- Stärken: 1 Satz (positive Ansatzpunkte, falls vorhanden)
- Entwicklungsbereiche: 4-5 Sätze (sehr konkrete, schrittweise Empfehlungen zum Erreichen des ausreichenden Niveaus)`;
      strengthsCount = 1;
      developmentAreasCount = 5;
    }

    const prompt = `Du bist eine erfahrene Lehrkraft. Du erhältst Feedback-Daten aus einer Klausurbewertung.

**STÄRKEN (Was war gut):**
${allStrengths.length > 0 ? allStrengths.map((s, i) => `${i + 1}. ${s}`).join('\n') : 'Keine Stärken vorhanden.'}

**VERBESSERUNGSBEDARF (Was war falsch/Abzüge):**
${allImprovements.length > 0 ? allImprovements.map((s, i) => `${i + 1}. ${s}`).join('\n') : 'Keine Verbesserungen vorhanden.'}

**TIPP (Verbesserungshinweise):**
${allTips.length > 0 ? allTips.map((s, i) => `${i + 1}. ${s}`).join('\n') : 'Keine Tipps vorhanden.'}

**KORREKTUREN:**
${allCorrections.length > 0 ? allCorrections.map((s, i) => `${i + 1}. ${s}`).join('\n') : 'Keine Korrekturen vorhanden.'}

**GESAMTLEISTUNG:** ${percentage.toFixed(1)}% (Note: ${note})

${gradeSpecificInstructions}

**AUFGABE:**
Erstelle eine verdichtete, pädagogische Zusammenfassung in 3. Person ("Der Schüler...", "Die Schülerleistung zeigt...") mit folgenden ZWINGENDEN Anforderungen:

**1. STÄRKEN (${strengthsCount} Sätze) - Konkrete Kompetenzbereiche benennen:**

Nenne explizit, in welchen Kompetenzbereichen der Schüler Stärken zeigt, z.B.:
- "Umgang mit Fachbegriffen und chemischer Fachsprache"
- "Verständnis und Anwendung von Modellen (z.B. Teilchenmodell, Reaktionsschema)"
- "Reaktionsmechanismen und logische Argumentation"
- "Auswertung von Experimenten / Materialbezug / Diagramminterpretation"
- "Strukturformeln und chemische Nomenklatur"
- "Textverständnis und Aufgabenanalyse"

Formuliere pro Kompetenzbereich 1-2 präzise Sätze, die den Stand beschreiben (z.B. "Der Schüler zeigt ein sicheres Verständnis der C-C-Ketten und kann Strukturformeln formal korrekt darstellen." oder "Im Bereich der Fachsprache gelingt es dem Schüler teilweise, Fachbegriffe korrekt zu verwenden.").

**WICHTIG:** Die Anzahl und Gewichtung der Stärken-Sätze muss exakt dem Notenbereich entsprechen (siehe oben).

**2. ENTWICKLUNGSBEREICHE (${developmentAreasCount} Sätze${isNote1to2 ? ', nur als Feintuning' : ''}) - Konkrete, handlungsorientierte nächste Schritte:**

Formuliere mindestens 3-4 sehr konkrete, handlungsorientierte Empfehlungen. Jede Empfehlung MUSS eine konkrete Lernhandlung enthalten (was tun, wie üben, mit welchem Material/Ansatz).

Beispiele für gute Formulierungen:
- "Der Schüler sollte gezielt üben, Fachbegriffe wie [konkrete Begriffe] korrekt in eigenen Sätzen zu verwenden (z.B. durch kurze Merklisten oder Karteikarten)."
- "Bei der Bearbeitung von Reaktionsaufgaben sollte der Schüler zunächst den Reaktionstyp bestimmen und dann in Stichpunkten den Reaktionsweg planen, bevor er schreibt."
- "Zur Vertiefung eignet sich, ähnliche Aufgaben aus dem Unterricht oder aus dem Schulbuch zu bearbeiten und die Lösungen anschließend mit dem Erwartungshorizont zu vergleichen."
- "Der Schüler sollte systematisch üben, Diagramme und Experimente zu interpretieren, indem er zunächst die Achsenbeschriftungen und Legenden genau liest."

Jede Empfehlung muss:
- Eine konkrete Lernhandlung beschreiben (nicht nur "sollte besser werden")
- Einen Übungsansatz oder eine Methode nennen
- Optional: Material oder Ressourcen erwähnen

**WICHTIG:** Die Anzahl und Art der Entwicklungsbereich-Sätze muss exakt dem Notenbereich entsprechen (siehe oben). Bei Note 5-6 müssen die Empfehlungen sehr konkret und schrittweise sein (z.B. "zuerst Grundlagenkapitel X wiederholen, dann mit Lehrkraft Übungen zu Thema Y").

**3. GESAMTURTEIL + AUSBLICK (1-2 Sätze):**

Baue 1-2 Sätze ein, die die Leistung im Verhältnis zum Erwartungshorizont einordnen:
${isNote1to2 ? '- "Die Leistung entspricht den Anforderungen für Note 1-2 und zeigt herausragende Kompetenzen."' : ''}
${isNote3 ? '- "Die Mindestanforderungen wurden überwiegend erfüllt, die Kompetenzen sind vorhanden, aber noch nicht stabil."' : ''}
${isNote4 ? '- "Die Mindestanforderungen wurden teilweise erfüllt, es bestehen noch Lücken in Kernkompetenzen."' : ''}
${isNote5to6 ? '- "Die Mindestanforderungen wurden noch nicht erfüllt, zentrale Konzepte sind noch nicht verstanden."' : ''}

Schließe mit einem motivierenden, aber ehrlichen Ausblick:
${isNote1to2 ? '- "Mit gezieltem Feintuning kann der Schüler seine bereits sehr guten Kompetenzen weiter ausbauen."' : ''}
${isNote3 ? '- "Wenn der Schüler die genannten Bereiche gezielt trainiert, kann er die Kompetenzen stabilisieren und die Note verbessern."' : ''}
${isNote4 ? '- "Mit gezieltem Üben in den genannten Schwerpunkten kann der Schüler die Lücken schließen und die Note verbessern."' : ''}
${isNote5to6 ? '- "Wenn der Schüler die genannten Schritte systematisch umsetzt und ggf. zusätzliche Unterstützung in Anspruch nimmt, kann er die Mindestanforderungen erreichen."' : ''}

**WICHTIG - FORM & SPRACHE:**
- Formuliere in sachlicher Lehrkraft-Perspektive (3. Person: "der Schüler / die Schülerin")
- Sachlich und wertschätzend
- Verdichte die Informationen zu übergreifenden Mustern, keine Aufgabe-für-Aufgabe-Auflistung
- Keine reinen Wiederholungen der Aufgabenformulierungen
- Der Text soll ein verdichtetes pädagogisches Feedback sein, kein Aufgabenprotokoll
- Jeder Satz soll eine vollständige, grammatikalisch korrekte Aussage sein

Antworte NUR als JSON-Objekt im folgenden Format:
{
  "strengthsSummary": ["Satz 1 mit konkretem Kompetenzbereich", "Satz 2", ...],
  "developmentAreasSummary": ["Konkrete Empfehlung 1 mit Lernhandlung", "Konkrete Empfehlung 2", ..., "Gesamturteil + Ausblick"]
}

**KRITISCH WICHTIG:**
- Die Anzahl der Sätze in strengthsSummary muss genau ${strengthsCount} betragen
- Die Anzahl der Sätze in developmentAreasSummary muss genau ${developmentAreasCount} betragen (inklusive Gesamturteil + Ausblick)
- Der letzte Satz in developmentAreasSummary soll das Gesamturteil + Ausblick enthalten
- Die Gewichtung und der Inhaltstyp müssen exakt dem Notenbereich entsprechen (siehe oben)`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du bist eine erfahrene Lehrkraft, die pädagogisch wertvolle Zusammenfassungen erstellt. Antworte immer als JSON-Objekt.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const responseText = response.choices[0]?.message?.content || '';
    if (!responseText) {
      throw new Error('Keine Antwort von OpenAI erhalten');
    }

    const parsed = JSON.parse(responseText) as {
      strengthsSummary?: string[];
      developmentAreasSummary?: string[];
    };

    // Language-Polish auf die finalen Texte anwenden
    const rawStrengths = Array.isArray(parsed.strengthsSummary) ? parsed.strengthsSummary : [];
    const rawDevelopmentAreas = showDevelopmentAreas && Array.isArray(parsed.developmentAreasSummary)
      ? parsed.developmentAreasSummary
      : [];

    // Polishe alle Texte parallel - aber nur wenn nötig (kann ausgelassen werden für bessere Performance)
    // Option: Language-Polish optional machen oder nur bei Bedarf
    const [polishedStrengths, polishedDevelopmentAreas] = await Promise.all([
      rawStrengths.length > 0 ? polishMultipleTexts(rawStrengths) : Promise.resolve([]),
      rawDevelopmentAreas.length > 0 ? polishMultipleTexts(rawDevelopmentAreas) : Promise.resolve([]),
    ]);

    const result: TeacherSummaryOutput = {
      strengthsSummary: polishedStrengths,
      developmentAreasSummary: polishedDevelopmentAreas,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Fehler beim Erstellen der Lehrer-Zusammenfassung:', error);
    
    // KEIN Fallback mit rohen Task-Daten mehr
    // Die API sollte immer funktionieren, da sie serverseitig läuft
    // Falls sie fehlschlägt, geben wir leere Arrays zurück
    // Die UI zeigt dann "Keine zusammenfassende Bewertung vorhanden"
    return NextResponse.json({
      strengthsSummary: [],
      developmentAreasSummary: [],
    });
  }
}

