import { GoogleGenerativeAI } from '@google/generative-ai';

export async function extractHandwrittenPdfText(uint8: Uint8Array): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) {
    throw new Error('Google AI Key nicht konfiguriert');
  }

  try {
    console.log('Starte Handschrift-Extraktion mit Gemini...');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent([
      {
        inlineData: {
          data: Buffer.from(uint8).toString('base64'),
          mimeType: 'application/pdf'
        }
      },
      'Transkribiere den gesamten handgeschriebenen Text aus diesem PDF. Behalte die Struktur bei (Aufgabennummern, Absätze). Gib nur den reinen Text zurück.'
    ]);

    const text = result.response.text();
    console.log('Handschrift-Extraktion abgeschlossen:', text.length, 'Zeichen');
    return text;

  } catch (err) {
    console.error('Handschrift-Extraktion error:', err);
    throw new Error(`Handschrift-Extraktion fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
  }
}