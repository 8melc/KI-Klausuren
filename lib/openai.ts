import OpenAI from 'openai';
import { ANALYSIS_TEMPLATE } from './analysis-template';
import { generateLanguageInstructions, TEACHER_CONFIG, generateAdaptiveDetailLevel } from './analysis-language-config';
import { performMasterAnalysis } from './analysis/controller';
import type { UniversalAnalysis, MasterAnalysisInput } from './analysis/types';

let cachedClient: OpenAI | null = null;

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

export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API Key nicht konfiguriert');
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return cachedClient;
}

export interface KlausurAnalyse {
  gesamtpunkte: number;
  erreichtePunkte: number;
  prozent: number;
  aufgaben: Array<{
    aufgabe: string;
    maxPunkte: number;
    erreichtePunkte: number;
    kommentar: string;
    korrekturen: string[];
  }>;
  zusammenfassung: string;
}

export async function analyzeKlausur(
  klausurText: string,
  erwartungshorizont: string
): Promise<KlausurAnalyse> {
  const openai = getOpenAIClient();

  // Sprach-Konfiguration für Lehrer-Ansicht
  const languageConfig = TEACHER_CONFIG;
  const languageInstructions = generateLanguageInstructions(languageConfig);

  const prompt = `Du bist ein erfahrener Lehrer, der Klausuren korrigiert.

${languageInstructions}

ADAPTIVER DETAILGRAD (verbindlich - wende diese Regeln basierend auf den erreichten Punkten pro Aufgabe an):
- Wenn weniger als 40% der Punkte erreicht wurden:
  * Sehr ausführliche Analyse erforderlich
  * Mindestens 3–6 Fehlerpunkte in 'korrekturen' oder im Abschnitt 'HIER GAB ES ABZÜGE'
  * Mindestens 3–5 Verbesserungstipps im Abschnitt 'VERBESSERUNGSTIPP'
  * Detaillierte Erklärungen zu Missverständnissen
  * Ausführliche Begründung der Punktevergabe
  * Konkrete Beispiele für Fehler und Verbesserungen

- Wenn zwischen 40% und 70% der Punkte erreicht wurden:
  * Mittlere Tiefe der Analyse
  * 2–4 Fehlerpunkte in 'korrekturen' oder im Abschnitt 'HIER GAB ES ABZÜGE'
  * 2–4 Verbesserungstipps im Abschnitt 'VERBESSERUNGSTIPP'
  * Ausgewogene Darstellung von Stärken und Schwächen
  * Klare Begründung der Punktevergabe

- Wenn über 70% der Punkte erreicht wurden:
  * Kurze, präzise Analyse
  * 1–2 Fehlerpunkte in 'korrekturen' oder im Abschnitt 'HIER GAB ES ABZÜGE'
  * 1–2 Verbesserungstipps im Abschnitt 'VERBESSERUNGSTIPP'
  * Fokus auf Feinschliff und Optimierung
  * Betonung der Stärken mit gezielten Verbesserungsvorschlägen

Diese Regeln müssen für JEDE Aufgabe individuell angewendet werden, basierend auf den erreichten Punkten dieser Aufgabe.

ERWARTUNGSHORIZONT:
${erwartungshorizont}

Klausur-Text:
${klausurText}

${ANALYSIS_TEMPLATE.trim() !== '' ? `\n=== VORLAGE FÜR DIE ANALYSE ===
Diese Vorlage zeigt dir, wie eine perfekte Klausurbewertung aussehen soll:

${ANALYSIS_TEMPLATE}

WICHTIG: Orientiere dich an dieser Vorlage für:
- Struktur: Verwende die gleiche Art der Aufgabenanalyse (DAS WAR RICHTIG, HIER GAB ES ABZÜGE, VERBESSERUNGSTIPP)
- Detaillierungsgrad: Passe den Detailgrad an die erreichte Punktzahl an (siehe ADAPTIVER DETAILGRAD oben)
- Stil: Formuliere Kommentare und Korrekturen im gleichen präzisen, konstruktiven Stil
- Zusammenfassung: Strukturiere die Zusammenfassung ähnlich (Stärken, Entwicklungsbereiche)

\n` : ''}Bitte analysiere die Klausur anhand des Erwartungshorizonts und gib eine detaillierte Bewertung im folgenden JSON-Format zurück:
{
  "gesamtpunkte": <maximale Gesamtpunktzahl>,
  "erreichtePunkte": <erreichte Punktzahl>,
  "prozent": <Prozentzahl>,
  "aufgaben": [
    {
      "aufgabe": "<Aufgabenbezeichnung>",
      "maxPunkte": <maximale Punkte>,
      "erreichtePunkte": <erreichte Punkte>,
      "kommentar": "<Detaillierter Kommentar zur Aufgabe - strukturiere wie in der Vorlage: DAS WAR RICHTIG (positive Aspekte in 3. Person), HIER GAB ES ABZÜGE (negative Aspekte in 3. Person), VERBESSERUNGSTIPP (konkrete Tipps in 3. Person). ALLE Texte müssen vollständige Sätze in 3. Person enthalten, keine 1-Wort-Stichpunkte.>",
      "korrekturen": ["<Vollständiger Satz als Korrekturhinweis 1 in 3. Person - formuliere präzise wie in der Vorlage>", "<Vollständiger Satz als Korrekturhinweis 2 in 3. Person>"]
    }
  ],
      "zusammenfassung": "<Zusammenfassende Bewertung in 3. Person - strukturiere wie in der Vorlage mit Stärken und Entwicklungsbereichen. Formuliere IMMER in 3. Person (Der/die Schüler/in zeigt..., Die Leistung weist auf...). Keine Du-Form, keine direkte Ansprache.>"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Du bist ein präziser und fairer Lehrer. Antworte ausschließlich im angeforderten JSON-Format.

VERBINDLICHE REGELN (MÜSSEN IMMER EINGEHALTEN WERDEN):
1. SPRACHE: IMMER 3. Person für Lehrer-Ansicht. NIEMALS Du-Form oder direkte Anrede.
2. ADAPTIVER DETAILGRAD: Passe die Anzahl der Fehlerpunkte und Verbesserungstipps an die erreichte Punktzahl an (siehe ADAPTIVER DETAILGRAD im Prompt).
3. VOLLSTÄNDIGKEIT: Alle Felder müssen vollständige Sätze enthalten, keine leeren Felder, keine 1-Wort-Stichpunkte.
4. TON: Neutral, sachlich, formal, fachlich präzise. Keine Umgangssprache.

Orientiere dich an der bereitgestellten Vorlage für Stil, Detaillierungsgrad und Struktur der Analyse.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    // Token-Usage Tracking
    if (response.usage) {
      const cost = calculateCost(response.usage, 'gpt-4o-mini');
      console.log('[Token-Usage] analyzeKlausur (alt):', {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
        estimated_cost_usd: cost.toFixed(6),
      });
    }

    const responseText = response.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('Keine Antwort von OpenAI erhalten');
    }

    const analysis = JSON.parse(responseText) as KlausurAnalyse;
    return analysis;
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw new Error('Fehler bei der Analyse der Klausur');
  }
}

/**
 * Neue universelle Analyse-Funktion (fachspezifisch, universales JSON)
 * Diese Funktion nutzt die neue Backend-Architektur
 * Ersetzt die alte analyzeKlausur-Funktion für neue Implementierungen
 */
export async function analyzeKlausurUniversal(
  input: MasterAnalysisInput
): Promise<UniversalAnalysis> {
  return performMasterAnalysis(input);
}
