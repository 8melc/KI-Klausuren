import OpenAI from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as PopplerModule from 'node-poppler';
import sharp from 'sharp';

const Poppler = (PopplerModule as any).default || PopplerModule;

export async function extractHandwrittenPdfText(uint8: Uint8Array): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API Key nicht konfiguriert');
  }

  const client = new OpenAI({ apiKey });
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pdf-ocr-'));

  try {
    console.log('Starte Handschrift-Extraktion...');

    // PDF temporär speichern
    const pdfPath = path.join(tempDir, 'input.pdf');
    await fs.writeFile(pdfPath, uint8);

    // Poppler initialisieren
    const poppler = new Poppler('/opt/homebrew/bin');

    // PDF Info holen (Anzahl Seiten)
    const info = await poppler.pdfInfo(pdfPath);
    const pageCount = parseInt(info.pages || '1');
    
    console.log(`PDF hat ${pageCount} Seiten`);

    const pageTexts: string[] = [];

    // Jede Seite einzeln konvertieren
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const outputPath = path.join(tempDir, `page-${pageNum}.png`);
      
      console.log(`Verarbeite Seite ${pageNum}/${pageCount}...`);

      // PDF-Seite → PNG konvertieren
      await poppler.pdfToCairo(pdfPath, outputPath, {
        pngFile: true,
        singleFile: true,
        firstPageToConvert: pageNum,
        lastPageToConvert: pageNum,
        resolutionXYAxis: 300  // DPI
      });

      // PNG laden
      const imageBuffer = await fs.readFile(outputPath);
      
      // Mit sharp komprimieren
      const compressedBuffer = await sharp(imageBuffer)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .png({ quality: 90 })
        .toBuffer();

      const base64Image = compressedBuffer.toString('base64');

      // GPT-4o Vision OCR
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Transkribiere den gesamten handgeschriebenen Text auf dieser Klausurseite. Behalte die Struktur bei (Aufgabennummern, Absätze). Gib nur den reinen Text zurück.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4096,
      });

      const pageText = response.choices[0]?.message?.content ?? '';
      pageTexts.push(`--- SEITE ${pageNum} ---\n${pageText}`);
    }

    const fullText = pageTexts.join('\n\n');
    console.log('Handschrift-Extraktion abgeschlossen:', fullText.length, 'Zeichen');
    return fullText;

  } catch (err) {
    console.error('Handschrift-Extraktion error:', err);
    throw new Error(`Handschrift-Extraktion fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    // Temp-Dateien aufräumen
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.warn('Temp-Cleanup-Fehler:', cleanupErr);
    }
  }
}