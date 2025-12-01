"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      try {
        // Hole den Code aus der URL
        const code = searchParams.get("code");
        
        if (!code) {
          setStatus("error");
          setErrorMessage("Kein Auth-Code gefunden");
          setTimeout(() => router.replace("/"), 3000);
          return;
        }

        // Tausche Code gegen Session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("Auth Callback Error:", error);
          setStatus("error");
          setErrorMessage(error.message || "Authentifizierung fehlgeschlagen");
          setTimeout(() => router.replace("/"), 3000);
          return;
        }

        if (data.session) {
          setStatus("success");
          
          // Prüfe ob User neu ist (erste Session) für Welcome-Banner
          const { data: { user } } = await supabase.auth.getUser();
          let redirectPath = "/dashboard";
          
          if (user) {
            // Prüfe ob User-Eintrag existiert (neu registriert)
            const { data: userProfile } = await supabase
              .from('users')
              .select('created_at')
              .eq('id', user.id)
              .single();

            // Wenn User-Eintrag sehr neu ist (< 1 Minute), zeige Welcome-Banner
            if (userProfile) {
              const createdAt = new Date(userProfile.created_at);
              const now = new Date();
              const diffMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;
              
              if (diffMinutes < 1) {
                redirectPath = "/dashboard?welcome=true";
              }
            }
          }
          
          // Kurze Verzögerung, damit Session gespeichert wird
          setTimeout(() => {
            router.replace(redirectPath);
          }, 500);
        } else {
          setStatus("error");
          setErrorMessage("Keine Session erhalten");
          setTimeout(() => router.replace("/"), 3000);
        }
      } catch (err) {
        console.error("Unexpected error in auth callback:", err);
        setStatus("error");
        setErrorMessage("Unerwarteter Fehler");
        setTimeout(() => router.replace("/"), 3000);
      }
    }

    handleAuth();
  }, [searchParams, router, supabase]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="processing-spinner mx-auto mb-4" aria-hidden />
          <p className="text-gray-600">Authentifiziere…</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentifizierung fehlgeschlagen</h1>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <p className="text-sm text-gray-500">Du wirst zur Startseite weitergeleitet…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-green-500 text-4xl mb-4">✅</div>
        <p className="text-gray-600">Erfolgreich eingeloggt! Weiterleitung…</p>
      </div>
    </div>
  );
}

