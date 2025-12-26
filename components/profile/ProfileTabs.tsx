'use client';

import React, { useState } from 'react';
import { type LucideIcon, User as UserIcon, School as SchoolIcon, Settings as SettingsIcon } from 'lucide-react';
import { PersonalInfoTab } from './PersonalInfoTab';
import { SchoolClassesTab } from './SchoolClassesTab';
import { PreferencesTab } from './PreferencesTab';

interface Profile {
  id?: string;
  name?: string;
  school?: string;
  subjects?: string[];
  bundesland?: string;
  feedback_style?: string;
  feedback_length?: string;
  use_formal_address?: boolean;
}

interface EmailPreferences {
  correction_finished?: boolean;
  credits_low?: boolean;
  weekly_summary?: boolean;
  feature_updates?: boolean;
}

interface ProfileTabsProps {
  initialProfile: Profile | null;
  userEmail: string;
  initialEmailPreferences?: EmailPreferences | null;
}

const tabs: Array<{ id: string; label: string; icon: LucideIcon; enabled?: boolean; comingSoon?: boolean }> = [
  { id: 'personal', label: 'Mein Profil', icon: UserIcon, enabled: true },
  { id: 'school', label: 'Schule & Klassen', icon: SchoolIcon, enabled: false, comingSoon: true },
  { id: 'preferences', label: 'Präferenzen', icon: SettingsIcon, enabled: false, comingSoon: true },
];

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  initialProfile, 
  userEmail,
  initialEmailPreferences 
}) => {
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <div>
      {/* Tab Navigation */}
      <div style={{ borderBottom: '1px solid var(--color-gray-200)', marginBottom: 'var(--spacing-lg)' }}>
        <nav style={{ display: 'flex', gap: 'var(--spacing-xl)' }} aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isEnabled = tab.enabled !== false;
            const isComingSoon = tab.comingSoon === true;
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (isEnabled) {
                    setActiveTab(tab.id);
                  }
                }}
                disabled={!isEnabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  paddingTop: 'var(--spacing-md)',
                  paddingBottom: 'var(--spacing-md)',
                  paddingLeft: '4px',
                  paddingRight: '4px',
                  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  color: isEnabled 
                    ? (isActive ? 'var(--color-primary)' : 'var(--color-gray-500)')
                    : 'var(--color-gray-400)',
                  backgroundColor: 'transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: isEnabled ? 'pointer' : 'not-allowed',
                  opacity: isEnabled ? 1 : 0.6,
                  transition: 'color 0.2s, border-color 0.2s, opacity 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (isEnabled && !isActive) {
                    e.currentTarget.style.color = 'var(--color-gray-700)';
                    e.currentTarget.style.borderBottomColor = 'var(--color-gray-300)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isEnabled && !isActive) {
                    e.currentTarget.style.color = 'var(--color-gray-500)';
                    e.currentTarget.style.borderBottomColor = 'transparent';
                  }
                }}
                title={isComingSoon ? 'Bald verfügbar' : undefined}
              >
                {typeof Icon === 'function' ? (
                  <Icon style={{ width: '18px', height: '18px' }} />
                ) : null}
                <span>{tab.label}</span>
                {isComingSoon && (
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-gray-400)',
                    marginLeft: '4px',
                    fontStyle: 'italic'
                  }}>
                    (Bald verfügbar)
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: 'var(--spacing-lg)' }}>
        {activeTab === 'personal' && (
          <PersonalInfoTab initialProfile={initialProfile} userEmail={userEmail} />
        )}
        {/* Schule & Klassen Tab - Code bleibt erhalten, aber nicht sichtbar wenn disabled */}
        {activeTab === 'school' && tabs.find(t => t.id === 'school')?.enabled !== false && (
          <SchoolClassesTab />
        )}
        {/* Präferenzen Tab - Code bleibt erhalten, aber nicht sichtbar wenn disabled */}
        {activeTab === 'preferences' && tabs.find(t => t.id === 'preferences')?.enabled !== false && (
          <PreferencesTab 
            initialProfile={initialProfile}
            initialEmailPreferences={initialEmailPreferences}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileTabs;
