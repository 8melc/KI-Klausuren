'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get all URL parameters
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')
        
        console.log('Auth callback params:', { code, errorParam, errorDescription })
        
        // Handle OAuth errors from provider
        if (errorParam) {
          console.error('OAuth provider error:', errorParam, errorDescription)
          setError(`OAuth-Fehler: ${errorDescription || errorParam}`)
          setTimeout(() => router.push('/'), 3000)
          return
        }
        
        // Check for auth code
        if (!code) {
          console.error('No auth code in URL. Full URL:', window.location.href)
          setError('Kein Auth-Code gefunden')
          setTimeout(() => router.push('/'), 3000)
          return
        }
        
        // Exchange code for session
        const supabase = createClient()
        console.log('Exchanging code for session...')
        
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          console.error('Error exchanging code for session:', exchangeError)
          setError(`Authentifizierung fehlgeschlagen: ${exchangeError.message}`)
          setTimeout(() => router.push('/'), 3000)
          return
        }
        
        if (data.session) {
          console.log('Session created successfully')
          router.push('/dashboard')
        } else {
          console.error('No session created despite successful exchange')
          setError('Session konnte nicht erstellt werden')
          setTimeout(() => router.push('/'), 3000)
        }
        
      } catch (err) {
        console.error('Unexpected error in auth callback:', err)
        setError('Ein unerwarteter Fehler ist aufgetreten')
        setTimeout(() => router.push('/'), 3000)
      }
    }

    handleCallback()
  }, [searchParams, router])

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
