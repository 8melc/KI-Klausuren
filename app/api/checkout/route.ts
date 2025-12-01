import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    // Hole eingeloggten User aus Supabase Auth
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Auth error:', authError)
      }
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Prüfe ob Stripe Secret Key konfiguriert ist
    if (!process.env.STRIPE_SECRET_KEY) {
      if (process.env.NODE_ENV === 'development') {
        console.error('STRIPE_SECRET_KEY ist nicht konfiguriert')
      }
      return NextResponse.json(
        { error: 'Server-Konfigurationsfehler' },
        { status: 500 }
      )
    }

    // Prüfe ob Price ID konfiguriert ist
    const priceId = process.env.STRIPE_PRICE_ID_25
    if (!priceId) {
      if (process.env.NODE_ENV === 'development') {
        console.error('STRIPE_PRICE_ID_25 ist nicht konfiguriert')
      }
      return NextResponse.json(
        { error: 'Server-Konfigurationsfehler' },
        { status: 500 }
      )
    }

    // Prüfe ob NEXT_PUBLIC_URL konfiguriert ist
    const baseUrl = process.env.NEXT_PUBLIC_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      metadata: {
        userId: user.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Stripe checkout error:', error)
    }
    return NextResponse.json(
      {
        error: 'Checkout-Session konnte nicht erstellt werden',
      },
      { status: 500 }
    )
  }
}

