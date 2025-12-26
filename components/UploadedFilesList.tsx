'use client';

import type { UploadedFile } from '@/components/UploadBox';

interface UploadedFilesListProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
}

export default function UploadedFilesList({ files, onRemove }: UploadedFilesListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      {files.map((file) => (
        <div
          key={file.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--spacing-sm)',
            rowGap: 'var(--spacing-sm)',
            flexWrap: 'wrap',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            background: 'var(--color-gray-50)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9375rem',
            color: 'var(--color-gray-700)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flex: '1 1 220px', minWidth: 0 }}>
            <svg
              style={{ width: '18px', height: '18px', color: 'var(--color-gray-500)' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
              <path d="M15 2v6h6" />
            </svg>
            <span style={{ wordBreak: 'break-word' }}>{file.fileName}</span>
          </div>
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className="secondary-button w-full sm:w-auto"
            style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: '0.8125rem' }}
          >
            Entfernen
          </button>
        </div>
      ))}
    </div>
  );
}
