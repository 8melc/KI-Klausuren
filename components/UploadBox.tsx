'use client';

import { useRef, useState } from 'react';

interface UploadBoxProps {
  onUploadComplete?: (text: string) => void;
  label?: string;
  hint?: string;
  buttonLabel?: string;
  endpoint?: string;
}

export default function UploadBox({
  onUploadComplete,
  label = 'PDF-Datei hochladen',
  hint = 'PDF auswählen und hochladen',
  buttonLabel = 'Datei auswählen',
  endpoint = '/api/extract',
}: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      } else if (!data.text) {
        alert('Es konnten keine Inhalte aus der Datei gelesen werden.');
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

  const triggerFileDialog = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      triggerFileDialog();
    }
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileDialog}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        className={`upload-box ${isDragging ? 'is-dragging' : ''} ${
          isUploading ? 'is-uploading' : ''
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileInput}
          hidden
        />
        <div className="upload-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        {isUploading ? (
          <div className="upload-status">
            <div className="processing-spinner" aria-hidden />
            <p className="upload-status-hint">Wird hochgeladen...</p>
          </div>
        ) : uploadedFile ? (
          <div className="upload-status">
            <p className="upload-status-success">✓ {uploadedFile.name}</p>
            <p className="upload-status-hint">Datei erfolgreich hochgeladen</p>
          </div>
        ) : (
          <div className="upload-content">
            <p className="upload-label">{label}</p>
            <p className="upload-hint">{hint}</p>
            <button
              type="button"
              className="upload-button"
              onClick={(event) => {
                event.stopPropagation();
                triggerFileDialog();
              }}
            >
              {buttonLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
