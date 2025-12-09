import { createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { executeWithRetry, isJWTExpiredError } from '@/lib/supabase/error-handler';

/**
 * Server-side: Prüft ob User Credits hat
 */
export async function getUserCredits(userId: string): Promise<number> {
  const supabase = await createClient();
  
  const { data, error } = await executeWithRetry(async () => {
    const result = await supabase
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();
    return { data: result.data, error: result.error };
  });
  
  if (error || !data) {
    if (isJWTExpiredError(error)) {
      console.warn('Session expired while fetching credits');
    }
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
  const { error } = await executeWithRetry(async () => {
    const result = await supabase
      .from('users')
      .update({ 
        credits: credits - 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    return { data: result.data, error: result.error };
  });
  
  if (isJWTExpiredError(error)) {
    console.warn('Session expired while consuming credit');
  }
  
  return !error;
}

/**
 * Server-side: Fügt Credits hinzu (für Stripe-Webhook)
 */
export async function addCredits(userId: string, amount: number): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await executeWithRetry(async () => {
    const result = await supabase.rpc('add_credits', {
      user_id: userId,
      amount: amount
    });
    return { data: result.data, error: result.error };
  });
  
  if (isJWTExpiredError(error)) {
    console.warn('Session expired while adding credits');
  }
  
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
  
  if (error) {
    // Handle JWT expired error
    if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        // Redirect to login if refresh fails
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        return 0;
      }
      // Retry the query after refresh
      const { data: retryData, error: retryError } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();
      if (retryError || !retryData) {
        return 0;
      }
      return retryData.credits || 0;
    }
    return 0;
  }
  
  if (!data) {
    return 0;
  }
  
  return data.credits || 0;
}





