import Link from 'next/link';
import React from 'react';

interface Correction {
  id: string;
  subject: string;
  grade: string;
  theme: string;
  totalWorks: number;
  completedWorks?: number;
  status: 'completed' | 'processing' | 'error' | 'pending';
  date: string; // ISO format
  errorMessage?: string;
}

const CorrectionCard: React.FC<{ correction: Correction }> = ({ correction }) => {
  const { subject, grade, theme, totalWorks, completedWorks = 0, status, date, errorMessage } = correction;
  
  const statusConfig = {
    completed: { 
      icon: '✅', 
      text: 'Bereit', 
      color: 'text-green-600 bg-green-50 border-green-200' 
    },
    processing: { 
      icon: '⏳', 
      text: 'Läuft...', 
      color: 'text-blue-600 bg-blue-50 border-blue-200' 
    },
    error: { 
      icon: '❌', 
      text: 'Fehler', 
      color: 'text-red-600 bg-red-50 border-red-200' 
    },
    pending: { 
      icon: '⏸️', 
      text: 'Wartend', 
      color: 'text-gray-600 bg-gray-50 border-gray-200' 
    }
  };

  const config = statusConfig[status];
  const progressPercentage = totalWorks > 0 ? (completedWorks / totalWorks) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {subject}{grade ? ` ${grade}` : ''}
          </h3>
          <p className="text-sm text-gray-600">
            Thema: {theme}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
          {config.icon} {config.text}
        </span>
      </div>

      {/* Info-Zeile */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <span>{totalWorks} Arbeiten</span>
        <span>•</span>
        <span>{new Date(date).toLocaleDateString('de-DE', { 
          day: '2-digit', 
          month: 'long' 
        })}</span>
      </div>

      {/* Fortschrittsbalken bei processing */}
      {status === 'processing' && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{completedWorks} von {totalWorks} Arbeiten</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Fehler-Nachricht */}
      {status === 'error' && errorMessage && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded p-3">
          <p className="text-sm text-red-700">
            ⚠️ {errorMessage}
          </p>
        </div>
      )}

      {/* Aktionen */}
      <div className="flex gap-2">
        {status === 'completed' && (
          <>
            <Link 
              href={`/results?id=${correction.id}`} 
              className="primary-button text-sm flex-1 text-center"
            >
              Details ansehen
            </Link>
            <Link 
              href={`/api/download/${correction.id}`} 
              className="secondary-button text-sm flex-1 text-center"
            >
              📥 Feedback herunterladen
            </Link>
          </>
        )}
        {status === 'processing' && (
          <button 
            disabled 
            className="secondary-button text-sm flex-1 opacity-50 cursor-not-allowed"
          >
            ⏳ Verarbeitung läuft...
          </button>
        )}
        {status === 'error' && (
          <button 
            className="primary-button text-sm flex-1"
            onClick={() => {/* TODO: Retry-Logik */}}
          >
            🔄 Erneut versuchen
          </button>
        )}
        {status === 'pending' && (
          <button 
            disabled 
            className="secondary-button text-sm flex-1 opacity-50 cursor-not-allowed"
          >
            ⏸️ Wartend
          </button>
        )}
      </div>
    </div>
  );
};

interface CorrectionsListProps {
  corrections: Correction[];
}

export const CorrectionsList: React.FC<CorrectionsListProps> = ({ corrections }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Letzte Korrekturen</h2>
        <Link href="/results" className="text-blue-600 hover:text-blue-700 font-medium">
          Zu den Ergebnissen →
        </Link>
      </div>

      {corrections.length === 0 ? (
        // Empty State
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">Noch keine Korrekturen</p>
          <p className="text-gray-400 text-sm mb-4">Starte deine erste Korrektur im Upload-Bereich.</p>
          <Link href="/correction" className="primary-button inline-block">
            Neue Korrektur starten
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {corrections.map((correction) => (
            <CorrectionCard key={correction.id} correction={correction} />
          ))}
        </div>
      )}
    </div>
  );
};






