'use client'

import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function CheckoutCancelPage() {
  return (
    <ProtectedRoute>
      <section className="dashboard-section">
        <div className="container">
          <div className="page-intro">
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <svg
                style={{ width: '64px', height: '64px', margin: '0 auto', color: 'var(--color-gray-400)' }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="page-intro-title">Zahlung abgebrochen</h1>
            <p className="page-intro-text">
              Die Zahlung wurde abgebrochen. Du kannst es jederzeit erneut versuchen.
            </p>
          </div>
          <div className="cta-actions" style={{ marginTop: 'var(--spacing-xl)' }}>
            <Link href="/checkout" className="primary-button">
              <span>Erneut versuchen</span>
            </Link>
            <Link href="/" className="secondary-button">
              <span>Zur Startseite</span>
            </Link>
          </div>
        </div>
      </section>
    </ProtectedRoute>
  )
}






