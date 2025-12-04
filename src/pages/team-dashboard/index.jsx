import React, { useState, useEffect, useMemo } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import NavigationHeader from '../navigation-header';
import TeamStatsCards from './components/TeamStatsCards';
import TeamChartsPanel from './components/TeamChartsPanel';
import TeamFiltersPanel from './components/TeamFiltersPanel';
import TeamTimeEntriesTable from './components/TeamTimeEntriesTable';
import ExportControls from './components/ExportControls';
import { saisieTempsService } from '../../services/saisieTempsService';

/**
 * Tableau de bord équipe
 * - charge toutes les saisies de temps visibles pour l'admin
 * - applique les filtres côté frontend (dates, projet, collaborateur, catégorie, recherche)
 * - passe les entrées filtrées aux cartes, graphiques, tableau et export
 */
const TeamDashboard = () => {
  const { userProfile, loading: authLoading } = useAuth();

  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    collaboratorId: '',
    projectId: '',
    categoryId: '',
    searchTerm: '',
  });

  // Chargement initial des données
  useEffect(() => {
    const load = async () => {
      if (authLoading) return;
      if (!userProfile || userProfile.role !== 'admin') {
        setError("Vous n’avez pas les droits pour accéder à cette page.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const entries = await saisieTempsService.getAll({});
        setTimeEntries(entries || []);
      } catch (e) {
        console.error('[TeamDashboard] erreur lors du chargement des saisies', e);
        setError("Erreur lors du chargement des saisies de l'équipe.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authLoading, userProfile]);

  const handleFiltersChange = (nextFilters) => {
    setFilters(nextFilters);
  };

  // Application des filtres côté front
  const filteredEntries = useMemo(() => {
    return (timeEntries || []).filter((entry) => {
      if (!entry) return false;

      const entryDate = entry.date ? new Date(entry.date) : null;

      if (filters.startDate) {
        const start = new Date(filters.startDate);
        if (!entryDate || entryDate < start) return false;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (!entryDate || entryDate > end) return false;
      }

      if (filters.collaboratorId) {
        if (entry.collaborateurId !== filters.collaboratorId) return false;
      }

      if (filters.projectId) {
        if (entry.projetId !== filters.projectId) return false;
      }

      if (filters.categoryId) {
        if (entry.categorieId !== filters.categoryId) return false;
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const text = [
          entry.commentaire,
          entry.projet?.nom,
          entry.categorie?.nom,
          entry.collaborateur?.nomComplet,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!text.includes(term)) return false;
      }

      return true;
    });
  }, [timeEntries, filters]);

  if (authLoading || loading) {
    return (
      <>
        <NavigationHeader />
        <div className="min-h-screen bg-background p-6">
          <main className="pt-16 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Chargement du tableau de bord…
            </p>
          </main>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavigationHeader />
        <div className="min-h-screen bg-background p-6">
          <main className="pt-16 flex items-center justify-center">
            <div className="max-w-md bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-sm text-destructive">{error}</p>
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
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Tableau de bord équipe
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Analyse des heures et des coûts sur la période sélectionnée.
                </p>
              </div>
            </div>

            {/* Filtres + export */}
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1.2fr)] gap-4">
              <TeamFiltersPanel
                timeEntries={timeEntries}
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
              <ExportControls timeEntries={filteredEntries} />
            </div>

            {/* Stats & graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)] gap-6">
              <TeamStatsCards timeEntries={filteredEntries} />
              <TeamChartsPanel timeEntries={filteredEntries} />
            </div>

            {/* Tableau détaillé */}
            <TeamTimeEntriesTable timeEntries={filteredEntries} />
          </div>
        </main>
      </div>
    </>
  );
};

export default TeamDashboard;
