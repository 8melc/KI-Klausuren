'use client';

import { useRef } from 'react';
import { toast } from 'sonner';

export interface UploadedFile {
  id: string;
  fileName: string;
  file: File;
}

interface UploadBoxProps {
  title: string;
  description: string;
  buttonLabel: string;
  allowMultiple?: boolean;
  onUpload: (files: UploadedFile[]) => void;
  disabled?: boolean;
  onDisabledClick?: () => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_FILE_SIZE_MB = 50;

export default function UploadBox({
  title,
  description,
  buttonLabel,
  allowMultiple = false,
  onUpload,
  disabled = false,
  onDisabledClick,
}: UploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[]) => {
    const selected: UploadedFile[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      // Typ prüfen
      if (file.type !== 'application/pdf') {
        errors.push(`${file.name}: Nur PDF-Dateien sind erlaubt.`);
        return;
      }

      // Größe prüfen
      if (file.size > MAX_FILE_SIZE) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        errors.push(
          `${file.name}: Diese Datei ist zu groß (${fileSizeMB} MB). Maximal ${MAX_FILE_SIZE_MB} MB erlaubt.`
        );
        return;
      }

      selected.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        fileName: file.name,
        file,
      });
    });

    if (errors.length > 0) {
      const message = errors.join('\n');
      // Wenn toast verfügbar ist, nutze ihn für besseres UX
      if (toast) {
        toast.error(message);
      } else {
        alert(message);
      }
    }

    if (selected.length === 0) {
      // Keine gültigen Dateien
      return;
    }

    onUpload(selected);
  };

  const triggerDialog = () => {
    if (disabled) {
      onDisabledClick?.();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled && onDisabledClick) {
      onDisabledClick();
    }
  };

  return (
    <div style={{
      border: '1px solid var(--color-gray-200)',
      borderRadius: 'var(--radius-lg)',
      background: 'white',
      padding: 'var(--spacing-xl)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-md)',
      minHeight: '200px',
      position: 'relative',
    }}>
      {disabled && (
        <div
          className="absolute inset-0 z-10 cursor-not-allowed"
          onClick={handleOverlayClick}
          style={{
            borderRadius: 'var(--radius-lg)',
          }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <div style={{
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-info-light)',
          color: 'var(--color-primary)',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <svg
            style={{ width: '24px', height: '24px' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 16l-4 4-4-4M12 4v12" />
            <path d="M20 16a4 4 0 00-4-4H8a4 4 0 00-4 4" />
          </svg>
        </div>
        <div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gray-500)', marginBottom: 'var(--spacing-xs)' }}>Upload</p>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-gray-900)' }}>{title}</h3>
        </div>
      </div>
      <p style={{ fontSize: '0.9375rem', color: 'var(--color-gray-600)' }}>{description}</p>
      <button
        type="button"
        className="primary-button"
        onClick={triggerDialog}
        disabled={disabled}
        style={{ marginTop: 'auto', width: '100%' }}
      >
        <span>{buttonLabel}</span>
      </button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="application/pdf"
        multiple={allowMultiple}
        disabled={disabled}
        onChange={(event) => {
          if (event.target.files) {
            handleFiles(event.target.files);
            event.target.value = '';
          }
        }}
      />
    </div>
  );
}
