import React, { useState, useEffect } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import NavigationHeader from '../navigation-header';
import TeamStatsCards from './components/TeamStatsCards';
import TeamChartsPanel from './components/TeamChartsPanel';
import TeamFiltersPanel from './components/TeamFiltersPanel';
import TeamTimeEntriesTable from './components/TeamTimeEntriesTable';
import ExportControls from './components/ExportControls';
import { saisieTempsService } from '../../services/saisieTempsService';

const TeamDashboard = () => {
  const { userProfile, loading: authLoading } = useAuth();
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    dateRange: 'current-week',
    startDate: '',
    endDate: '',
    collaborateur: '',
    project: '',
    category: '',
    searchTerm: ''
  });

  // Load time entries from Supabase
  useEffect(() => {
    if (!authLoading) {
      loadTimeEntries();
    }
  }, [authLoading, filters]);

  const loadTimeEntries = async () => {
    try {
      setLoading(true);
      const filterParams = {};
      
      if (filters?.startDate) filterParams.startDate = filters?.startDate;
      if (filters?.endDate) filterParams.endDate = filters?.endDate;
      if (filters?.collaborateur) filterParams.collaborateurId = filters?.collaborateur;
      if (filters?.project) filterParams.projetId = filters?.project;
      if (filters?.category) filterParams.categorieId = filters?.category;

      const data = await saisieTempsService?.getAll(filterParams);
      setTimeEntries(data);
      setError('');
    } catch (err) {
      console.error('Error loading time entries:', err);
      setError(err?.message || 'Erreur lors du chargement des saisies');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Check user role
  const isAdmin = userProfile?.role === 'admin';

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      window.location.href = '/personal-time-entries';
    }
  }, [isAdmin, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Accès non autorisé</h2>
          <p className="text-muted-foreground">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">Erreur</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button 
              onClick={loadTimeEntries}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavigationHeader />
      <div className="min-h-screen bg-background p-6">
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Tableau de bord équipe
                  </h1>
                  <p className="text-muted-foreground">
                    Vue d'ensemble des performances et activités de l'équipe avec suivi des coûts
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground">
                    Administrateur
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Dernière mise à jour: {new Date()?.toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <TeamStatsCards timeEntries={timeEntries} />

            {/* Charts Panel */}
            <TeamChartsPanel timeEntries={timeEntries} />

            {/* Filters Panel */}
            <TeamFiltersPanel 
              onFiltersChange={handleFiltersChange}
              timeEntries={timeEntries}
            />

            {/* Export Controls */}
            <div className="mb-6">
              <ExportControls 
                timeEntries={timeEntries}
                filters={filters}
              />
            </div>

            {/* Time Entries Table */}
            <TeamTimeEntriesTable 
              timeEntries={timeEntries}
              filters={filters}
            />
          </div>
        </main>
      </div>
    </>
  );
};

export default TeamDashboard;