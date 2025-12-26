import { NextResponse } from 'next/server'
import { getStripeServerClient } from '@/lib/stripe'

export async function GET() {
  try {
    const stripe = getStripeServerClient()

    const priceIdPackage25 = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25
    const priceIdOneTime = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME

    console.log('Loading prices:', { priceIdPackage25, priceIdOneTime })

    type PriceDetail = {
      id: string
      amount: number | null
      currency: string | null
      formatted: string
    }

    interface PricesResponse {
      package25?: PriceDetail
      oneTime?: PriceDetail
    }

    const prices: PricesResponse = {}

    // Preis für Package 25 laden
    if (priceIdPackage25) {
      try {
        const pricePackage25 = await stripe.prices.retrieve(priceIdPackage25)
        console.log('Package25 price loaded:', {
          id: pricePackage25.id,
          amount: pricePackage25.unit_amount,
          currency: pricePackage25.currency,
        })
        prices.package25 = {
          id: pricePackage25.id,
          amount: pricePackage25.unit_amount,
          currency: pricePackage25.currency ?? null,
          formatted: new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: (pricePackage25.currency ?? 'EUR').toUpperCase(),
          }).format((pricePackage25.unit_amount || 0) / 100),
        }
      } catch (error) {
        console.error('Error fetching package25 price:', error)
        if (error instanceof Error) {
          console.error('Error details:', error.message)
        }
      }
    } else {
      console.warn('NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25 ist nicht gesetzt')
    }

    // Preis für One-Time laden
    if (priceIdOneTime) {
      try {
        const priceOneTime = await stripe.prices.retrieve(priceIdOneTime)
        console.log('OneTime price loaded:', {
          id: priceOneTime.id,
          amount: priceOneTime.unit_amount,
          currency: priceOneTime.currency,
        })
        prices.oneTime = {
          id: priceOneTime.id,
          amount: priceOneTime.unit_amount,
          currency: priceOneTime.currency ?? null,
          formatted: new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: (priceOneTime.currency ?? 'EUR').toUpperCase(),
          }).format((priceOneTime.unit_amount || 0) / 100),
        }
      } catch (error) {
        console.error('Error fetching oneTime price:', error)
        if (error instanceof Error) {
          console.error('Error details:', error.message)
        }
      }
    } else {
      console.warn('NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME ist nicht gesetzt')
    }

    console.log('Returning prices:', prices)
    return NextResponse.json(prices)
  } catch (error) {
    console.error('Stripe prices error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Preise konnten nicht geladen werden',
      },
      { status: 500 }
    )
  }
}
