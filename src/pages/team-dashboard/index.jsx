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

  // Filtres utilisés par le tableau + export
  const [filters, setFilters] = useState({
    dateRange: 'current-week',
    startDate: '',
    endDate: '',
    collaborator: '',
    project: '',
    category: '',
    searchTerm: '',
  });

  // Charger les vraies données depuis Supabase
  useEffect(() => {
    if (authLoading) return;

    // Sécurité : réservé aux admins
    if (!userProfile || userProfile?.role !== 'admin') {
      setError("Vous n’avez pas les droits pour accéder à ce tableau de bord.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        // Pour l’instant : on récupère toutes les saisies
        // (les filtres sont appliqués côté front dans les composants)
        const entries = await saisieTempsService.getAll({});
        setTimeEntries(entries || []);
      } catch (err) {
        console.error('Erreur chargement saisies équipe', err);
        setError(
          "Erreur lors du chargement des saisies de l’équipe. Merci de réessayer."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, userProfile]);

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);
  };

  // État de chargement auth
  if (authLoading) {
    return (
      <>
        <NavigationHeader />
        <div className="min-h-screen bg-background p-6">
          <main className="pt-16 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Chargement de vos informations…
            </p>
          </main>
        </div>
      </>
    );
  }

  // Erreur / pas admin
  if (error) {
    return (
      <>
        <NavigationHeader />
        <div className="min-h-screen bg-background p-6">
          <main className="pt-16 flex items-center justify-center">
            <div className="max-w-md bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-sm text-destructive mb-2">{error}</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <NavigationHeader />
      <div className="min-h-screen bg-background p-6">
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">
                    Tableau de bord équipe
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visualisez les heures, les coûts estimés et la répartition par
                    projet / collaborateur / catégorie à partir des vraies saisies.
                  </p>
                </div>
              </div>
            </div>

            {/* Filtres + export */}
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4 mb-6">
              <TeamFiltersPanel
                timeEntries={timeEntries}
                onFiltersChange={handleFiltersChange}
              />
              <ExportControls timeEntries={timeEntries} filters={filters} />
            </div>

            {/* Stats & graphiques (alimentés par les vraies données) */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)] gap-6 mb-8">
              <TeamStatsCards timeEntries={timeEntries} />
              <TeamChartsPanel timeEntries={timeEntries} />
            </div>

            {/* Tableau détaillé */}
            <TeamTimeEntriesTable timeEntries={timeEntries} filters={filters} />
          </div>
        </main>
      </div>
    </>
  );
};

export default TeamDashboard;
