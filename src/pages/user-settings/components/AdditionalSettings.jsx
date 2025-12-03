import React from 'react';

export function AdditionalSettings() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Autres paramètres</h2>
      
      <div className="text-gray-600">
        <p>D'autres options de réglages pourront être ajoutées ici ultérieurement.</p>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-500">
            • Préférences d'affichage
          </p>
          <p className="text-sm text-gray-500">
            • Lien de calendrier Outlook
          </p>
          <p className="text-sm text-gray-500">
            • Notifications
          </p>
        </div>
      </div>
    </div>
  );
}