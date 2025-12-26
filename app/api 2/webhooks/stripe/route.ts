import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Prüfe ob alle Umgebungsvariablen konfiguriert sind
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY ist nicht konfiguriert')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL ist nicht konfiguriert')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY ist nicht konfiguriert')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    // Webhook muss immer 200 zurückgeben, auch bei Fehlern
    return NextResponse.json({ received: false, error: 'Keine Signatur' }, { status: 200 })
  }

  // Prüfe ob Webhook Secret konfiguriert ist
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    if (process.env.NODE_ENV === 'development') {
      console.error('STRIPE_WEBHOOK_SECRET ist nicht konfiguriert')
    }
    return NextResponse.json({ received: false, error: 'Webhook Secret fehlt' }, { status: 200 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    // Webhook muss immer 200 zurückgeben, auch bei ungültiger Signatur
    if (process.env.NODE_ENV === 'development') {
      console.error('Invalid webhook signature:', err.message)
    }
    return NextResponse.json({ received: false, error: 'Invalid signature' }, { status: 200 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId

    if (!userId) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Webhook: Keine userId in session.metadata')
      }
      // Webhook muss immer 200 zurückgeben
      return NextResponse.json({ received: true })
    }

    try {
      const { error } = await supabase.rpc('add_credits', {
        user_id: userId,
        amount: 25,
      })

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error adding credits:', error)
        }
        // Webhook muss immer 200 zurückgeben, auch bei Fehlern
        return NextResponse.json({ received: true, error: 'Fehler beim Hinzufügen der Credits' }, { status: 200 })
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`Added 25 credits to user ${userId} after payment`)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Unexpected error in webhook:', error)
      }
      // Webhook muss immer 200 zurückgeben
      return NextResponse.json({ received: true, error: 'Unerwarteter Fehler' }, { status: 200 })
    }
  }

  return NextResponse.json({ received: true })
}

