'use client'

import { useState } from 'react'

export default function BuyCreditsButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleBuyCredits = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Fehler beim Erstellen der Checkout-Session')
      }

      const { url } = await response.json()

      if (!url) {
        throw new Error('Keine Checkout-URL erhalten')
      }

      // Weiterleitung zu Stripe Checkout
      window.location.href = url
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten'
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleBuyCredits}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Wird geladen...' : '25 Credits kaufen (€7.90)'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}











