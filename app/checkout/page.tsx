'use client'

import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { buyCredits } from '@/lib/buy-credits'

interface PricingPlan {
  id: string
  name: string
  price: string
  formattedPrice?: string
  interval: string
  description: string
  priceId: string
  mode: 'subscription' | 'payment'
  features: string[]
  popular: boolean
}

const PRICING_PLANS: Omit<PricingPlan, 'price' | 'formattedPrice'>[] = [
  {
    id: 'package-25',
    name: 'Beta-Angebot: Klassensatz-Paket (25 Klassenarbeiten)',
    interval: 'einmalig',
    description: '25 Klausuren KI‑gestützt korrigieren – genug für eine volle Klasse.',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25 || 'price_package_25',
    mode: 'payment' as const,
    features: [
      'KI analysiert & bewertet nach deinem Erwartungshorizont',
      'Handschrift-Erkennung – liest auch schwer lesbare Schülertexte',
      'Fertiges Word-Dokument (.docx) – direkt ausdrucken oder digital versenden',
      'Gültig bis aufgebraucht – kein Zeitdruck',
    ],
    popular: true,
  },
]

export default function CheckoutPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [pricesLoading, setPricesLoading] = useState(true)

  // Preise aus Stripe laden
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('/api/stripe/prices')
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Error response:', errorData)
          throw new Error('Preise konnten nicht geladen werden')
        }

        const prices = await response.json()
        console.log('Prices received:', prices)

        // Preise zu den Plänen hinzufügen
        const plansWithPrices: PricingPlan[] = PRICING_PLANS.map((plan) => {
          let price = '0'
          let formattedPrice = '0,00 €'

          if (plan.id === 'package-25' && prices.package25) {
            price = (prices.package25.amount / 100).toString()
            formattedPrice = prices.package25.formatted
            console.log('Package25 price set:', { price, formattedPrice })
          } else {
            console.warn(`Price not found for plan: ${plan.id}`, prices)
          }

          return {
            ...plan,
            price,
            formattedPrice,
          }
        })

        console.log('Plans with prices:', plansWithPrices)
        setPlans(plansWithPrices)
      } catch (error) {
        console.error('Error fetching prices:', error)
        // Fallback: Verwende Standard-Preise
        const fallbackPlans: PricingPlan[] = PRICING_PLANS.map((plan) => ({
          ...plan,
          price: '199',
          formattedPrice: '199,00 €',
        }))
        setPlans(fallbackPlans)
      } finally {
        setPricesLoading(false)
      }
    }

    fetchPrices()
  }, [])

  const handleBuyCredits = async () => {
    setLoading('package-25')

    try {
      await buyCredits()
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error instanceof Error ? error.message : 'Fehler beim Erstellen der Checkout-Session')
      setLoading(null)
    }
  }

  const handleCheckout = async (priceId: string, mode: 'subscription' | 'payment', planId?: string) => {
    // Für das 25er-Paket verwende die neue buyCredits Funktion
    if (planId === 'package-25') {
      await handleBuyCredits()
      return
    }

    // Für andere Pakete: Alte Route (falls noch benötigt)
    setLoading(priceId || 'unknown')

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, mode }),
      })

      if (!response.ok) {
        throw new Error('Checkout konnte nicht erstellt werden')
      }

      const { url } = await response.json()

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Fehler beim Erstellen der Checkout-Session')
    } finally {
      setLoading(null)
    }
  }

  return (
    <ProtectedRoute>
      <section className="dashboard-section">
        <div className="container">
          <div className="page-intro">
            <h1 className="page-intro-title">KorrekturPilot aktivieren</h1>
            <p className="page-intro-text">
              Sichere dir dein kostenloses Klausur‑Kontingent in der Beta‑Phase.
            </p>
          </div>

          {pricesLoading ? (
            <div className="text-center" style={{ padding: 'var(--spacing-2xl) 0' }}>
              <div className="processing-spinner" style={{ margin: '0 auto var(--spacing-md)' }} aria-hidden />
              <p style={{ color: 'var(--color-gray-600)' }}>Preise werden geladen...</p>
            </div>
          ) : (
            <div className="pricing-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
              {plans.map((plan) => (
              <div
                key={plan.id}
                className={`pricing-card ${plan.popular ? 'pricing-card-highlighted' : ''}`}
              >
                {plan.popular && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)' }}>
                    <span className="pricing-badge">
                      Empfohlen
                    </span>
                  </div>
                )}
                <div className="pricing-card-header">
                  <h3>{plan.name}</h3>
                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <p className="pricing-card-price" style={{ fontSize: '48px', fontWeight: '800', color: 'var(--color-primary)', lineHeight: '1', margin: 0, textAlign: 'center' }}>7,90 €</p>
                    <p style={{ textAlign: 'center', color: 'var(--color-gray-600)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>einmalig</p>
                  </div>
                </div>
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <p className="pricing-card-description" style={{ marginBottom: 0 }}>
                    KorrekturPilot analysiert deine Klausuren nach deinem Erwartungshorizont und erstellt ein fertiges Feedback‑Dokument für jede Schülerin und jeden Schüler.
                  </p>
                </div>
                <ul className="pricing-card-features" style={{ marginBottom: 'var(--spacing-xl)', listStyle: 'none', paddingLeft: 0 }}>
                  {plan.features.map((feature, index) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 'var(--spacing-sm)' }}>
                      <svg
                        style={{ width: '20px', height: '20px', color: 'var(--color-success)', marginRight: 'var(--spacing-sm)', marginTop: '2px', flexShrink: 0 }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span style={{ fontSize: '0.875rem', color: 'var(--color-gray-700)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    if (plan.id === 'package-25') {
                      handleBuyCredits()
                    } else {
                      handleCheckout(plan.priceId, plan.mode, plan.id)
                    }
                  }}
                  disabled={loading === plan.id || loading === plan.priceId}
                  className={`pricing-button ${plan.popular ? 'primary-button' : 'secondary-button'}`}
                  style={{ width: '100%' }}
                >
                  {loading === plan.id || loading === plan.priceId
                    ? 'Wird geladen...'
                    : 'Klassensatz‑Paket für 7,90 € kaufen'}
                </button>
                <p className="text-xs text-gray-500" style={{ marginTop: 'var(--spacing-md)', textAlign: 'center' }}>
                  Kein Abo, keine versteckten Kosten – du zahlst nur, wenn du später weitere Klassensätze brauchst.
                </p>
              </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  )
}
