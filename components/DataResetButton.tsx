'use client';

interface DataResetButtonProps {
  className?: string;
  onReset?: () => void;
  label?: string;
}

const RESET_KEYS = [
  'klausurText',
  'klausurFilename',
  'klausurName',
  'klausurAnalysen',
  'erwartungshorizont',
];

export default function DataResetButton({
  className,
  onReset,
  label = 'Daten zurücksetzen',
}: DataResetButtonProps) {
  const handleReset = () => {
    if (typeof window === 'undefined') return;
    const confirmed = window.confirm(
      'Möchten Sie wirklich alle gespeicherten Klausur- und Ergebnisdaten löschen?',
    );

    if (!confirmed) return;

    RESET_KEYS.forEach((key) => localStorage.removeItem(key));
    onReset?.();
  };

  return (
    <button
      onClick={handleReset}
      className={`px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors ${className ?? ''}`}
    >
      {label}
    </button>
  );
}
