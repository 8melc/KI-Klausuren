import OpenAI, { type Uploadable } from 'openai';
import { File } from 'node:buffer';

const EXTRACTION_PROMPT =
  'Extrahiere den vollständigen Text aus dieser PDF-Datei. Gib nur Text zurück, ohne Analyse.';

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API Key nicht konfiguriert');
  }

  const client = new OpenAI({ apiKey });
  const uint8Array = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);

  try {
    const uploadFile = new File([uint8Array], 'klausur.pdf', { type: 'application/pdf' });
    const uploaded = await client.files.create({
      file: uploadFile as Uploadable,
      purpose: 'assistants',
    });

    const response = await client.responses.create({
      model: 'gpt-4.1',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: EXTRACTION_PROMPT },
            { type: 'input_file', file_id: uploaded.id },
          ],
        },
      ],
    });

    await client.files.delete(uploaded.id).catch(() => {});

    const text = extractResponseText(response as unknown as VisionResponse);
    if (!text) {
      throw new Error('PDF-Textextraktion fehlgeschlagen');
    }
    return text;
  } catch (error) {
    console.error('Vision-only PDF extraction error:', error);
    throw new Error('PDF-Textextraktion fehlgeschlagen');
  }
}

type ResponseContent =
  | string
  | {
      type?: string;
      text?: string | { value?: string };
    };

type ResponseChunk = {
  content?: ResponseContent[];
};

type VisionResponse = {
  output_text?: string[];
  output?: ResponseChunk[];
};

function extractResponseText(response: VisionResponse): string {
  if (Array.isArray(response.output_text) && response.output_text.length > 0) {
    return response.output_text.join('').trim();
  }

  if (!Array.isArray(response.output)) {
    return '';
  }

  return response.output
    .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
    .map((content) => {
      if (typeof content === 'string') {
        return content;
      }

      if (content?.type === 'output_text') {
        if (typeof content.text === 'string') return content.text;
        if (content.text && typeof content.text === 'object' && 'value' in content.text) {
          return content.text.value ?? '';
        }
      }

      if (content?.type === 'text' && typeof content.text === 'string') {
        return content.text;
      }

      return '';
    })
    .join('')
    .trim();
}
