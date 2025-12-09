'use client';

import { createContext, useContext, ReactNode } from 'react';
import { AuthProvider } from '@/components/AuthProvider';
import { Toaster } from 'sonner';

type GradingContextType = Record<string, unknown>;

const GradingContext = createContext<GradingContextType | undefined>(undefined);

export function GradingProvider({ children }: { children: ReactNode }) {
  return (
    <GradingContext.Provider value={{}}>
      {children}
    </GradingContext.Provider>
  );
}

export function useGrading() {
  const context = useContext(GradingContext);
  if (context === undefined) {
    throw new Error('useGrading must be used within a GradingProvider');
  }
  return context;
}

// Root Provider: Kombiniert alle Provider
export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <GradingProvider>
        {children}
        <Toaster position="top-center" richColors />
      </GradingProvider>
    </AuthProvider>
  );
}
