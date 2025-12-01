"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface EmailAuthFormProps {
  mode: 'login' | 'signup';
  onClose?: () => void;
  onSwitchMode?: () => void;
  onGoogleSignIn?: () => void;
}

export default function EmailAuthForm({ mode, onClose, onSwitchMode, onGoogleSignIn }: EmailAuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      // Prüfe ob E-Mail-Bestätigung erforderlich ist
      if (data.user && data.session) {
        // User ist direkt eingeloggt (E-Mail-Bestätigung deaktiviert)
        onClose?.();
        // Weiterleitung zum Dashboard mit Welcome-Parameter
        router.push('/dashboard?welcome=true');
      } else {
        // E-Mail-Bestätigung erforderlich
        alert("Bitte E-Mail bestätigen! Du wirst nach der Bestätigung zum Dashboard weitergeleitet.");
        onClose?.();
        // Warte auf E-Mail-Bestätigung (wird via Auth-Callback gehandhabt)
        // User wird nach Bestätigung automatisch zu /auth/callback weitergeleitet
      }
    }
  }

  async function handleLogin() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      onClose?.();
      // Nach erfolgreichem Login zum Dashboard weiterleiten
      router.push('/dashboard');
    }
  }

  return (
    <div className="space-y-6">
      {/* Überschrift + Subheadline */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {mode === 'login' ? 'Einloggen' : 'Registrieren'}
        </h1>
        <p className="text-gray-600 text-sm mt-2">
          {mode === 'login' 
            ? 'Melde dich bei deinem KorrekturPilot-Konto an'
            : 'Erstelle dein Konto für KorrekturPilot'}
        </p>
      </div>

      {/* Input-Felder */}
      <div className="space-y-5">
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (mode === 'login') {
                handleLogin();
              } else {
                handleSignup();
              }
            }
          }}
        />
      </div>

      {/* Primary Button */}
      {mode === 'login' ? (
        <button
          className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-medium hover:bg-[#1B3278] transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Lädt...' : 'Einloggen'}
        </button>
      ) : (
        <button
          className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-medium hover:bg-[#1B3278] transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? 'Lädt...' : 'Registrieren'}
        </button>
      )}

      {/* Divider mit "oder" */}
      {onGoogleSignIn && (
        <>
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">oder</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={onGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition"
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium text-gray-700">Mit Google anmelden</span>
          </button>
        </>
      )}

      {/* Footer-Link */}
      {onSwitchMode && (
        <p className="text-center text-sm text-gray-600 mt-4">
          {mode === 'login' ? (
            <>
              Noch kein Konto?{' '}
              <button
                onClick={onSwitchMode}
                className="text-blue-600 hover:underline font-medium"
              >
                Registrieren
              </button>
            </>
          ) : (
            <>
              Bereits ein Konto?{' '}
              <button
                onClick={onSwitchMode}
                className="text-blue-600 hover:underline font-medium"
              >
                Jetzt anmelden
              </button>
            </>
          )}
        </p>
      )}
    </div>
  );
}

