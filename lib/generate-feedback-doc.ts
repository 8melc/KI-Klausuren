import { Document, HeadingLevel, Paragraph, TextRun, Packer } from 'docx';
import { KlausurAnalyse } from './openai';

interface GenerateFeedbackDocInput {
  klausurName: string;
  analysis: KlausurAnalyse;
}

const defaultMargin = 1440; // 1 inch in twips (~2.54cm)

export async function generateFeedbackDoc(input: GenerateFeedbackDocInput): Promise<Buffer> {
  const { klausurName, analysis } = input;

  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      text: 'Klausurbewertung',
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
    }),
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Klausur: ', bold: true }),
        new TextRun(klausurName),
      ],
      spacing: { after: 120 },
    }),
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Gesamtpunkte: ', bold: true }),
        new TextRun(`${analysis.erreichtePunkte} / ${analysis.gesamtpunkte}`),
      ],
      spacing: { after: 80 },
    }),
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Prozent: ', bold: true }),
        new TextRun(`${analysis.prozent.toFixed(1)}%`),
      ],
      spacing: { after: 80 },
    }),
  );

  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Zusammenfassung', bold: true, break: 1 }),
      ],
      spacing: { before: 200, after: 120 },
    }),
  );

  paragraphs.push(
    new Paragraph({
      text: analysis.zusammenfassung,
      spacing: { after: 200 },
    }),
  );

  paragraphs.push(
    new Paragraph({
      text: 'Aufgaben-Details',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 200 },
    }),
  );

  analysis.aufgaben.forEach((aufgabe, index) => {
    paragraphs.push(
      new Paragraph({
        text: `${index + 1}. ${aufgabe.aufgabe} (${aufgabe.erreichtePunkte}/${aufgabe.maxPunkte} Punkte)`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 80 },
      }),
    );

    paragraphs.push(
      new Paragraph({
        text: aufgabe.kommentar,
        spacing: { after: 80 },
      }),
    );

    if (aufgabe.korrekturen && aufgabe.korrekturen.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'Korrekturen:', bold: true })],
          spacing: { after: 80 },
        }),
      );

      aufgabe.korrekturen.forEach((korrektur) => {
        paragraphs.push(
          new Paragraph({
            text: korrektur,
            bullet: { level: 0 },
          }),
        );
      });

      paragraphs.push(new Paragraph({ text: '', spacing: { after: 80 } }));
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: defaultMargin,
              bottom: defaultMargin,
              left: defaultMargin,
              right: defaultMargin,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
