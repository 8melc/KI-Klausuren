import React from 'react';

interface StatsCardProps {
  icon: string;
  label: string;
  value: number | string;
  subtext?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  icon, 
  label, 
  value, 
  subtext
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
      <div className="flex items-center gap-4">
        {/* Icon Circle */}
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
          <div className="text-xl">{icon}</div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
          {subtext && <p className="text-sm text-slate-600 mt-1">{subtext}</p>}
        </div>
      </div>
    </div>
  );
};

interface StatsOverviewProps {
  totalCorrections: number;
  thisWeek: number;
  completed: number;
  inProgress: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalCorrections,
  thisWeek,
  completed,
  inProgress,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard 
        icon="📊" 
        label="Gesamt korrigiert" 
        value={totalCorrections}
        subtext="Alle Klausuren"
      />
      <StatsCard 
        icon="⏱️" 
        label="Diese Woche" 
        value={thisWeek}
        subtext="Letzte 7 Tage"
      />
      <StatsCard 
        icon="✅" 
        label="Abgeschlossen" 
        value={completed}
        subtext="Fertig korrigiert"
      />
      <StatsCard 
        icon="📝" 
        label="In Bearbeitung" 
        value={inProgress}
        subtext="Läuft aktuell"
      />
    </div>
  );
};
