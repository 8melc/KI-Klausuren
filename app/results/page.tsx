'use client';

import { useState, useEffect } from 'react';
import ResultCard from '@/components/ResultCard';
import { KlausurAnalyse } from '@/lib/openai';

export default function ResultsPage() {
  const [analyses, setAnalyses] = useState<Array<{ name: string; analysis: KlausurAnalyse }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Lade gespeicherte Analysen aus localStorage
    const saved = localStorage.getItem('klausurAnalysen');
    if (saved) {
      try {
        setAnalyses(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading analyses:', error);
      }
    }
  }, []);

  const handleAnalyze = async () => {
    const klausurText = localStorage.getItem('klausurText');
    const erwartungshorizont = localStorage.getItem('erwartungshorizont');

    if (!klausurText || !erwartungshorizont) {
      alert('Bitte laden Sie zuerst eine Klausur und einen Erwartungshorizont hoch.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          klausurText,
          erwartungshorizont,
        }),
      });

      if (!response.ok) {
        throw new Error('Analyse fehlgeschlagen');
      }

      const analysis = await response.json();
      const klausurName = localStorage.getItem('klausurName') || 'Klausur';

      const newAnalysis = {
        name: klausurName,
        analysis,
      };

      const updated = [...analyses, newAnalysis];
      setAnalyses(updated);
      localStorage.setItem('klausurAnalysen', JSON.stringify(updated));
    } catch (error) {
      console.error('Analyze error:', error);
      alert('Fehler bei der Analyse. Bitte stellen Sie sicher, dass der OpenAI API Key konfiguriert ist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ergebnisse anzeigen</h1>
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Analysiere...' : 'Klausur analysieren'}
        </button>
      </div>

      {analyses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">Noch keine Analysen vorhanden.</p>
          <p className="text-sm text-gray-500">
            Laden Sie zuerst eine Klausur und einen Erwartungshorizont hoch, dann klicken Sie auf &quot;Klausur analysieren&quot;.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {analyses.map((item, index) => (
            <ResultCard key={index} analysis={item.analysis} klausurName={item.name} />
          ))}
        </div>
      )}
    </div>
  );
}
