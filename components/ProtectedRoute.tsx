'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Feature Flag: Setze auf false, um Auth-Schutz während der Entwicklung zu deaktivieren
// TODO: Auf true setzen für Production
const AUTH_ENABLED = false

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

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/')
        return
      }

      setIsAuthenticated(true)
      setLoading(false)
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

