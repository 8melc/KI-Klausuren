'use client';

import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import EmailAuthForm from './AuthForm';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailMode, setEmailMode] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();
        
        if (error) {
          // Handle JWT expired error
          if (error.message?.includes('JWT') || error.message?.includes('expired')) {
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              // Session expired, user needs to login again
              setUser(null);
              setLoading(false);
              return;
            }
            // Retry after refresh
            const { data: { user: retryUser } } = await supabase.auth.getUser();
            setUser(retryUser);
            setLoading(false);
            return;
          }
          // Other error
          setUser(null);
          setLoading(false);
          return;
        }
        
        setUser(currentUser);
        setLoading(false);
      } catch (err) {
        console.error('Error getting user:', err);
        setUser(null);
        setLoading(false);
      }
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
        setShowEmailModal(false);
        router.refresh();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleEmailLogin = () => {
    setEmailMode('login');
    setShowEmailModal(true);
  };

  const handleEmailSignup = () => {
    setEmailMode('signup');
    setShowEmailModal(true);
  };

  const handleForgotPassword = () => {
    setEmailMode('forgot-password');
    setShowEmailModal(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ padding: '0.5rem 0.75rem', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
        Lädt...
      </div>
    );
  }

  if (user) {
    return (
      <button
        onClick={handleSignOut}
        className="logout-button"
        aria-label="Abmelden"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
          strokeWidth="2"
          className="w-5 h-5"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
        <span className="text-sm font-medium">Logout</span>
      </button>
    );
  }

  return (
    <>
      <div className="auth-actions">
        <button
          onClick={handleEmailLogin}
          className="auth-link"
        >
          Login
        </button>
        <button
          onClick={handleEmailSignup}
          className="primary-button auth-primary"
        >
          Jetzt starten
        </button>
      </div>

      {showEmailModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: 'var(--spacing-md)',
          }}
          onClick={() => setShowEmailModal(false)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '32rem',
              backgroundColor: 'white',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              padding: 'var(--spacing-2xl)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--spacing-sm)' }}>
              <button
                onClick={() => setShowEmailModal(false)}
                style={{
                  color: 'var(--color-gray-400)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--spacing-xs)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-gray-600)';
                  e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--color-gray-400)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label="Schließen"
              >
                <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Auth Form */}
            <EmailAuthForm 
              mode={emailMode} 
              onClose={() => setShowEmailModal(false)}
              onSwitchMode={() => {
                if (emailMode === 'login') {
                  setEmailMode('signup');
                } else if (emailMode === 'signup') {
                  setEmailMode('login');
                } else {
                  setEmailMode('login');
                }
              }}
              onForgotPassword={handleForgotPassword}
              onGoogleSignIn={handleGoogleSignIn}
            />
          </div>
        </div>
      )}
    </>
  );
}
