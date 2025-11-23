'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    let mounted = true
    if (!sessionId) return

    const verifySession = async () => {
      // Placeholder für echte Session-Verifizierung
      await Promise.resolve()
      if (mounted) {
        setLoading(false)
      }
    }

    verifySession()

    return () => {
      mounted = false
    }
  }, [sessionId])

  if (loading) {
    return (
      <section className="page-section">
        <div className="container">
          <div className="text-center">
            <div className="processing-spinner mx-auto mb-4" aria-hidden />
            <p>Wird verarbeitet...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="page-section">
      <div className="container">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4">Zahlung erfolgreich!</h1>
          <p className="text-gray-600 mb-6">
            Vielen Dank für Ihre Zahlung. Sie können jetzt alle Funktionen nutzen.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="page-section">
          <div className="container">
            <div className="text-center">
              <div className="processing-spinner mx-auto mb-4" aria-hidden />
              <p>Lädt...</p>
            </div>
          </div>
        </section>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="page-section">
          <div className="container">
            <div className="text-center">
              <div className="processing-spinner mx-auto mb-4" aria-hidden />
              <p>Lädt...</p>
            </div>
          </div>
        </section>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
