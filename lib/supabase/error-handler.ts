import { createClient } from '@/lib/supabase/server'
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'

/**
 * Prüft ob ein Supabase-Error ein JWT-Expiry-Error ist
 */
export function isJWTExpiredError(error: PostgrestError | null): boolean {
  if (!error) return false
  return (
    error.code === 'PGRST301' ||
    error.message?.includes('JWT') ||
    error.message?.includes('expired') ||
    error.message?.includes('token')
  )
}

/**
 * Versucht Session zu refreshen und gibt true zurück wenn erfolgreich.
 * Optional kann ein Supabase-Client übergeben werden (z.B. aus einer API-Route).
 */
export async function tryRefreshSession(
  supabaseFromContext?: SupabaseClient
): Promise<boolean> {
  try {
    const supabase = supabaseFromContext ?? (await createClient())
    const { error: refreshError } = await supabase.auth.refreshSession()
    return !refreshError
  } catch {
    return false
  }
}

/**
 * Führt eine Supabase-Query mit automatischem Retry bei JWT-Expiry aus.
 *
 * @param queryFn - Funktion, die die Supabase-Query ausführt und { data, error } zurückgibt
 * @param supabaseFromContext - optionaler Supabase-Client (z.B. aus API-Route)
 */
export async function executeWithRetry<T>(
  queryFn: (supabase?: SupabaseClient) => Promise<{ data: T | null; error: PostgrestError | null }>,
  supabaseFromContext?: SupabaseClient
): Promise<{ data: T | null; error: PostgrestError | null }> {
  // Erster Versuch
  const result = await queryFn(supabaseFromContext)

  if (!result.error) {
    return result
  }

  // Wenn JWT-Expiry-Error, versuche Session zu refreshen
  if (isJWTExpiredError(result.error)) {
    const refreshed = await tryRefreshSession(supabaseFromContext)

    if (refreshed) {
      // Retry nach erfolgreichem Refresh
      return await queryFn(supabaseFromContext)
    }

    // Refresh fehlgeschlagen - Session ist abgelaufen
    return {
      data: null,
      error: {
        ...result.error,
        message: 'Session expired. Please log in again.',
        code: 'SESSION_EXPIRED',
      } as PostgrestError,
    }
  }

  // Anderer Error - direkt zurückgeben
  return result
}
