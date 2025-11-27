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
    return NextResponse.json({ error: 'Keine Signatur' }, { status: 400 })
  }

  // Prüfe ob Webhook Secret konfiguriert ist
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET ist nicht konfiguriert' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const credits = parseInt(session.metadata?.credits || '25')

    if (!userId) {
      console.warn('Webhook: Keine userId in session.metadata')
      return NextResponse.json({ received: true })
    }

    try {
      const { error } = await supabase.rpc('add_credits', {
        user_id: userId,
        amount: credits,
      })

      if (error) {
        console.error('Error adding credits:', error)
        return NextResponse.json(
          { error: 'Fehler beim Hinzufügen der Credits' },
          { status: 500 }
        )
      }

      console.log(`Added ${credits} credits to user ${userId} after payment`)
    } catch (error) {
      console.error('Unexpected error in webhook:', error)
      return NextResponse.json(
        { error: 'Unerwarteter Fehler beim Verarbeiten des Webhooks' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}

