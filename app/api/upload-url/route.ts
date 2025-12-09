import { NextRequest, NextResponse } from 'next/server'

import { createClientFromRequest } from '@/lib/supabase/server'

import { getCurrentUser } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
    }

    const body = await request.json()
    const { fileName, fileType } = body

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName und fileType sind erforderlich' },
        { status: 400 }
      )
    }

    // Validiere Dateityp und Größe
    if (fileType !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Nur PDF-Dateien sind erlaubt' },
        { status: 400 }
      )
    }

    // Dateigröße wird vom Client übermittelt, hier prüfen wir nur den Typ
    // Die tatsächliche Größe wird beim Upload validiert (50MB Limit im Bucket)

    // Erstelle eindeutigen Pfad: auth_uid/uuid_original_filename
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')

    // Node 18+ hat crypto.randomUUID im global scope
    const uniqueId = crypto.randomUUID()
    const fileKey = `${user.id}/${uniqueId}_${sanitizedFileName}`

    const supabase = createClientFromRequest(request)

    // Erstelle signierte Upload-URL mit owner_id in Metadaten
    const { data, error } = await supabase.storage
      .from('klausuren')
      .createSignedUploadUrl(fileKey, {
        upsert: false,
        // Metadata wird beim tatsächlichen Upload gesetzt, nicht hier
        // Der Client muss owner_id beim Upload in Metadaten setzen
      })

    if (error) {
      console.error('Fehler beim Erstellen der Upload-URL:', error)

      const { data: publicUrlData } = supabase.storage
        .from('klausuren')
        .getPublicUrl(fileKey)

      return NextResponse.json({
        uploadUrl: publicUrlData.publicUrl,
        fileKey,
        method: 'PUT',
        warning:
          'createSignedUploadUrl nicht verfügbar, verwende Public URL. Stelle sicher, dass RLS-Policies korrekt gesetzt sind.',
      })
    }

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      fileKey,
      token: data.token,
    })
  } catch (error) {
    console.error('Upload-URL API error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Fehler beim Erstellen der Upload-URL',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.stack
              : String(error)
            : undefined,
      },
      { status: 500 }
    )
  }
}
