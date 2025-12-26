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
  'klausurDocs',
];

export default function DataResetButton({
  className,
  onReset,
  label = 'Daten zurücksetzen',
}: DataResetButtonProps) {
  const handleReset = () => {
    if (typeof window === 'undefined') return;
    const confirmed = window.confirm(
      'Möchtest du wirklich alle gespeicherten Klausur- und Ergebnisdaten löschen?',
    );

    if (!confirmed) return;

    RESET_KEYS.forEach((key) => localStorage.removeItem(key));
    onReset?.();
  };

  return (
    <button
      onClick={handleReset}
      className={`secondary-button secondary-button-danger ${className ?? ''}`}
      >
      {label}
    </button>
  );
}
