import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton-Instanz für den Browser-Client
let supabaseClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  // Wenn bereits eine Instanz existiert, verwende diese
  if (supabaseClient) {
    return supabaseClient;
  }

  // Erstelle neue Instanz nur einmal
  supabaseClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );

  return supabaseClient;
}



