import OpenAI from 'openai';

let cachedClient: OpenAI | null = null;

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

  const prompt = `Du bist ein erfahrener Lehrer, der Klausuren korrigiert.

ERWARTUNGSHORIZONT:
${erwartungshorizont}

Klausur-Text:
${klausurText}

Bitte analysiere die Klausur anhand des Erwartungshorizonts und gib eine detaillierte Bewertung im folgenden JSON-Format zurück:
{
  "gesamtpunkte": <maximale Gesamtpunktzahl>,
  "erreichtePunkte": <erreichte Punktzahl>,
  "prozent": <Prozentzahl>,
  "aufgaben": [
    {
      "aufgabe": "<Aufgabenbezeichnung>",
      "maxPunkte": <maximale Punkte>,
      "erreichtePunkte": <erreichte Punkte>,
      "kommentar": "<Kommentar zur Aufgabe>",
      "korrekturen": ["<Korrekturhinweis 1>", "<Korrekturhinweis 2>"]
    }
  ],
  "zusammenfassung": "<Zusammenfassende Bewertung>"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Du bist ein präziser und fairer Lehrer. Antworte ausschließlich im angeforderten JSON-Format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

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
