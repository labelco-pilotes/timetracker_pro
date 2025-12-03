import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import { ProfileSection } from './components/ProfileSection';
import { SecuritySection } from './components/SecuritySection';
import { AdditionalSettings } from './components/AdditionalSettings';
import { SettingsSidebar } from './components/SettingsSidebar';

export default function UserSettings() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, userProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login-authentication');
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Réglages - Suivi du temps</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Réglages</h1>
            <p className="mt-2 text-gray-600">
              Gérez vos informations personnelles et paramètres de compte
            </p>
          </div>

          {/* Desktop Layout: Sidebar + Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation - Desktop */}
            <div className="hidden lg:block lg:col-span-1">
              <SettingsSidebar 
                activeSection={activeSection} 
                setActiveSection={setActiveSection} 
              />
            </div>

            {/* Mobile Section Selector */}
            <div className="lg:hidden mb-6">
              <label htmlFor="section-select" className="sr-only">
                Sélectionner une section
              </label>
              <select
                id="section-select"
                value={activeSection}
                onChange={(e) => setActiveSection(e?.target?.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="profile">Profil</option>
                <option value="security">Sécurité</option>
                <option value="additional">Autres paramètres</option>
              </select>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {activeSection === 'profile' && <ProfileSection />}
              {activeSection === 'security' && <SecuritySection />}
              {activeSection === 'additional' && <AdditionalSettings />}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}