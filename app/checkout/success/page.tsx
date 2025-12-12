// app/checkout/success/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
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
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-semibold mb-2">Zahlung erfolgreich</h1>
      <p className="text-gray-600">
        Du wirst gleich zu deinem Dashboard weitergeleitet…
      </p>
    </main>
  );
}
