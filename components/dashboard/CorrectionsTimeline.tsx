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

const TimelineItem: React.FC<{ 
  correction: Correction; 
  isLast: boolean;
}> = ({ correction, isLast }) => {
  const { subject, grade, theme, totalWorks, completedWorks = 0, status, date, errorMessage } = correction;
  
  const statusConfig = {
    completed: { 
      icon: '✅', 
      text: 'Bereit', 
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    processing: { 
      icon: '⏳', 
      text: 'Läuft...', 
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    error: { 
      icon: '❌', 
      text: 'Fehler', 
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    pending: { 
      icon: '⏸️', 
      text: 'Wartend', 
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-600',
      borderColor: 'border-gray-200'
    }
  };

  const config = statusConfig[status];
  const progressPercentage = totalWorks > 0 ? (completedWorks / totalWorks) * 100 : 0;
  const formattedDate = new Date(date).toLocaleDateString('de-DE', { 
    day: '2-digit', 
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex gap-4">
      {/* Timeline Line & Icon */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-lg ${config.iconColor}`}>{config.icon}</span>
        </div>
        {!isLast && <div className="w-0.5 h-full bg-gray-200 mt-2 min-h-[80px]" />}
      </div>
      
      {/* Content Card */}
      <div className="flex-1 pb-8">
        <div className={`bg-white rounded-lg p-4 shadow-sm border ${config.borderColor} hover:shadow-md transition-all`}>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {subject}{grade ? ` ${grade}` : ''}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {theme} · {totalWorks} Arbeiten
              </p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.iconColor} border ${config.borderColor}`}>
                {config.text}
              </span>
              <p className="text-xs text-gray-500 mt-2">{formattedDate}</p>
            </div>
          </div>

          {/* Progress Bar for Processing */}
          {status === 'processing' && (
            <div className="mb-3">
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

          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700">
                ⚠️ {errorMessage}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            {status === 'completed' && (
              <>
                <Link 
                  href={`/results?id=${correction.id}`} 
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Details ansehen
                </Link>
                <span className="text-gray-300">•</span>
                <Link 
                  href={`/api/download/${correction.id}`} 
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  📥 Feedback herunterladen
                </Link>
              </>
            )}
            {status === 'processing' && (
              <span className="text-sm text-gray-500 italic">
                ⏳ Verarbeitung läuft...
              </span>
            )}
            {status === 'error' && (
              <button 
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                onClick={() => {/* TODO: Retry-Logik */}}
              >
                🔄 Erneut versuchen
              </button>
            )}
            {status === 'pending' && (
              <span className="text-sm text-gray-500 italic">
                ⏸️ Wartend
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface CorrectionsTimelineProps {
  corrections: Correction[];
}

export const CorrectionsTimeline: React.FC<CorrectionsTimelineProps> = ({ corrections }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Letzte Aktivität</h2>
        <Link href="/results" className="text-blue-600 hover:text-blue-700 font-medium">
          Zu den Ergebnissen →
        </Link>
      </div>

      {corrections.length === 0 ? (
        // Empty State
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-gray-500 text-lg mb-2">Noch keine Korrekturen</p>
          <p className="text-gray-400 text-sm mb-4">Starte deine erste Korrektur im Upload-Bereich.</p>
          <Link href="/correction" className="primary-button inline-block">
            Neue Korrektur starten
          </Link>
        </div>
      ) : (
        <div className="space-y-0">
          {corrections.map((correction, index) => (
            <TimelineItem 
              key={correction.id} 
              correction={correction}
              isLast={index === corrections.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
