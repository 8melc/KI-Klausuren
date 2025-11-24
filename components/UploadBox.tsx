'use client';

import { useRef } from 'react';

export interface UploadedFile {
  id: string;
  fileName: string;
  file: File;
}

interface UploadBoxProps {
  label?: string;
  hint?: string;
  buttonLabel?: string;
  allowMultiple?: boolean;
  onUpload: (files: UploadedFile[]) => void;
  disabled?: boolean;
}

export default function UploadBox({
  label = 'PDF-Datei hochladen',
  hint = 'Nur PDF-Dateien',
  buttonLabel = 'Datei auswählen',
  allowMultiple = false,
  onUpload,
  disabled = false,
}: UploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wrapperClass = disabled ? 'upload-box upload-box-muted' : 'upload-box';

  const handleFiles = (files: FileList | File[]) => {
    const selected = Array.from(files)
      .filter((file) => file.type === 'application/pdf')
      .map((file) => ({
        id: `${file.name}-${Date.now()}`,
        fileName: file.name,
        file,
      }));

    if (selected.length === 0) {
      alert('Bitte laden Sie nur PDF-Dateien hoch.');
      return;
    }

    onUpload(selected);
  };

  const triggerDialog = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className={wrapperClass}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(event) => {
          if (event.target.files) {
            handleFiles(event.target.files);
            event.target.value = '';
          }
        }}
        accept="application/pdf"
        multiple={allowMultiple}
        hidden
      />
      <button
        type="button"
        className="upload-button"
        onClick={triggerDialog}
        disabled={disabled}
      >
        {buttonLabel}
      </button>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xs text-gray-400">{hint}</p>
    </div>
  );
}
