import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  if (!sig) {
    return new NextResponse('Webhook error: Keine Signatur', { status: 400 })
  }

  // Prüfe ob Stripe Secret Key konfiguriert ist
  if (!process.env.STRIPE_SECRET_KEY) {
    return new NextResponse('Webhook error: STRIPE_SECRET_KEY ist nicht konfiguriert', { status: 500 })
  }

  // Prüfe ob Webhook Secret konfiguriert ist
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse('Webhook error: STRIPE_WEBHOOK_SECRET ist nicht konfiguriert', { status: 500 })
  }

  // Prüfe ob Supabase Service Role Key konfiguriert ist
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return new NextResponse('Webhook error: SUPABASE_SERVICE_ROLE_KEY ist nicht konfiguriert', { status: 500 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return new NextResponse('Webhook error: NEXT_PUBLIC_SUPABASE_URL ist nicht konfiguriert', { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    return new NextResponse(`Webhook error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId

    if (!userId) {
      console.warn('Webhook: Keine userId in session.metadata')
      return NextResponse.json({ received: true })
    }

    // Verwende Service Role Key für Webhook (umgeht RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    if (session.metadata?.type === 'CREDITS_25') {
      // Füge 25 Credits hinzu via RPC-Funktion
      const { error } = await supabase.rpc('add_credits', {
        user_id: userId,
        amount: 25,
      })

      if (error) {
        console.error('Error adding credits:', error)
        return new NextResponse(`Webhook error: ${error.message}`, { status: 500 })
      }

      console.log(`Added 25 credits to user ${userId} after payment (CREDITS_25)`)
    }

    // Speichere Payment in payments Tabelle (optional)
    if (session.mode === 'payment' && session.payment_intent) {
      await supabase.from('payments').insert({
        user_id: userId,
        stripe_payment_intent_id: session.payment_intent as string,
        amount: session.amount_total,
        currency: session.currency || 'eur',
        status: 'completed',
      })
    }

    // Handle Subscriptions (falls später benötigt)
    if (session.mode === 'subscription' && session.subscription) {
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_subscription_id: session.subscription as string,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
    }
  }

  // Handle Subscription Updates
  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)
  }

  return NextResponse.json({ received: true })
}


