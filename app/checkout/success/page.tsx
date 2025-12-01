'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    let mounted = true
    if (!sessionId) {
      // Wenn keine session_id, direkt zum Dashboard
      router.push('/dashboard')
      return
    }

    const refreshSession = async () => {
      try {
        // 🔥 WICHTIG: Session nach Stripe Redirect refreshen
        const supabase = createClient()
        
        // Refresh die Auth Session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session refresh error:', error)
        } else if (session) {
          console.log('✅ Session erfolgreich refreshed nach Checkout')
        }

        // Kurze Verzögerung, damit Session gesetzt wird
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (mounted) {
          setLoading(false)
          // Nach 2 Sekunden zum Dashboard weiterleiten
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        }
      } catch (error) {
        console.error('Error refreshing session:', error)
        if (mounted) {
          setLoading(false)
          // Auch bei Fehler zum Dashboard weiterleiten
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        }
      }
    }

    refreshSession()

    return () => {
      mounted = false
    }
  }, [sessionId, router])

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
