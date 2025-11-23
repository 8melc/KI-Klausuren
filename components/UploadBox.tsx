'use client';

import { useRef, useState } from 'react';

export interface UploadResult {
  text: string;
  filename: string;
  size: number;
}

interface UploadBoxProps {
  onUploadComplete?: (result: UploadResult) => void;
  label?: string;
  hint?: string;
  buttonLabel?: string;
  endpoint?: string;
  allowMultiple?: boolean;
  maxFiles?: number;
  currentCount?: number;
}

export default function UploadBox({
  onUploadComplete,
  label = 'PDF-Datei hochladen',
  hint = 'PDF auswählen und hochladen',
  buttonLabel = 'Datei auswählen',
  endpoint = '/api/extract',
  allowMultiple = false,
  maxFiles,
  currentCount = 0,
}: UploadBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lastUploadedName, setLastUploadedName] = useState<string | null>(null);
  const [lastUploadCount, setLastUploadCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    const remainingSlots =
      allowMultiple && typeof maxFiles === 'number'
        ? Math.max(maxFiles - currentCount, 0)
        : files.length;

    if (allowMultiple && remainingSlots === 0) {
      alert('Die maximale Anzahl an Dateien wurde erreicht.');
      return;
    }

    const queue = allowMultiple ? files.slice(0, remainingSlots || files.length) : [files[0]];
    setIsUploading(true);
    setLastUploadCount(queue.length);

    for (const file of queue) {
      await uploadSingleFile(file);
    }

    setIsUploading(false);
  };

  const uploadSingleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Bitte laden Sie nur PDF-Dateien hoch.');
      return;
    }

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
        onUploadComplete({
          text: data.text,
          filename: data.filename ?? file.name,
          size: data.size ?? file.size,
        });
        setLastUploadedName(file.name);
      } else if (!data.text) {
        alert('Es konnten keine Inhalte aus der Datei gelesen werden.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Fehler beim Hochladen der Datei.');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    processFiles(event.dataTransfer.files);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      processFiles(files);
      event.target.value = '';
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
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
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
          multiple={allowMultiple}
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
        ) : lastUploadedName ? (
          <div className="upload-status">
            <p className="upload-status-success">✓ {lastUploadedName}</p>
            {allowMultiple && lastUploadCount > 1 ? (
              <p className="upload-status-hint">{lastUploadCount} Dateien hinzugefügt</p>
            ) : (
              <p className="upload-status-hint">Datei erfolgreich hochgeladen</p>
            )}
          </div>
        ) : (
          <div className="upload-content">
            <p className="upload-label">{label}</p>
            <p className="upload-hint">{hint}</p>
            {allowMultiple && maxFiles && (
              <p className="upload-hint">
                {Math.max(maxFiles - currentCount, 0)} von {maxFiles} Plätzen verfügbar
              </p>
            )}
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
