/**
 * Language-Polisher für deutsche Texte
 * 
 * Korrigiert Grammatik, Rechtschreibung, Konjugation und Satzlogik
 * für Schüler-Texte, bevor sie in DOCX-Dokumente eingefügt werden.
 */

import { getOpenAIClient } from './openai';

const MAX_RETRIES = 3;
const POLISHING_TIMEOUT = 30000; // 30 Sekunden

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

export const LANGUAGE_POLISHER_SYSTEM_PROMPT = `
Du bist ein professionelles deutsches Korrektursystem.

DEINE AUFGABE:
Überarbeite den Text NUR in Rechtschreibung, Grammatik, Zeichensetzung,
Satzbau und Klarheit.

DU VERÄNDERST NICHT:
- Inhalte
- Reihenfolge
- Fakten
- den Sinn der Aussagen

DU MUSST:
- abgebrochene Sätze reparieren ("Du c" → "Du hast die Strukturformeln korrekt gezeichnet.")
- unvollständige Aussagen vervollständigen
- Grammatikfehler korrigieren
- richtige du-Konjugation verwenden (du hast, du erklärst ...)
- Fachbegriffe korrekt schreiben
- natürliche, kindgerechte Sprache erzeugen
- Wiederholungen entfernen

BEISPIELE:
"Du hast London." → "Du hast die London-Kräfte korrekt beschrieben."
"Du solltest das Wort." → "Du solltest die Fachbegriffe genauer verwenden."

GIB ZURÜCK:
Nur den korrigierten Text. Keine Erklärungen.
`;

/**
 * Poliert einen deutschen Text: korrigiert Grammatik, Rechtschreibung, Konjugation
 * 
 * @param text - Der zu korrigierende Text
 * @returns Der korrigierte Text oder der Originaltext bei Fehlern
 */
export async function polishLanguage(text: string): Promise<string> {
  // Leere oder sehr kurze Texte nicht polieren
  if (!text || text.trim().length < 10) {
    return text;
  }

  const openai = getOpenAIClient();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Timeout-Wrapper für die API-Call
      const polishingPromise = openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: LANGUAGE_POLISHER_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: `Korrigiere folgenden Text sprachlich:\n\n${text}`,
          },
        ],
        temperature: 0.1, // Sehr konservativ für Korrekturen
        max_tokens: Math.min(2000, text.length * 2), // Max Tokens basierend auf Input-Länge
      });

      // Timeout-Handling
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Polishing timeout')), POLISHING_TIMEOUT);
      });

      const response = await Promise.race([polishingPromise, timeoutPromise]);

      // Token-Usage Tracking
      if (response.usage) {
        const cost = calculateCost(response.usage, 'gpt-4o-mini');
        console.log('[Token-Usage] Language-Polish:', {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens,
          estimated_cost_usd: cost.toFixed(6),
        });
      }

      const polishedText = response.choices[0]?.message?.content?.trim();
      
      if (!polishedText) {
        throw new Error('Keine Antwort vom Language-Polisher erhalten');
      }

      // Stelle sicher, dass der polierte Text nicht leer ist
      if (polishedText.length < 5) {
        throw new Error('Polierter Text zu kurz');
      }

      return polishedText;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Language-Polishing Fehler (Versuch ${attempt + 1}/${MAX_RETRIES}):`, {
        message: lastError.message,
        textLength: text.length,
        textPreview: text.substring(0, 50) + '...',
      });

      if (attempt < MAX_RETRIES - 1) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        continue;
      }
    }
  }

  // Bei Fehler: Originaltext zurückgeben (mit Warnung)
  console.warn('Language-Polishing endgültig fehlgeschlagen, verwende Originaltext:', {
    error: lastError?.message,
    textPreview: text.substring(0, 100) + '...',
  });

  return text; // Fallback: Originaltext
}

/**
 * Poliert mehrere Texte parallel
 * 
 * @param texts - Array von Texten zum Polieren
 * @returns Array von polierten Texten (oder Originaltexten bei Fehlern)
 */
export async function polishMultipleTexts(texts: string[]): Promise<string[]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  // Parallele Verarbeitung mit Promise.all
  const polishingPromises = texts.map((text) => polishLanguage(text));
  
  try {
    return await Promise.all(polishingPromises);
  } catch (error) {
    console.error('Fehler beim parallelen Polishing mehrerer Texte:', error);
    // Bei Fehler: Originaltexte zurückgeben
    return texts;
  }
}

