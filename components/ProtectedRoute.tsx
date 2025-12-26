'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Feature Flag: Auth-Schutz aktiviert für Production
const AUTH_ENABLED = true

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      // Wenn Auth deaktiviert ist, zeige den Inhalt direkt
      if (!AUTH_ENABLED) {
        setIsAuthenticated(true)
        setLoading(false)
        return
      }

      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error) {
          // Handle JWT expired error
          if (error.message?.includes('JWT') || error.message?.includes('expired')) {
            const { error: refreshError } = await supabase.auth.refreshSession()
            if (refreshError) {
              // Redirect to login if refresh fails
              router.push('/')
              return
            }
            // Retry after refresh
            const { data: { user: retryUser } } = await supabase.auth.getUser()
            if (!retryUser) {
              router.push('/')
              return
            }
            setIsAuthenticated(true)
            setLoading(false)
            return
          }
          // Other auth error
          router.push('/')
          return
        }

        if (!user) {
          router.push('/')
          return
        }

        setIsAuthenticated(true)
        setLoading(false)
      } catch (err) {
        console.error('Auth check error:', err)
        router.push('/')
      }
    }

    checkAuth()
  }, [router, supabase.auth])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="processing-spinner mx-auto mb-4" aria-hidden />
          <p className="text-gray-600">Lädt...</p>
        </div>
      </div>
    )
  }

  if (!AUTH_ENABLED || isAuthenticated) {
    return <>{children}</>
  }

  return null
}

