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
    name: 'KorrekturPilot (25Stk.)',
    interval: 'einmalig',
    description: 'Paket mit 25 Klausur-Korrekturen',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PACKAGE_25 || 'price_package_25',
    mode: 'payment' as const,
    features: [
      '25 Klausur-Korrekturen',
      'KI-gestützte Analyse (OpenAI GPT-4o)',
      'PDF- & Word-Export',
      'Notenspiegel für Lehrkräfte',
      'Handschrift-Erkennung (OCR)',
      'Gültig bis aufgebraucht',
    ],
    popular: true,
  },
  {
    id: 'one-time',
    name: 'KorrekturPilot Einzelkorrektur',
    interval: 'einmalig',
    description: 'Einzelne Klausur-Korrektur',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ONE_TIME || 'price_one_time',
    mode: 'payment' as const,
    features: [
      '1 Klausur-Korrektur',
      'KI-gestützte Analyse (OpenAI GPT-4o)',
      'PDF-Export',
      'Handschrift-Erkennung (OCR)',
    ],
    popular: false,
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
          } else if (plan.id === 'one-time' && prices.oneTime) {
            price = (prices.oneTime.amount / 100).toString()
            formattedPrice = prices.oneTime.formatted
            console.log('OneTime price set:', { price, formattedPrice })
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
          price: plan.id === 'package-25' ? '199' : '9',
          formattedPrice: plan.id === 'package-25' ? '199,00 €' : '9,00 €',
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
      <section className="page-section">
        <div className="container">
          <div className="page-intro">
            <h1 className="page-intro-title">Abonnement wählen</h1>
            <p className="page-intro-text">
              Wählen Sie den passenden Plan für Ihre Bedürfnisse
            </p>
          </div>

          {pricesLoading ? (
            <div className="text-center py-12">
              <div className="processing-spinner mx-auto mb-4" aria-hidden />
              <p className="text-gray-600">Preise werden geladen...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-4xl mx-auto">
              {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-lg p-6 hover:shadow-lg transition-shadow relative ${
                  plan.popular ? 'border-blue-500 border-2' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Empfohlen
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.formattedPrice || `${plan.price} €`}</span>
                  <span className="text-gray-600 ml-2">/ {plan.interval}</span>
                </div>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <ul className="mb-6 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
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
                      <span className="text-sm text-gray-700">{feature}</span>
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
                  className={`w-full px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {loading === plan.id || loading === plan.priceId
                    ? 'Wird geladen...'
                    : plan.mode === 'payment'
                      ? 'Jetzt kaufen'
                      : 'Jetzt abonnieren'}
                </button>
              </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </ProtectedRoute>
  )
}
