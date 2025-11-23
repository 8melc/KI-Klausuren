import { NextRequest, NextResponse } from 'next/server'
import { getStripeServerClient } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { checkApiAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Auth-Check (während Entwicklung deaktiviert)
  const authError = await checkApiAuth()
  if (authError) {
    return authError
  }

  try {
    const body = await request.json()
    const { priceId, mode = 'subscription' } = body // mode: 'subscription' | 'payment'

    if (!priceId) {
      return NextResponse.json(
        { error: 'priceId ist erforderlich' },
        { status: 400 }
      )
    }

    // User aus Supabase holen
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stripe = getStripeServerClient()
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    // Stripe Checkout Session erstellen
    const session = await stripe.checkout.sessions.create({
      mode: mode as 'subscription' | 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: user.email || undefined,
      metadata: {
        userId: user.id,
      },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Checkout-Session konnte nicht erstellt werden',
      },
      { status: 500 }
    )
  }
}
