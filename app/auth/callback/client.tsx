'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackClient() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient()
        
        // Check if we have hash params (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          console.log('Using implicit flow (hash params)')
          
          // Set session from tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (sessionError) {
            console.error('Error setting session:', sessionError)
            setError(`Authentifizierung fehlgeschlagen: ${sessionError.message}`)
            setTimeout(() => router.push('/'), 3000)
            return
          }
          
          if (data.session) {
            console.log('Session created successfully via implicit flow')
            router.push('/dashboard')
            return
          }
        }
        
        // Fallback: Check for PKCE code in query params
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        
        if (code) {
          console.log('Using PKCE flow (query params)')
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error('Error exchanging code:', exchangeError)
            setError(`Authentifizierung fehlgeschlagen: ${exchangeError.message}`)
            setTimeout(() => router.push('/'), 3000)
            return
          }
          
          if (data.session) {
            console.log('Session created successfully via PKCE')
            router.push('/dashboard')
            return
          }
        }
        
        // No auth data found
        console.error('No access_token or code found')
        setError('Kein Auth-Code gefunden')
        setTimeout(() => router.push('/'), 3000)
        
      } catch (err) {
        console.error('Unexpected error:', err)
        setError('Ein unerwarteter Fehler ist aufgetreten')
        setTimeout(() => router.push('/'), 3000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-yellow-600 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">
              Authentifizierung fehlgeschlagen
            </h2>
            <p className="text-gray-600 mb-2">{error}</p>
            <p className="text-sm text-gray-500">Du wirst zur Startseite weitergeleitet...</p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-2">Authentifizierung läuft...</h2>
            <p className="text-gray-600">Sie werden gleich weitergeleitet.</p>
          </>
        )}
      </div>
    </div>
  )
}
