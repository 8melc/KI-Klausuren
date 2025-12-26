"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface EmailAuthFormProps {
  mode: 'login' | 'signup' | 'forgot-password';
  onClose?: () => void;
  onSwitchMode?: () => void;
  onGoogleSignIn?: () => void;
  onForgotPassword?: () => void;
}

export default function EmailAuthForm({ mode, onClose, onSwitchMode, onGoogleSignIn, onForgotPassword }: EmailAuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleForgotPassword() {
    if (!email) {
      toast.error('Bitte gib deine E-Mail-Adresse ein.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      setLoading(false);
      if (error) {
        toast.error(error.message || 'Fehler beim Senden der E-Mail. Bitte versuche es erneut.');
      } else {
        toast.success('E-Mail zum Zurücksetzen des Passworts wurde gesendet! Bitte prüfe dein Postfach.');
        if (onClose) {
          onClose();
        }
      }
    } catch (err) {
      setLoading(false);
      toast.error('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      console.error('Forgot password error:', err);
    }
  }

  async function handleSignup() {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        // Prüfe ob E-Mail-Bestätigung erforderlich ist
        if (data.user && data.session) {
          // User ist direkt eingeloggt (E-Mail-Bestätigung deaktiviert)
          toast.success('Registrierung erfolgreich!');
          if (onClose) {
            onClose();
          } else {
            // Weiterleitung zum Dashboard mit Welcome-Parameter (Fallback)
            router.push('/dashboard?welcome=true');
          }
        } else {
          // E-Mail-Bestätigung erforderlich
          toast.info('Bitte E-Mail bestätigen! Du wirst nach der Bestätigung weitergeleitet.');
          if (onClose) {
            onClose();
          }
          // Warte auf E-Mail-Bestätigung (wird via Auth-Callback gehandhabt)
          // User wird nach Bestätigung automatisch zu /auth/callback weitergeleitet
        }
      }
    } catch (err) {
      setLoading(false);
      toast.error('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      console.error('Signup error:', err);
    }
  }

  async function handleLogin() {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Erfolgreich angemeldet!');
        if (onClose) {
          onClose();
        } else {
          // Nach erfolgreichem Login zum Dashboard weiterleiten (Fallback)
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setLoading(false);
      toast.error('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      console.error('Login error:', err);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)',
        padding: 'clamp(1rem, 4vw, 1.5rem)',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 18px 40px rgba(0,0,0,0.08)',
      }}
    >
      {/* Überschrift + Subheadline */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: 'clamp(1.4rem, 4vw, 1.8rem)',
          fontWeight: '700',
          color: 'var(--color-gray-900)',
          marginBottom: 'var(--spacing-xs)',
          lineHeight: '1.2',
          letterSpacing: '-0.01em',
        }}>
          {mode === 'login' 
            ? 'Willkommen zurück' 
            : mode === 'forgot-password'
            ? 'Passwort zurücksetzen'
            : 'Zeit sparen & Nerven schonen'}
        </h1>
        <p style={{
          color: 'var(--color-gray-600)',
          fontSize: 'clamp(0.95rem, 3.5vw, 1rem)',
          lineHeight: '1.55',
          maxWidth: '32rem',
          margin: '0 auto',
        }}>
          {mode === 'login' 
            ? 'Bereit für die nächste Korrektur-Runde?'
            : mode === 'forgot-password'
            ? 'Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen deines Passworts.'
            : 'Starte jetzt deine erste KI-gestützte Korrektur. Kostenlos & unverbindlich.'}
        </p>
      </div>

      {/* Input-Felder */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <div>
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              border: '1px solid var(--color-gray-300)',
              borderRadius: '14px',
              padding: '12px 16px',
              fontSize: '1rem',
              color: 'var(--color-gray-900)',
              backgroundColor: 'white',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.outline = '2px solid var(--color-primary)';
              e.target.style.outlineOffset = '2px';
              e.target.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              e.target.style.outline = 'none';
              e.target.style.borderColor = 'var(--color-gray-300)';
            }}
            disabled={loading}
            required
            aria-label="E-Mail-Adresse"
            aria-invalid={email && !email.includes('@') ? true : false}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && mode === 'forgot-password') {
                handleForgotPassword();
              }
            }}
          />
          {email && !email.includes('@') && (
            <p style={{
              color: 'var(--color-error)',
              fontSize: '0.875rem',
              marginTop: 'var(--spacing-xs)',
            }}>
              Bitte gib eine gültige E-Mail-Adresse ein.
            </p>
          )}
        </div>
        {mode !== 'forgot-password' && (
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                border: '1px solid var(--color-gray-300)',
                borderRadius: '14px',
                padding: '12px 16px',
                paddingRight: '48px',
                fontSize: '1rem',
                color: 'var(--color-gray-900)',
                backgroundColor: 'white',
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.outline = '2px solid var(--color-primary)';
                e.target.style.outlineOffset = '2px';
                e.target.style.borderColor = 'var(--color-primary)';
              }}
              onBlur={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = 'var(--color-gray-300)';
              }}
              disabled={loading}
              required
              minLength={mode === 'signup' ? 6 : undefined}
              aria-label="Passwort"
              aria-invalid={password && mode === 'signup' && password.length < 6 ? true : false}
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
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-gray-500)',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-gray-700)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-gray-500)';
              }}
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
            {password && mode === 'signup' && password.length < 6 && (
              <p style={{
                color: 'var(--color-error)',
                fontSize: '0.875rem',
                marginTop: 'var(--spacing-xs)',
              }}>
                Das Passwort muss mindestens 6 Zeichen lang sein.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Primary Button */}
      {mode === 'login' ? (
        <button
          className="primary-button"
          style={{ width: '100%', minHeight: '52px', borderRadius: '14px', fontSize: '1rem' }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Lädt...' : 'Einloggen'}
        </button>
      ) : mode === 'forgot-password' ? (
        <button
          className="primary-button"
          style={{ width: '100%', minHeight: '52px', borderRadius: '14px', fontSize: '1rem' }}
          onClick={handleForgotPassword}
          disabled={loading}
        >
          {loading ? 'Lädt...' : 'E-Mail senden'}
        </button>
      ) : (
        <button
          className="primary-button"
          style={{ width: '100%', minHeight: '52px', borderRadius: '14px', fontSize: '1rem' }}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? 'Lädt...' : 'Kostenlos starten'}
        </button>
      )}

      {/* Divider mit "oder" */}
      {onGoogleSignIn && (
        <>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: 'var(--spacing-md) 0',
            position: 'relative',
          }}>
            <div style={{
              flexGrow: 1,
              borderTop: '1px solid var(--color-gray-300)',
            }}></div>
            <span style={{
              margin: '0 var(--spacing-md)',
              color: 'var(--color-gray-500)',
              fontSize: '0.875rem',
            }}>
              oder
            </span>
            <div style={{
              flexGrow: 1,
              borderTop: '1px solid var(--color-gray-300)',
            }}></div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={onGoogleSignIn}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--spacing-sm)',
              backgroundColor: 'white',
              border: '1px solid var(--color-gray-300)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-md)',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'var(--color-gray-700)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
              e.currentTarget.style.borderColor = 'var(--color-gray-400)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = 'var(--color-gray-300)';
            }}
            disabled={loading}
          >
            <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24">
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
            <span>Mit Google anmelden</span>
          </button>
        </>
      )}

      {/* Footer-Link */}
      <div style={{
        textAlign: 'center',
        fontSize: '0.875rem',
        color: 'var(--color-gray-600)',
        marginTop: 'var(--spacing-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
      }}>
        {mode === 'login' && (
          <>
            {onForgotPassword && (
              <button
                onClick={onForgotPassword}
                style={{
                  color: 'var(--color-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textDecoration: 'underline',
                  fontSize: '0.875rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary-dark)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
              >
                Passwort vergessen?
              </button>
            )}
            {onSwitchMode && (
              <p>
                Noch kein Konto?{' '}
                <button
                  onClick={onSwitchMode}
                  style={{
                    color: 'var(--color-primary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textDecoration: 'underline',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary-dark)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                >
                  Registrieren
                </button>
              </p>
            )}
          </>
        )}
        {mode === 'forgot-password' && onSwitchMode && (
          <p>
            Zurück zum{' '}
            <button
              onClick={onSwitchMode}
              style={{
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                textDecoration: 'underline',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-primary-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
            >
              Login
            </button>
          </p>
        )}
        {mode === 'signup' && onSwitchMode && (
          <p>
            Bereits ein Konto?{' '}
            <button
              onClick={onSwitchMode}
              style={{
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                textDecoration: 'underline',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-primary-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
            >
              Jetzt anmelden
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
