'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Komponente, die die Session nach Stripe Checkout refresht
 * Wird im Dashboard verwendet, wenn checkout=success in den Query-Parametern ist
 */
export default function CheckoutSessionHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const checkoutStatus = searchParams.get('checkout')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (checkoutStatus !== 'success') return

    const refreshSession = async () => {
      try {
        const supabase = createClient()
        
        // 🔥 WICHTIG: Session nach Stripe Redirect refreshen
        // Mehrfach versuchen für Zuverlässigkeit
        let sessionRefreshed = false
        
        for (let i = 0; i < 3; i++) {
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error(`Session refresh attempt ${i + 1} error:`, error)
          } else if (session) {
            console.log('✅ Session erfolgreich refreshed nach Checkout')
            sessionRefreshed = true
            break
          }
          
          // Kurze Pause zwischen Versuchen
          await new Promise(resolve => setTimeout(resolve, 200))
        }

        // Zusätzlich: Versuche Session explizit zu refreshen
        try {
          const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
          if (refreshedSession) {
            console.log('✅ Session explizit refreshed')
            sessionRefreshed = true
          }
        } catch (refreshError) {
          console.error('Explicit session refresh error:', refreshError)
        }

        // Entferne Query-Parameter aus URL (clean URL)
        if (sessionId || checkoutStatus) {
          router.replace('/dashboard', { scroll: false })
        }
      } catch (error) {
        console.error('Error refreshing session:', error)
        // Auch bei Fehler Query-Parameter entfernen
        router.replace('/dashboard', { scroll: false })
      }
    }

    refreshSession()
  }, [checkoutStatus, sessionId, router])

  return null // Diese Komponente rendert nichts
}

