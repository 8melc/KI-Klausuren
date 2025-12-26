'use client';

import React from 'react';

export const SchoolClassesTab: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Meine Klassen</h2>
        <button className="primary-button text-sm">
          + Neue Klasse hinzufügen
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">9a (Biologie)</h3>
              <p className="text-sm text-gray-600">23 Schüler</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">✏️</button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">10b (Chemie)</h3>
              <p className="text-sm text-gray-600">27 Schüler</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">✏️</button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="font-semibold mb-4">Standard-Erwartungshorizonte</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm">Biologie 9. Klasse</span>
            <button className="text-blue-600 hover:text-blue-700 text-sm">↓ Herunterladen</button>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm">Chemie 10. Klasse</span>
            <button className="text-blue-600 hover:text-blue-700 text-sm">↓ Herunterladen</button>
          </div>
        </div>
        <button className="mt-4 secondary-button text-sm">
          + Vorlage hochladen
        </button>
      </div>
    </div>
  );
};
