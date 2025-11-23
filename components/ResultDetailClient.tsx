'use client';

import { useEffect, useState } from 'react';
import ResultCard from '@/components/ResultCard';
import { KlausurAnalyse } from '@/lib/openai';

type ResultStatus = 'Analyse läuft…' | 'Bereit' | 'Fehler';

interface StoredAnalysis {
  id: string;
  name: string;
  docId: string;
  subject: string;
  gradeLevel: string;
  className: string;
  fileName: string;
  status: ResultStatus;
  analysis?: KlausurAnalyse;
}

export default function ResultDetailClient({ id }: { id: string }) {
  const [entry, setEntry] = useState<StoredAnalysis | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('klausurAnalysen');
    if (!raw) return;
    try {
      const parsed: StoredAnalysis[] = JSON.parse(raw);
      setEntry(parsed.find((item) => item.id === id) ?? null);
    } catch {
      setEntry(null);
    }
  }, [id]);

  if (!entry) {
    return (
      <div className="page-section">
        <div className="container">
          <p className="text-center text-gray-600">Kein Ergebnis für diese Klausur gefunden.</p>
        </div>
      </div>
    );
  }

  if (!entry.analysis) {
    return (
      <div className="page-section">
        <div className="container">
          <p className="text-center text-gray-600">Die Analyse läuft noch. Bitte warten Sie einen Moment.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="page-section">
      <div className="container">
        <ResultCard analysis={entry.analysis} klausurName={entry.name} anchorId={`analysis-${entry.id}`} />
      </div>
    </section>
  );
}
