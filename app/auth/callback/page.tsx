import { Suspense } from 'react'
import AuthCallbackClient from './client'

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="processing-spinner mx-auto mb-4" aria-hidden />
          <p className="text-gray-600">Lädt...</p>
        </div>
      </div>
    }>
      <AuthCallbackClient />
    </Suspense>
  )
}
