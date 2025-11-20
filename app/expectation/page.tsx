'use client';

import { useState } from 'react';
import UploadBox from '@/components/UploadBox';

export default function ExpectationPage() {
  const [erwartungshorizont, setErwartungshorizont] = useState<string | null>(null);

  const handleUploadComplete = (text: string) => {
    setErwartungshorizont(text);
    // Speichere im localStorage für späteren Gebrauch
    localStorage.setItem('erwartungshorizont', text);
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Erwartungshorizont hochladen</h1>
      <p className="text-gray-600 mb-8">
        Laden Sie hier den Erwartungshorizont als PDF-Datei hoch. Dieser wird für die automatische Korrektur verwendet.
      </p>
      <UploadBox 
        label="Erwartungshorizont-PDF hochladen" 
        onUploadComplete={handleUploadComplete}
      />
      {erwartungshorizont && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✓ Erwartungshorizont erfolgreich geladen</p>
          <p className="text-sm text-green-600 mt-2">
            {erwartungshorizont.substring(0, 200)}...
          </p>
        </div>
      )}
    </div>
  );
}

