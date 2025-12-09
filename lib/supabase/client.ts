import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Singleton-Instanz für den Browser-Client
let supabaseClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  // Wenn bereits eine Instanz existiert, verwende diese
  if (supabaseClient) {
    return supabaseClient;
  }

  // Erstelle neue Instanz nur einmal mit @supabase/ssr für besseres Session-Handling
  // WICHTIG: createBrowserClient von @supabase/ssr speichert PKCE code_verifier automatisch in Cookies
  // Das ermöglicht serverseitigen Code-Exchange in route.ts
  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        // PKCE wird automatisch von @supabase/ssr gehandhabt
        // code_verifier wird in Cookie gespeichert: [storage-key]-code-verifier
        flowType: 'pkce',
      },
    }
  );

  // Session listener für automatisches Refresh und Logout-Handling
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED') {
      console.log('Session refreshed successfully');
    }
    if (event === 'SIGNED_OUT') {
      // Redirect to login page on sign out
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  });

  return supabaseClient;
}



