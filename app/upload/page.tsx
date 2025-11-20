'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';

export default function UploadPage() {
  const [klausurText, setKlausurText] = useState<string | null>(null);

  const handleUploadComplete = (text: string) => {
    setKlausurText(text);
    // Speichere im localStorage für späteren Gebrauch
    localStorage.setItem('klausurText', text);
    // Speichere auch den Dateinamen (falls verfügbar)
    const filename = localStorage.getItem('klausurFilename') || 'Klausur';
    localStorage.setItem('klausurName', filename);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Klausuren hochladen</h1>
      <p className="text-gray-600 mb-8">
        Laden Sie hier die zu korrigierenden Klausuren als PDF-Dateien hoch.
      </p>
      <UploadBox
        label="Klausur-PDF hochladen"
        endpoint="/api/extract-klausur"
        onUploadComplete={handleUploadComplete}
      />
      {klausurText && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✓ Klausur erfolgreich geladen</p>
          <p className="text-sm text-green-600 mt-2">
            {klausurText.length} Zeichen extrahiert
          </p>
          <p className="text-xs text-green-500 mt-2 italic">
            Vorschau: {klausurText.substring(0, 200)}...
          </p>
        </div>
      )}
    </div>
  );
}
