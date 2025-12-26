import { Document, HeadingLevel, Paragraph, TextRun, Packer, Table, TableRow, TableCell, WidthType, AlignmentType, SectionType } from 'docx';
import { KlausurAnalyse } from './openai';
import { getGradeInfo, getPerformanceLevel } from './grades';
import { buildFeedbackModel, type FeedbackModel } from './build-feedback-model';

import type { CourseInfo } from '@/types/results';

interface GenerateFeedbackDocInput {
  klausurName: string;
  analysis: KlausurAnalyse;
  courseInfo?: CourseInfo;
}

// Seitenränder: 2,5 cm oben/unten, 2 cm links/rechts
// 1 cm = 567 twips, 2,5 cm = 1417.5 twips, 2 cm = 1134 twips
const topBottomMargin = 1418; // 2,5 cm
const leftRightMargin = 1134; // 2 cm

// Schriftgrößen
const fontSizeTitle = 20; // pt
const fontSizeHeading = 12; // pt (Detailanalyse Überschrift)
const fontSizeBody = 11; // pt

// Zeilenabstand: 1,15
const lineSpacing = 276; // 1,15 = 276 twips (240 * 1.15)

export async function generateFeedbackDoc(input: GenerateFeedbackDocInput): Promise<Buffer> {
  const { klausurName, analysis, courseInfo } = input;
  
  // ========== ZENTRALE PIPELINE ==========
  // Verwende buildFeedbackModel für konsistente Datenstruktur
  const feedbackModel = await buildFeedbackModel(analysis, courseInfo, klausurName);

  // ========== SEITE 1 ==========
  const page1Children: (Paragraph | Table)[] = [];

  // Titel (20 pt, zentriert)
  page1Children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Klausurbewertung',
          size: fontSizeTitle * 2, // docx verwendet halbe Punkte
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  );

  // Metadaten (11 pt, Calibri)
  page1Children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Dateiname: ', bold: true, size: fontSizeBody * 2 }),
        new TextRun({ text: klausurName, size: fontSizeBody * 2 }),
      ],
      spacing: { after: 80 },
    }),
  );

  if (courseInfo?.subject) {
    page1Children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Fach: ', bold: true, size: fontSizeBody * 2 }),
          new TextRun({ text: courseInfo.subject, size: fontSizeBody * 2 }),
        ],
        spacing: { after: 80 },
      }),
    );
  }

  if (courseInfo?.gradeLevel) {
    page1Children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Jahrgang: ', bold: true, size: fontSizeBody * 2 }),
          new TextRun({ text: courseInfo.gradeLevel, size: fontSizeBody * 2 }),
        ],
        spacing: { after: 80 },
      }),
    );
  }

  if (courseInfo?.className) {
    page1Children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Klasse / Kurs: ', bold: true, size: fontSizeBody * 2 }),
          new TextRun({ text: courseInfo.className, size: fontSizeBody * 2 }),
        ],
        spacing: { after: 80 },
      }),
    );
  }

  page1Children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Datum: ', bold: true, size: fontSizeBody * 2 }),
        new TextRun({ text: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }), size: fontSizeBody * 2 }),
      ],
      spacing: { after: 80 },
    }),
  );


  // Punkte-Tabelle (Note/Punkte) - Header NICHT fett, aber zentriert
  const summaryTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: 'Erreichte Punkte', size: fontSizeBody * 2 })],
              alignment: AlignmentType.CENTER 
            })],
            width: { size: 33.33, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: 'Maximalpunkte', size: fontSizeBody * 2 })],
              alignment: AlignmentType.CENTER 
            })],
            width: { size: 33.33, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: 'Note', size: fontSizeBody * 2 })],
              alignment: AlignmentType.CENTER 
            })],
            width: { size: 33.33, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      new TableRow({
        children: [
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: feedbackModel.erreichtePunkte.toString(), size: fontSizeBody * 2 })],
                  alignment: AlignmentType.CENTER 
                })],
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: feedbackModel.gesamtpunkte.toString(), size: fontSizeBody * 2 })],
                  alignment: AlignmentType.CENTER 
                })],
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: feedbackModel.grade, size: fontSizeBody * 2 })],
                  alignment: AlignmentType.CENTER 
                })],
              }),
        ],
      }),
    ],
  });

  page1Children.push(summaryTable);
  page1Children.push(new Paragraph({ text: '', spacing: { after: 300 } }));

  // NEU: Punkte-Tabelle mit allen Aufgaben (Schüler-Version)
  const tasksPointsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: 'Aufgabe', size: fontSizeBody * 2 })],
              alignment: AlignmentType.CENTER 
            })],
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: 'Punkte', size: fontSizeBody * 2 })],
              alignment: AlignmentType.CENTER 
            })],
            width: { size: 50, type: WidthType.PERCENTAGE },
          }),
        ],
      }),
      ...feedbackModel.tasks.map((task) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ text: task.taskTitle, size: fontSizeBody * 2 })],
                alignment: AlignmentType.LEFT 
              })],
            }),
            new TableCell({
              children: [new Paragraph({ 
                children: [new TextRun({ text: `${task.points} Punkte`, size: fontSizeBody * 2 })],
                alignment: AlignmentType.CENTER 
              })],
            }),
          ],
        })
      ),
    ],
  });

  page1Children.push(tasksPointsTable);
  page1Children.push(new Paragraph({ text: '', spacing: { after: 300 } }));

  // Verwende Stärken/Nächste Schritte aus dem Feedback-Modell
  const strengthsPoints = feedbackModel.summary.yourStrengths;
  const tipsPoints = feedbackModel.summary.yourNextSteps;

  const strengthsTipsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'DEINE STÄRKEN', size: fontSizeHeading * 2, bold: true })],
                alignment: AlignmentType.CENTER,
              }),
              ...strengthsPoints.map(
                (item) =>
                  new Paragraph({
                    children: [new TextRun({ text: `• ${item}`, size: fontSizeBody * 2 })],
                    spacing: { after: 80 },
                  })
              ),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: 'F5F5F5' },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: 'DEINE NÄCHSTEN SCHRITTE', size: fontSizeHeading * 2, bold: true })],
                alignment: AlignmentType.CENTER,
              }),
              ...(tipsPoints.length > 0
                ? tipsPoints.map(
                    (item) =>
                      new Paragraph({
                        children: [new TextRun({ text: `• ${item}`, size: fontSizeBody * 2 })],
                        spacing: { after: 80 },
                      })
                  )
                : [
                    new Paragraph({
                      children: [new TextRun({ text: 'Du bist auf einem guten Weg!', size: fontSizeBody * 2 })],
                    }),
                  ]),
            ],
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: 'F5F5F5' },
          }),
        ],
      }),
    ],
  });

  page1Children.push(strengthsTipsTable);

  // ========== SEITE 2+ (Detailanalyse) ==========
  const page2Children: (Paragraph | Table)[] = [];

  // Überschrift "Detailanalyse"
  page2Children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Detailanalyse',
          size: fontSizeHeading * 2,
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }),
  );

  // Aufgaben-Details (Schüler-Version: Du-Form, motivierend)
  feedbackModel.tasks.forEach((task) => {
    // Aufgaben-Überschrift (12 pt, fett) - KEINE Nummerierung, da Aufgabenformat schon Nummer hat
    page2Children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${task.taskTitle} (${task.points} Punkte)`,
            size: fontSizeHeading * 2,
            bold: true,
          }),
        ],
        spacing: { before: 200, after: 120 },
      }),
    );

    // Was du richtig gemacht hast (Du-Form, motivierend, EINGERÜCKT)
    if (task.whatYouDidWell.length > 0) {
      page2Children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Das war richtig: ', bold: true, size: fontSizeBody * 2 }),
          ],
          spacing: { after: 80 },
          indent: { left: 360 },
        }),
      );
      task.whatYouDidWell.forEach((item) => {
        page2Children.push(
          new Paragraph({
            children: [new TextRun({ text: item, size: fontSizeBody * 2 })],
            spacing: { after: 60 },
            indent: { left: 360 },
          }),
        );
      });
    }

    // Was verbessert werden kann (Du-Form, freundlich, EINGERÜCKT)
    if (task.whatNeedsImprovement.length > 0) {
      page2Children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Hier kannst du noch verbessern: ', bold: true, size: fontSizeBody * 2 }),
          ],
          spacing: { after: 80, before: 120 },
          indent: { left: 360 },
        }),
      );
      task.whatNeedsImprovement.forEach((item) => {
        page2Children.push(
          new Paragraph({
            children: [new TextRun({ text: item, size: fontSizeBody * 2 })],
            spacing: { after: 60 },
            indent: { left: 360 },
          }),
        );
      });
    }

    // Tipps für dich (Du-Form, motivierend, EINGERÜCKT)
    if (task.tipsForYou.length > 0) {
      page2Children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Tipp für dich: ', bold: true, size: fontSizeBody * 2 }),
          ],
          spacing: { after: 80, before: 120 },
          indent: { left: 360 },
        }),
      );
      task.tipsForYou.forEach((item) => {
        page2Children.push(
          new Paragraph({
            children: [new TextRun({ text: item, size: fontSizeBody * 2 })],
            spacing: { after: 60 },
            indent: { left: 360 },
          }),
        );
      });
    }

    // Korrekturen (Du-Form, freundlich)
    if (task.corrections.length > 0) {
      page2Children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Korrekturen: ', bold: true, size: fontSizeBody * 2 }),
          ],
          spacing: { after: 80, before: 120 },
        }),
      );

      task.corrections.forEach((korrektur) => {
        page2Children.push(
          new Paragraph({
            children: [new TextRun({ text: korrektur, size: fontSizeBody * 2 })],
            bullet: { level: 0 },
            spacing: { after: 60 },
          }),
        );
      });
    }

    page2Children.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  });

  const doc = new Document({
    sections: [
      {
        // Seite 1
        properties: {
          page: {
            margin: {
              top: topBottomMargin,
              bottom: topBottomMargin,
              left: leftRightMargin,
              right: leftRightMargin,
            },
          },
        },
        children: page1Children,
      },
      {
        // Seite 2+ (Detailanalyse)
        properties: {
          page: {
            margin: {
              top: topBottomMargin,
              bottom: topBottomMargin,
              left: leftRightMargin,
              right: leftRightMargin,
            },
          },
          type: SectionType.NEXT_PAGE, // Seitenumbruch
        },
        children: page2Children,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: fontSizeBody * 2,
          },
          paragraph: {
            spacing: {
              line: lineSpacing,
            },
          },
        },
      },
    },
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
