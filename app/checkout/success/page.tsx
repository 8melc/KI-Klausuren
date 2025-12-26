// app/checkout/success/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from '@/components/ProtectedRoute';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const addCredits = async () => {
      try {
        const response = await fetch("/api/credits/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credits: 25 }),
        });

        if (!response.ok) {
          console.error("Fehler beim Hinzufügen der Credits");
        }
      } catch (error) {
        console.error("Fehler beim Hinzufügen der Credits:", error);
      }
    };

    // Credits hinzufügen
    addCredits();

    // Nach 2 Sekunden zum Dashboard weiterleiten
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router, sessionId]);

  return (
    <section className="dashboard-section">
      <div className="container">
        <div className="page-intro">
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <svg
              style={{ width: '64px', height: '64px', margin: '0 auto', color: 'var(--color-success)' }}
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
          <h1 className="page-intro-title">Zahlung erfolgreich</h1>
          <p className="page-intro-text">
            Du wirst gleich zu deinem Dashboard weitergeleitet…
          </p>
        </div>
      </div>
    </section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <section className="dashboard-section">
          <div className="container">
            <div className="page-intro">
              <h1 className="page-intro-title">Zahlung erfolgreich</h1>
              <p className="page-intro-text">Lädt...</p>
            </div>
          </div>
        </section>
      }>
        <CheckoutSuccessContent />
      </Suspense>
    </ProtectedRoute>
  );
}
