import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    // Auth-Check - KRITISCH: userId aus Session, nicht aus Body!
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verwende userId aus der authentifizierten Session, nicht aus dem Body
    const userId = user.id;

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
    const supabase = await createClient()

    // Stripe Customer ID Sync: Prüfe ob User bereits eine Stripe Customer ID hat
    const { data: userData } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    let customerId = userData?.stripe_customer_id

    // Wenn keine Customer ID vorhanden, erstelle neuen Stripe Customer
    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          metadata: {
            userId: userId,
          },
        })
        customerId = customer.id

        // Speichere Customer ID in Datenbank
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('id', userId)
      } catch (error) {
        console.error('Fehler beim Erstellen des Stripe Customers:', error)
        // Weiterlaufen ohne Customer ID (Stripe erstellt automatisch einen)
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId, // Verknüpfe Session mit bestehendem Customer (für Historie)
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

