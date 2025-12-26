'use client';

import React, { useState, FormEvent } from 'react';

interface Profile {
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

interface PreferencesTabProps {
  initialProfile: Profile | null;
  initialEmailPreferences?: EmailPreferences | null;
}

export const PreferencesTab: React.FC<PreferencesTabProps> = ({ 
  initialProfile,
  initialEmailPreferences 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    feedback_style: initialProfile?.feedback_style || 'balanced',
    feedback_length: initialProfile?.feedback_length || 'medium',
    use_formal_address: initialProfile?.use_formal_address || false,
    email_correction_finished: initialEmailPreferences?.correction_finished ?? true,
    email_credits_low: initialEmailPreferences?.credits_low ?? true,
    email_weekly_summary: initialEmailPreferences?.weekly_summary ?? false,
    email_feature_updates: initialEmailPreferences?.feature_updates ?? false,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/profile/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      // Optional: Show success message
      alert('Präferenzen gespeichert!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Fehler beim Speichern. Bitte versuche es erneut.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-6">Feedback-Präferenzen</h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {/* Feedback-Stil */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Feedback-Stil
            </label>
            <div className="space-y-2">
              {[
                { value: 'motivating', label: 'Motivierend & ermutigend' },
                { value: 'direct', label: 'Sachlich & direkt' },
                { value: 'balanced', label: 'Ausgewogen (Standard)' },
              ].map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="feedback_style"
                    value={option.value}
                    checked={formData.feedback_style === option.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, feedback_style: e.target.value }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Feedback-Länge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Feedback-Länge
            </label>
            <div className="space-y-2">
              {[
                { value: 'short', label: 'Kurz (1-2 Sätze)' },
                { value: 'medium', label: 'Mittel (3-4 Sätze) - Standard' },
                { value: 'long', label: 'Ausführlich (5+ Sätze)' },
              ].map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="feedback_length"
                    value={option.value}
                    checked={formData.feedback_length === option.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, feedback_length: e.target.value }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Duzen/Siezen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sprache & Ansprache
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="address_style"
                  checked={!formData.use_formal_address}
                  onChange={() => setFormData(prev => ({ ...prev, use_formal_address: false }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Duzen ("Du hast...")</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="address_style"
                  checked={formData.use_formal_address}
                  onChange={() => setFormData(prev => ({ ...prev, use_formal_address: true }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Siezen ("Du hast...")</span>
              </label>
            </div>
          </div>

          {/* E-Mail-Benachrichtigungen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              E-Mail-Benachrichtigungen
            </label>
            <div className="space-y-2">
              {[
                { key: 'email_correction_finished', label: 'Korrektur fertig' },
                { key: 'email_credits_low', label: 'Credits niedrig (< 5)' },
                { key: 'email_weekly_summary', label: 'Wöchentliche Zusammenfassung' },
                { key: 'email_feature_updates', label: 'Neue Features & Updates' },
              ].map(option => (
                <label
                  key={option.key}
                  className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData[option.key as keyof typeof formData] as boolean}
                    onChange={(e) => setFormData(prev => ({ ...prev, [option.key]: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            type="submit"
            className="primary-button"
            disabled={isSaving}
          >
            {isSaving ? 'Speichern...' : 'Präferenzen speichern'}
          </button>
        </div>
      </form>
    </div>
  );
};
