/**
 * Frontend-Funktion zum Kaufen von Credits
 * 
 * Startet den Stripe Checkout für das 25er-Paket (€7.90)
 */

import { createClient } from '@/lib/supabase/client'

export async function buyCredits(): Promise<void> {
  const supabase = createClient()
  
  // Hole aktuellen User
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Bitte melde dich an, um Credits zu kaufen')
  }

  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || 'Checkout konnte nicht erstellt werden')
    }

    const { url } = await res.json()

    if (!url) {
      throw new Error('Keine Checkout-URL erhalten')
    }

    // Weiterleitung zu Stripe Checkout
    window.location.href = url
  } catch (error) {
    console.error('Buy credits error:', error)
    throw error
  }
}


