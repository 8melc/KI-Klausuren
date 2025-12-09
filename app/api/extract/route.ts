import { NextRequest, NextResponse } from 'next/server';
import { extractPdfText } from '@/lib/pdf';
import { createClientFromRequest } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';

// WICHTIG: Node.js Runtime für größere Dateien
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Auth-Check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Lese JSON-Body mit fileKey
    const body = await request.json();
    const { fileKey } = body;

    if (!fileKey) {
      return NextResponse.json(
        { error: 'fileKey ist erforderlich' },
        { status: 400 }
      );
    }

    // Prüfe, ob fileKey mit user.id/ beginnt (Sicherheit)
    if (!fileKey.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: 'Zugriff verweigert — diese Datei gehört einem anderen Benutzer' },
        { status: 403 }
      );
    }

    // Lade Datei aus Supabase Storage
    const supabase = createClientFromRequest(request);
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('klausuren')
      .download(fileKey);

    if (downloadError || !fileData) {
      console.error('Fehler beim Laden der Datei aus Supabase Storage:', downloadError);
      
      // Spezielle Behandlung für 403-Fehler (RLS etc.)
      const errorStatus = (downloadError as any)?.status;
      const errorMessage = (downloadError as any)?.message ?? '';

      if (errorStatus === 403 || errorMessage.includes('row-level security')) {
        return NextResponse.json(
          { error: 'Zugriff verweigert — diese Datei gehört einem anderen Benutzer' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: `Fehler beim Laden der Datei: ${downloadError?.message || 'Unbekannter Fehler'}` },
        { status: 500 }
      );
    }

    // Konvertiere Blob zu Buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const text = await extractPdfText(buffer);

    // Extrahiere Dateinamen aus fileKey (letzter Teil nach dem letzten /)
    const fileName = fileKey.split('/').pop() || fileKey;

    return NextResponse.json({ 
      text,
      filename: fileName,
      size: buffer.length 
    });
  } catch (error) {
    console.error('Extract error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract PDF' },
      { status: 500 }
    );
  }
}
