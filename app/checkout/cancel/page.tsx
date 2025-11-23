'use client'

import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <section className="page-section">
      <div className="container">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-gray-400"
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
          <h1 className="text-2xl font-bold mb-4">Zahlung abgebrochen</h1>
          <p className="text-gray-600 mb-6">
            Die Zahlung wurde abgebrochen. Sie können es jederzeit erneut versuchen.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/checkout"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Erneut versuchen
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

