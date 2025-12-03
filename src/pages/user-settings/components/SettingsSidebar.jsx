import React from 'react';
import { User, Lock, Settings } from 'lucide-react';
import Icon from '../../../components/AppIcon';


export function SettingsSidebar({ activeSection, setActiveSection }) {
  const sections = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'additional', label: 'Autres paramètres', icon: Settings }
  ];

  return (
    <nav className="bg-white rounded-lg shadow p-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Navigation
      </h2>
      <ul className="space-y-1">
        {sections?.map((section) => {
          const Icon = section?.icon;
          return (
            <li key={section?.id}>
              <button
                onClick={() => setActiveSection(section?.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                  activeSection === section?.id
                    ? 'bg-blue-50 text-blue-700 font-medium' :'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{section?.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}