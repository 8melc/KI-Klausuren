import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Feature Flag: Setze auf false, um Auth-Schutz während der Entwicklung zu deaktivieren
export const AUTH_ENABLED = true // Production-ready: Auth ist aktiviert

export async function getCurrentUser() {
  if (!AUTH_ENABLED) {
    return null // Während der Entwicklung: kein Auth erforderlich
  }

  const supabase = await createClient()
  // WICHTIG: getUser() validiert Token gegen Supabase Server (besser als getSession())
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

export async function requireAuth() {
  if (!AUTH_ENABLED) {
    return null // Während der Entwicklung: kein Auth erforderlich
  }

  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

/**
 * Prüft Auth für API-Routen. Gibt null zurück, wenn Auth deaktiviert ist oder User eingeloggt ist.
 * Gibt eine NextResponse mit 401 zurück, wenn Auth erforderlich ist aber User nicht eingeloggt ist.
 */
export async function checkApiAuth() {
  if (!AUTH_ENABLED) {
    return null // Während der Entwicklung: kein Auth erforderlich
  }

  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null // User ist eingeloggt
}

