import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function createPDF(content: {
  text: string;
  corrections?: Array<{ page: number; x: number; y: number; note: string }>;
}): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    let page = pdfDoc.addPage([595, 842]);
    const { height } = page.getSize();

    const lines = content.text.split('\n');
    let yPosition = height - 50;

    for (const line of lines) {
      if (yPosition < 50) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = height - 50;
      }

      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font,
      });

      yPosition -= fontSize + 5;
    }

    if (content.corrections) {
      for (const correction of content.corrections) {
        const targetPage = pdfDoc.getPage(Math.max(0, correction.page - 1));
        targetPage.drawText(correction.note, {
          x: correction.x,
          y: correction.y,
          size: 10,
          font,
          color: rgb(1, 0, 0),
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('PDF creation error:', error);
    throw new Error('Fehler beim Erstellen des PDFs');
  }
}
