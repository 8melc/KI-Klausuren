import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'userId ist erforderlich' },
        { status: 400 }
      )
    }

    // Prüfe ob Stripe Secret Key konfiguriert ist
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'STRIPE_SECRET_KEY ist nicht konfiguriert' },
        { status: 500 }
      )
    }

    // Prüfe ob Price ID konfiguriert ist
    if (!process.env.STRIPE_PRICE_ID_25) {
      return NextResponse.json(
        { error: 'STRIPE_PRICE_ID_25 ist nicht konfiguriert' },
        { status: 500 }
      )
    }

    // Prüfe ob NEXT_PUBLIC_URL konfiguriert ist
    if (!process.env.NEXT_PUBLIC_URL) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_URL ist nicht konfiguriert' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_25, // PriceID des 25er Pakets
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancel`,
      metadata: {
        userId,
        type: 'CREDITS_25',
      },
    })

    return NextResponse.json({ url: session.url })
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

