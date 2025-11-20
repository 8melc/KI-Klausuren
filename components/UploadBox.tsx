'use client';

import { useState } from 'react';

interface UploadBoxProps {
  onUploadComplete?: (text: string) => void;
  label?: string;
  endpoint?: string;
}

export default function UploadBox({
  onUploadComplete,
  label = 'PDF-Datei hochladen',
  endpoint = '/api/extract',
}: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Bitte laden Sie nur PDF-Dateien hoch.');
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload fehlgeschlagen');
      }

      const data = await response.json();
      if (onUploadComplete && data.text) {
        // Speichere Dateinamen für späteren Gebrauch
        localStorage.setItem('klausurFilename', file.name);
        onUploadComplete(data.text);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Fehler beim Hochladen der Datei.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
        `}
      >
        {isUploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-600">Wird hochgeladen...</p>
          </div>
        ) : uploadedFile ? (
          <div className="space-y-2">
            <p className="text-green-600 font-medium">✓ {uploadedFile.name}</p>
            <p className="text-sm text-gray-500">Datei erfolgreich hochgeladen</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-gray-600">
              Datei hier ablegen oder{' '}
              <label className="text-blue-500 hover:text-blue-700 cursor-pointer underline">
                Datei auswählen
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-sm text-gray-400">Nur PDF-Dateien</p>
          </div>
        )}
      </div>
    </div>
  );
}
