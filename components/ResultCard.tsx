'use client';

import { KlausurAnalyse } from '@/lib/openai';

interface ResultCardProps {
  analysis: KlausurAnalyse;
  klausurName?: string;
}

export default function ResultCard({ analysis, klausurName }: ResultCardProps) {
  const prozentColor = 
    analysis.prozent >= 90 ? 'text-green-600' :
    analysis.prozent >= 75 ? 'text-blue-600' :
    analysis.prozent >= 50 ? 'text-yellow-600' :
    'text-red-600';

  const handleDownloadDoc = async () => {
    try {
      const response = await fetch('/api/generate-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          klausurName: klausurName || 'Klausur',
          analysis,
        }),
      });

      if (!response.ok) {
        throw new Error('Download fehlgeschlagen');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(klausurName || 'Klausur').replace(/[^a-zA-Z0-9_-]+/g, '_')}_Bewertung.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('DOC download error:', error);
      alert('Fehler beim Herunterladen des Word-Dokuments');
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      {klausurName && (
        <h3 className="text-xl font-semibold mb-4">{klausurName}</h3>
      )}
      
      {/* Gesamtbewertung */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Gesamtbewertung</span>
          <span className={`text-2xl font-bold ${prozentColor}`}>
            {analysis.prozent.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{analysis.erreichtePunkte} / {analysis.gesamtpunkte} Punkte</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              analysis.prozent >= 90 ? 'bg-green-500' :
              analysis.prozent >= 75 ? 'bg-blue-500' :
              analysis.prozent >= 50 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${analysis.prozent}%` }}
          ></div>
        </div>
      </div>

      {/* Aufgaben-Details */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Aufgaben-Details</h4>
        <div className="space-y-3">
          {analysis.aufgaben.map((aufgabe, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium">{aufgabe.aufgabe}</span>
                <span className="text-sm text-gray-600">
                  {aufgabe.erreichtePunkte} / {aufgabe.maxPunkte} Pkt.
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{aufgabe.kommentar}</p>
              {aufgabe.korrekturen && aufgabe.korrekturen.length > 0 && (
                <ul className="text-sm text-red-600 list-disc list-inside">
                  {aufgabe.korrekturen.map((korrektur, kIndex) => (
                    <li key={kIndex}>{korrektur}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Zusammenfassung */}
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Zusammenfassung</h4>
        <p className="text-gray-700 text-sm leading-relaxed">{analysis.zusammenfassung}</p>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownloadDoc}
        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Word-Dokument herunterladen
      </button>
    </div>
  );
}
