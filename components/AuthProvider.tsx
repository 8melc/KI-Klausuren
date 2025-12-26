'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Session as SupabaseSession, User } from '@supabase/supabase-js';

type Session = SupabaseSession | null;

type AuthContextType = {
  session: Session;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function init() {
      // 1) Lade aktuelle Session beim Start
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      
      const sess = data?.session ?? null;
      setSession(sess);
      setUser(sess?.user ?? null);
      setLoading(false);
    }
    init();

    // 2) Höre auf Auth-Änderungen (login/logout/token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      const sess = newSession ?? null;
      setSession(sess);
      setUser(sess?.user ?? null);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

