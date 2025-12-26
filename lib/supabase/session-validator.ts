import { createClient } from './client';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Validiert und refresht die Session, falls nötig
 * @returns {Promise<{session: Session | null, error: Error | null}>}
 */
export async function ensureValidSession(): Promise<{
  session: any;
  error: Error | null;
}> {
  const supabase = createClient();
  
  try {
    // 1. Hole aktuelle Session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return { session: null, error: new Error('Fehler beim Abrufen der Session') };
    }
    
    // 2. Wenn keine Session vorhanden, versuche zu refreshen
    if (!session) {
      console.log('Keine Session gefunden, versuche zu refreshen...');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !refreshData.session) {
        console.error('Session refresh fehlgeschlagen:', refreshError);
        return { 
          session: null, 
          error: new Error('Deine Sitzung ist abgelaufen. Bitte melde dich neu an.') 
        };
      }
      
      return { session: refreshData.session, error: null };
    }
    
    // 3. Prüfe ob Session abgelaufen ist (mit 5 Minuten Puffer)
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const expiresAtMs = expiresAt * 1000;
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      // Wenn Session in weniger als 5 Minuten abläuft, refreshe sie
      if (expiresAtMs - now < fiveMinutes) {
        console.log('Session läuft bald ab, refreshe...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error('Session refresh fehlgeschlagen:', refreshError);
          // Session ist noch gültig, also verwende sie weiter
          return { session, error: null };
        }
        
        return { session: refreshData.session, error: null };
      }
    }
    
    // 4. Session ist gültig
    return { session, error: null };
  } catch (error) {
    console.error('Unexpected error in ensureValidSession:', error);
    return { 
      session: null, 
      error: error instanceof Error ? error : new Error('Unerwarteter Fehler bei Session-Validierung') 
    };
  }
}
