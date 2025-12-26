import { createClient } from '@/lib/supabase/server'
import { AUTH_ENABLED } from './auth'

export interface SubscriptionStatus {
  hasActiveSubscription: boolean
  subscriptionType: 'monthly' | 'yearly' | 'one-time' | null
  expiresAt: Date | null
  lastPayment?: {
    date: Date
    amount: number
    currency: string
    klausuren: number
  } | null
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
      lastPayment: null,
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
      lastPayment: null,
    }
  }

  // Berechne Anzahl der Klausuren basierend auf dem Betrag
  // 7.90€ = 25 Klausuren, 0.32€ pro Klausur
  const calculateKlausuren = (amountInCents: number): number => {
    const amountInEur = amountInCents / 100
    // 7.90€ = 25 Klausuren
    if (amountInEur >= 7.90) {
      return 25
    }
    // Fallback: basierend auf 0.32€ pro Klausur
    return Math.round(amountInEur / 0.32)
  }

  // Hole letzte Zahlung (unabhängig vom Status)
  const { data: lastPayment } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const lastPaymentInfo = lastPayment ? {
    date: new Date(lastPayment.created_at),
    amount: lastPayment.amount / 100, // Umrechnung von Cents zu Euro
    currency: lastPayment.currency || 'eur',
    klausuren: calculateKlausuren(lastPayment.amount),
  } : null

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
      lastPayment: lastPaymentInfo,
    }
  }

  // Prüfe ob User eine einmalige Zahlung gemacht hat (z.B. in den letzten 30 Tagen)
  const { data: recentPayment } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .maybeSingle()

  if (recentPayment) {
    return {
      hasActiveSubscription: true,
      subscriptionType: 'one-time',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Tage gültig
      lastPayment: lastPaymentInfo,
    }
  }

  return {
    hasActiveSubscription: false,
    subscriptionType: null,
    expiresAt: null,
    lastPayment: lastPaymentInfo,
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



