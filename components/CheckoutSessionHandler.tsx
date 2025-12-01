'use client'

import { useEffect, useState } from 'react'
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
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (checkoutStatus !== 'success' || isRefreshing) return

    const refreshSession = async () => {
      setIsRefreshing(true)
      
      try {
        const supabase = createClient()
        
        // 🔥 SCHRITT 1: Versuche Session über API-Endpoint zu refreshen (Server-Side)
        try {
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include', // WICHTIG: Cookies mitsenden
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log('✅ Session über API refreshed:', data)
          } else {
            console.warn('API refresh failed, trying client-side refresh')
          }
        } catch (apiError) {
          console.error('API refresh error:', apiError)
        }
        
        // 🔥 SCHRITT 2: Client-Side Session Refresh als Fallback
        // Warte kurz, damit Server-Side Cookies gesetzt werden können
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Mehrfach versuchen für Zuverlässigkeit
        for (let i = 0; i < 5; i++) {
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error(`Session check attempt ${i + 1} error:`, error)
          } else if (session && session.user) {
            console.log('✅ Session erfolgreich gefunden nach Checkout:', session.user.email)
            break
          }
          
          // Versuche Session zu refreshen
          try {
            const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
            if (refreshedSession && refreshedSession.user) {
              console.log('✅ Session explizit refreshed:', refreshedSession.user.email)
              break
            } else if (refreshError) {
              console.error('Refresh error:', refreshError)
            }
          } catch (refreshError) {
            console.error('Explicit session refresh error:', refreshError)
          }
          
          // Längere Pause zwischen Versuchen
          await new Promise(resolve => setTimeout(resolve, 300))
        }

        // 🔥 SCHRITT 3: Finale Prüfung
        const { data: { session: finalSession }, error: finalError } = await supabase.auth.getSession()
        
        if (finalError) {
          console.error('Final session check error:', finalError)
        } else if (finalSession && finalSession.user) {
          console.log('✅ Finale Session-Prüfung erfolgreich:', finalSession.user.email)
        } else {
          console.warn('⚠️ Keine Session gefunden nach Checkout - User muss sich neu einloggen')
        }

        // Entferne Query-Parameter aus URL (clean URL)
        // Warte noch etwas, damit Session gesetzt wird
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (sessionId || checkoutStatus) {
          router.replace('/dashboard', { scroll: false })
        }
      } catch (error) {
        console.error('Error refreshing session:', error)
        // Auch bei Fehler Query-Parameter entfernen
        router.replace('/dashboard', { scroll: false })
      } finally {
        setIsRefreshing(false)
      }
    }

    refreshSession()
  }, [checkoutStatus, sessionId, router, isRefreshing])

  return null // Diese Komponente rendert nichts
}

