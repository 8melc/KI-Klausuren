'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Prüfe, ob wir eine gültige Recovery-Session haben
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Prüfe, ob es eine Recovery-Session ist
      // PASSWORD_RECOVERY Sessions haben spezielle Eigenschaften
      if (session) {
        setIsValidSession(true);
      } else {
        // Keine Session - möglicherweise abgelaufen oder ungültig
        toast.error('Der Link zum Zurücksetzen des Passworts ist abgelaufen oder ungültig.');
        router.push('/');
      }
    };

    checkSession();

    // Listener für Auth State Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User hat auf den Recovery-Link geklickt
        setIsValidSession(true);
      } else if (event === 'SIGNED_OUT' && !session) {
        // Session wurde beendet
        setIsValidSession(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Bitte fülle alle Felder aus.');
      return;
    }

    if (password.length < 6) {
      toast.error('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Die Passwörter stimmen nicht überein.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      setLoading(false);
      if (error) {
        toast.error(error.message || 'Fehler beim Zurücksetzen des Passworts.');
        console.error('Reset password error:', error);
      } else {
        toast.success('Passwort erfolgreich zurückgesetzt!');
        // Warte kurz, dann weiterleiten
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setLoading(false);
      toast.error('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      console.error('Reset password error:', err);
    }
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Link ungültig oder abgelaufen
          </h2>
          <p className="text-gray-600 mb-6">
            Der Link zum Zurücksetzen des Passworts ist nicht mehr gültig. Bitte fordere einen neuen Link an.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-medium hover:bg-[#1B3278] transition"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Neues Passwort setzen
          </h1>
          <p className="text-gray-600 text-sm">
            Gib dein neues Passwort ein. Es muss mindestens 6 Zeichen lang sein.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Neues Passwort
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={loading}
                required
                minLength={6}
                placeholder="Mindestens 6 Zeichen"
                aria-label="Neues Passwort"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {password && password.length < 6 && (
              <p className="text-red-600 text-sm mt-1">
                Das Passwort muss mindestens 6 Zeichen lang sein.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Passwort bestätigen
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                disabled={loading}
                required
                minLength={6}
                placeholder="Passwort wiederholen"
                aria-label="Passwort bestätigen"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleResetPassword(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                aria-label={showConfirmPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-600 text-sm mt-1">
                Die Passwörter stimmen nicht überein.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-medium hover:bg-[#1B3278] transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || password.length < 6 || password !== confirmPassword}
          >
            {loading ? 'Wird gespeichert...' : 'Passwort zurücksetzen'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-600 hover:text-gray-900 transition"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    </div>
  );
}

