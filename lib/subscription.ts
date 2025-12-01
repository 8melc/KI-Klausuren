import { createClient } from '@/lib/supabase/server'
import { AUTH_ENABLED } from './auth'

export interface SubscriptionStatus {
  hasActiveSubscription: boolean
  subscriptionType: 'monthly' | 'yearly' | 'one-time' | null
  expiresAt: Date | null
}

/**
 * Prüft, ob der aktuelle User ein aktives Abonnement hat
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  if (!AUTH_ENABLED) {
    // Während der Entwicklung: immer Zugriff gewähren
    return {
      hasActiveSubscription: true,
      subscriptionType: null,
      expiresAt: null,
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      hasActiveSubscription: false,
      subscriptionType: null,
      expiresAt: null,
    }
  }

  // Prüfe aktive Subscriptions
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single()

  if (subscription) {
    return {
      hasActiveSubscription: true,
      subscriptionType: subscription.plan_type as 'monthly' | 'yearly',
      expiresAt: subscription.expires_at ? new Date(subscription.expires_at) : null,
    }
  }

  // Prüfe ob User eine einmalige Zahlung gemacht hat (z.B. in den letzten 30 Tagen)
  const { data: recentPayment } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .single()

  if (recentPayment) {
    return {
      hasActiveSubscription: true,
      subscriptionType: 'one-time',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Tage gültig
    }
  }

  return {
    hasActiveSubscription: false,
    subscriptionType: null,
    expiresAt: null,
  }
}

/**
 * Prüft, ob der User Zugriff auf Premium-Features hat
 */
export async function requireSubscription() {
  const status = await getSubscriptionStatus()
  if (!status.hasActiveSubscription) {
    throw new Error('Subscription erforderlich')
  }
  return status
}



