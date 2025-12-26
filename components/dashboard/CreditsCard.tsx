import Link from 'next/link';
import React from 'react';

interface CreditsCardProps {
  availableCredits: number;
  totalCredits: number; // z.B. 75 (wenn 25 verbraucht von ursprünglich 100)
  hasActiveSubscription: boolean;
}

export const CreditsCard: React.FC<CreditsCardProps> = ({ 
  availableCredits, 
  totalCredits,
  hasActiveSubscription 
}) => {
  const percentageUsed = totalCredits > 0 ? ((totalCredits - availableCredits) / totalCredits) * 100 : 0;
  const percentageAvailable = totalCredits > 0 ? (availableCredits / totalCredits) * 100 : 0;
  const isLowCredits = availableCredits <= 5;

  return (
    <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-xl p-6 shadow-2xl overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24" />
      </div>
      
      <div className="relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Verfügbare Credits</p>
            <p className="text-4xl font-bold">
              {availableCredits} <span className="text-2xl text-blue-200 font-normal">Klausuren</span>
            </p>
          </div>
          <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
            <span className="text-2xl">💳</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                isLowCredits ? 'bg-red-400' : 'bg-white'
              }`}
              style={{ width: `${percentageAvailable}%` }}
            />
          </div>
          <p className="text-xs text-blue-200 mt-2">
            {availableCredits} von {totalCredits} Credits verfügbar
          </p>
        </div>
        
        {/* Warning Banner */}
        {isLowCredits && (
          <div className="mb-6 bg-yellow-400/20 border-l-4 border-yellow-400 rounded p-3 backdrop-blur-sm">
            <p className="text-sm font-medium">
              ⚠️ Nur noch {availableCredits} Credits! Kaufe jetzt nach, um weiterzumachen.
            </p>
          </div>
        )}

        {/* Subscription Status */}
        <div className="mb-6">
          {hasActiveSubscription ? (
            <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-sm">
                ✅ <strong>Aktives Abo:</strong> Du erhältst automatisch neue Credits.
              </p>
            </div>
          ) : (
            <div className="bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-sm">
                ⚪ <strong>Kein aktives Abo</strong> – Kaufe Credits nach Bedarf.
              </p>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-2 gap-3">
          <Link 
            href="/checkout" 
            className="bg-white text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors text-center"
          >
            Credits kaufen
          </Link>
          <Link 
            href="/checkout#beta-angebot" 
            className="bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-400 transition-colors text-center"
          >
            Beta-Angebot
          </Link>
        </div>
      </div>
    </div>
  );
};
