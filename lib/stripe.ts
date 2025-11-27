import Stripe from 'stripe'

// Server-seitiger Stripe Client
export function getStripeServerClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY ist nicht konfiguriert')
  }

  return new Stripe(secretKey, {
    typescript: true,
  })
}

// Preis-IDs (können später in Supabase gespeichert werden)
export const STRIPE_PRICES = {
  // Preis-IDs aus Stripe Dashboard
  PACKAGE_25: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25 || 'price_package_25',
  ONE_TIME: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME || 'price_one_time',
} as const

