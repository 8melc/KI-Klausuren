import { NextRequest, NextResponse } from 'next/server'
import { getStripeServerClient } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const stripe = getStripeServerClient()
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Keine Signatur' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET ist nicht konfiguriert')
    }

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Webhook-Signatur ungültig' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  // Handle verschiedene Stripe Events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId

      if (userId && session.mode === 'subscription') {
        // Subscription in Supabase speichern
        const subscriptionId = session.subscription as string
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            updated_at: new Date().toISOString(),
          })
      } else if (userId && session.mode === 'payment') {
        // Einmalige Zahlung in Supabase speichern
        await supabase
          .from('payments')
          .insert({
            user_id: userId,
            stripe_payment_intent_id: session.payment_intent as string,
            amount: session.amount_total,
            currency: session.currency,
            status: 'completed',
          })
      }
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      // Subscription-Status in Supabase aktualisieren
      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

