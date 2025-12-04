import React, { useState, useEffect, useMemo } from 'react';

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

  // Filtres utilisés par le panneau de filtres + backend
  const [filters, setFilters] = useState({
    dateRange: 'current-week',
    startDate: '',
    endDate: '',
    collaborateur: '',
    project: '',
    category: '',
    searchTerm: '',
  });

  // Chargement des saisies depuis Supabase en fonction des filtres (sauf searchTerm)
  const loadTimeEntries = async () => {
    try {
      setLoading(true);
      const filterParams = {};

      if (filters?.startDate) filterParams.startDate = filters.startDate;
      if (filters?.endDate) filterParams.endDate = filters.endDate;
      if (filters?.collaborateur)
        filterParams.collaborateurId = filters.collaborateur;
      if (filters?.project) filterParams.projetId = filters.project;
      if (filters?.category) filterParams.categorieId = filters.category;

      const data = await saisieTempsService?.getAll(filterParams);
      setTimeEntries(data || []);
      setError('');
    } catch (err) {
      console.error('Error loading time entries:', err);
      setError(err?.message || 'Erreur lors du chargement des saisies');
    } finally {
      setLoading(false);
    }
  };

  // Appel du chargement quand l’auth est prête ou que les filtres changent
  useEffect(() => {
    if (!authLoading) {
      loadTimeEntries();
    }
  }, [authLoading, filters]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  /**
   * ✅ Liste utilisée pour l’EXPORT
   * On part des timeEntries déjà filtrées par le backend (dates, collaborateur, projet, catégorie)
   * et on applique ici le filtre de recherche (searchTerm) comme dans le tableau.
   */
  const filteredEntriesForExport = useMemo(() => {
    let result = [...(timeEntries || [])];

    if (filters?.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      result = result.filter((entry) => {
        const text = [
          entry?.collaborateur?.nomComplet,
          entry?.projet?.nom,
          entry?.categorie?.nom,
          entry?.commentaire,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return text.includes(search);
      });
    }

    return result;
  }, [timeEntries, filters]);

  // Vérification du rôle
  const isAdmin = userProfile?.role === 'admin';

  // Rediriger les non-admin vers leurs saisies perso
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      window.location.href = '/personal-time-entries';
    }
  }, [authLoading, isAdmin]);

  // État de chargement
  if (authLoading || loading) {
    return (
      <>
        <NavigationHeader />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Chargement du tableau de bord équipe…
            </p>
          </div>
        </div>
      </>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <>
        <NavigationHeader />
        <div className="min-h-screen bg-background">
          <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="text-center max-w-md bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-semibold text-destructive mb-2">
                Erreur
              </h2>
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
      </>
    );
  }

  return (
    <>
      <NavigationHeader />
      <div className="min-h-screen bg-background p-6">
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* En-tête page */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">
                    Tableau de bord équipe
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Analyse des heures et des coûts pour l&apos;ensemble de
                    l&apos;équipe.
                  </p>
                </div>
                <div className="hidden sm:flex flex-col items-end space-y-1">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    Rôle : Administrateur
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Dernière mise à jour :{' '}
                    {new Date()?.toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Cartes de statistiques (basées sur toutes les entrées chargées) */}
            <TeamStatsCards timeEntries={timeEntries} />

            {/* Graphiques (basés sur toutes les entrées chargées) */}
            <TeamChartsPanel timeEntries={timeEntries} />

            {/* Panneau de filtres */}
            <TeamFiltersPanel
              onFiltersChange={handleFiltersChange}
              timeEntries={timeEntries}
            />

            {/* Contrôles d’export – ✅ on lui passe la liste filtrée pour l’export */}
            <div className="mb-6">
              <ExportControls
                timeEntries={filteredEntriesForExport}
                filters={filters}
              />
            </div>

            {/* Tableau détaillé – il applique déjà searchTerm de son côté */}
            <TeamTimeEntriesTable timeEntries={timeEntries} filters={filters} />
          </div>
        </main>
      </div>
    </>
  );
};

export default TeamDashboard;
