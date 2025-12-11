'use client';

import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import EmailAuthForm from './AuthForm';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailMode, setEmailMode] = useState<'login' | 'signup'>('login');
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div className="px-4 py-2">Lädt...</div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard" 
          className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          Dashboard
        </Link>
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-900 transition-colors"
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
          <span className="text-xs">Logout</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <button
          onClick={handleEmailLogin}
          className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-3 py-2"
        >
          Login
        </button>
        <button
          onClick={handleEmailSignup}
          className="bg-[#1E3A8A] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#1B3278] transition"
        >
          Jetzt starten
        </button>
      </div>

      {showEmailModal && (
        <div 
          className="fixed inset-0 bg-gray-50 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 px-4" 
          onClick={() => setShowEmailModal(false)}
        >
          <div 
            className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-md p-10" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Schließen"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Auth Form */}
            <EmailAuthForm 
              mode={emailMode} 
              onClose={() => setShowEmailModal(false)}
              onSwitchMode={() => setEmailMode(emailMode === 'login' ? 'signup' : 'login')}
              onGoogleSignIn={handleGoogleSignIn}
            />
          </div>
        </div>
      )}
    </>
  );
}
