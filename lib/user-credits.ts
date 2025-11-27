import { createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

/**
 * Server-side: Prüft ob User Credits hat
 */
export async function getUserCredits(userId: string): Promise<number> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();
  
  if (error || !data) {
    return 0;
  }
  
  return data.credits || 0;
}

/**
 * Server-side: Verbraucht 1 Credit
 */
export async function consumeCredit(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  // Prüfe ob User genug Credits hat
  const credits = await getUserCredits(userId);
  if (credits < 1) {
    return false;
  }
  
  // Verbrauche 1 Credit
  const { error } = await supabase
    .from('users')
    .update({ 
      credits: credits - 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);
  
  return !error;
}

/**
 * Server-side: Fügt Credits hinzu (für Stripe-Webhook)
 */
export async function addCredits(userId: string, amount: number): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase.rpc('add_credits', {
    user_id: userId,
    amount: amount
  });
  
  return !error;
}

/**
 * Client-side: Holt aktuelle Credits
 */
export async function getUserCreditsClient(): Promise<number> {
  const supabase = createBrowserClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return 0;
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single();
  
  if (error || !data) {
    return 0;
  }
  
  return data.credits || 0;
}

