import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { GradingResult } from './grading-schema';

export interface GenerateFeedbackPdfInput {
  studentName: string;
  klausurTitle: string;
  date: string;
  gradingResult: GradingResult;
}

export async function generateFeedbackPdf(input: GenerateFeedbackPdfInput): Promise<Uint8Array> {
  try {
    console.log('Generiere PDF für:', input.studentName);
    console.log('Anzahl Aufgaben:', input.gradingResult.tasks.length);

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;

    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;

    const ensureSpace = (lineHeight: number) => {
      if (yPosition - lineHeight < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
      }
    };

    const wrapLines = (text: string, currentFont: typeof font, fontSize: number): string[] => {
      if (!text) return [''];

      const words = text.split(' ');
      const lines: string[] = [];
      let line = '';

      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        const width = currentFont.widthOfTextAtSize(testLine, fontSize);

        if (width > contentWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }

      if (line) {
        lines.push(line);
      }

      return lines.length > 0 ? lines : [''];
    };

    const drawParagraph = (
      text: string,
      fontSize: number,
      options: { bold?: boolean; color?: ReturnType<typeof rgb> } = {}
    ) => {
      const currentFont = options.bold ? fontBold : font;
      const color = options.color ?? rgb(0, 0, 0);

      for (const paragraph of text.split('\n')) {
        const lines = wrapLines(paragraph, currentFont, fontSize);
        for (const line of lines) {
          ensureSpace(fontSize * 1.5);
          currentPage.drawText(line, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: currentFont,
            color,
          });
          yPosition -= fontSize * 1.5;
        }
        yPosition -= fontSize * 0.3;
      }
    };

    drawParagraph('Klausurbewertung', 24, { bold: true });
    yPosition -= 10;
    drawParagraph('─'.repeat(50), 10, { color: rgb(0.6, 0.6, 0.6) });
    yPosition -= 10;

    drawParagraph(`Dateiname: ${input.studentName}`, 12);
    drawParagraph(`Klausur: ${input.klausurTitle}`, 12);
    drawParagraph(`Datum: ${input.date}`, 12);
    drawParagraph(
      `Gesamtpunkte: ${input.gradingResult.totalPoints} / ${input.gradingResult.maxPoints}`,
      12,
      { bold: true }
    );
    drawParagraph(`Note: ${input.gradingResult.grade}`, 12, { bold: true });

    yPosition -= 20;
    drawParagraph('Detailbewertung:', 14, { bold: true });
    yPosition -= 10;

    for (const task of input.gradingResult.tasks) {
      drawParagraph(`Aufgabe ${task.id}`, 12, { bold: true });
      drawParagraph(`Punkte: ${task.points} / ${task.maxPoints}`, 11);
      drawParagraph(`Analyse: ${task.analysis}`, 11);

      if (task.errors) {
        drawParagraph(`Fehler: ${task.errors}`, 11);
      }

      if (task.suggestion) {
        drawParagraph(`Verbesserung: ${task.suggestion}`, 11);
      }

      yPosition -= 10;
      drawParagraph('─'.repeat(60), 9, { color: rgb(0.8, 0.8, 0.8) });
      yPosition -= 5;
    }

    yPosition -= 10;
    drawParagraph('Gesamtfeedback:', 14, { bold: true });
    drawParagraph(input.gradingResult.summary, 12);

    const pdfBytes = await pdfDoc.save();
    console.log('PDF erfolgreich generiert:', pdfBytes.length, 'bytes');
    return pdfBytes;
  } catch (err) {
    console.error('PDF-Generierung error:', err);
    throw new Error(`PDF-Generierung fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
  }
}
