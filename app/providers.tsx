'use client';

import { createContext, useContext, ReactNode } from 'react';

type GradingContextType = Record<string, never>;

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
