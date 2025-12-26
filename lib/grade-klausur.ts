import OpenAI from 'openai';
import { GradingResult, gradingSchema } from './grading-schema';

/**
 * Berechnet geschätzte Kosten basierend auf Token-Usage
 */
function calculateCost(
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number },
  model: 'gpt-4o-mini' | 'gpt-4o'
): number {
  // Preise pro 1M Tokens (Stand 2024)
  const prices = {
    'gpt-4o-mini': {
      input: 0.15 / 1_000_000,
      output: 0.60 / 1_000_000,
    },
    'gpt-4o': {
      input: 2.50 / 1_000_000,
      output: 10.00 / 1_000_000,
    },
  };

  const modelPrices = prices[model];
  const inputCost = usage.prompt_tokens * modelPrices.input;
  const outputCost = usage.completion_tokens * modelPrices.output;
  return inputCost + outputCost;
}

export interface GradeKlausurInput {
  expectationHorizon: string;
  gradingRubric: string;
  examText: string;
  studentAnswers: string;
}

export async function gradeKlausur(input: GradeKlausurInput): Promise<GradingResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API Key nicht konfiguriert');
  }

  const client = new OpenAI({ apiKey });

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
    console.log('Starte KI-Bewertung...');
    console.log('Prompt-Länge:', prompt.length, 'Zeichen');

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Du bist ein präziser, fairer Lehrer. Du bewertest Klausuren nach vorgegebenen Kriterien und gibst strukturiertes Feedback.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'klausur_bewertung',
          schema: gradingSchema,
          strict: true,
        },
      },
      temperature: 0.3,
    });

    // Token-Usage Tracking
    if (response.usage) {
      const cost = calculateCost(response.usage, 'gpt-4o');
      console.log('[Token-Usage] gradeKlausur (gpt-4o):', {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
        estimated_cost_usd: cost.toFixed(6),
      });
    }

    const parsedContent = response.choices[0]?.message?.content ?? '{}';
    const result = JSON.parse(parsedContent) as GradingResult;
    console.log('Bewertung abgeschlossen:', result.totalPoints, '/', result.maxPoints);
    return result;
  } catch (err) {
    console.error('KI-Bewertung error:', err);
    throw new Error(`Bewertung fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
  }
}
