import React, { useState, useEffect } from 'react';
import NavigationHeader from '../navigation-header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TimeEntryTable from './components/TimeEntryTable';
import FilterPanel from './components/FilterPanel';
import QuickFilters from './components/QuickFilters';
import TimeEntrySummary from './components/TimeEntrySummary';
import ExportControls from './components/ExportControls';
import { saisieTempsService } from '../../services/saisieTempsService';
import { projetService } from '../../services/projetService';
import { categorieService } from '../../services/categorieService';
import { useAuth } from '../../contexts/AuthContext';

const PersonalTimeEntries = () => {
  const { user } = useAuth();

  const [filterPanelCollapsed, setFilterPanelCollapsed] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState('current-week');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    project: 'all',
    category: 'all',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const [timeEntries, setTimeEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Édition d'une saisie
  const [editingEntry, setEditingEntry] = useState(null);
  const [projects, setProjects] = useState([]);
  const [editProjectId, setEditProjectId] = useState('');
  const [categories, setCategories] = useState([]);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editComment, setEditComment] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    const loadTimeEntries = async () => {
      if (!user) return;

      setLoadingEntries(true);
      setErrorMessage(null);

      try {
        const entries = await saisieTempsService?.getAll({
          collaborateurId: user?.id
        });

        const transformedEntries = entries?.map(entry => ({
          id: entry?.id,
          date: entry?.date,
          project: entry?.projet?.nom || 'Sans projet',
          projectId: entry?.projetId,
          projectColor: 'bg-blue-500',
          category: entry?.categorie?.nom || 'Sans catégorie',
          categoryId: entry?.categorieId,
          duration: parseFloat(entry?.dureeHeures) || 0,
          comment: entry?.commentaire || ''
        }));

        setTimeEntries(transformedEntries);
      } catch (error) {
        console.error('Error loading time entries:', error);
        setErrorMessage(
          `Erreur lors du chargement des saisies: ${error?.message || 'Veuillez réessayer.'}`
        );
      } finally {
        setLoadingEntries(false);
      }
    };

    loadTimeEntries();
  }, [user]);

  // Charger la liste des projets pour l'édition
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await projetService?.getAll();
        setProjects(data || []);
      } catch (error) {
        console.error('Error loading projects for edit:', error);
      }
    };

    loadProjects();
  }, []);

  // Charger les catégories lorsque le projet sélectionné change en édition
  useEffect(() => {
    const loadCategories = async () => {
      if (!editProjectId) {
        setCategories([]);
        setEditCategoryId('');
        return;
      }

      try {
        const data = await categorieService?.getAll(editProjectId);
        setCategories(data || []);
      } catch (error) {
        console.error('Error loading categories for edit:', error);
      }
    };

    loadCategories();
  }, [editProjectId]);

  // Filtrage des saisies
  const getFilteredEntries = () => {
    let filtered = [...timeEntries];

    // Search
    if (filters?.search) {
      const searchLower = filters?.search?.toLowerCase();
      filtered = filtered?.filter(entry =>
        entry?.project?.toLowerCase()?.includes(searchLower) ||
        entry?.category?.toLowerCase()?.includes(searchLower) ||
        (entry?.comment && entry?.comment?.toLowerCase()?.includes(searchLower))
      );
    }

    // Project filter
    if (filters?.project !== 'all') {
      filtered = filtered?.filter(entry => entry?.projectId === filters?.project);
    }

    // Category filter
    if (filters?.category !== 'all') {
      filtered = filtered?.filter(entry => entry?.categoryId === filters?.category);
    }

    // Date range filter
    if (filters?.dateRange?.start || filters?.dateRange?.end) {
      filtered = filtered?.filter(entry => {
        const entryDate = new Date(entry.date);
        const startDate = filters?.dateRange?.start ? new Date(filters?.dateRange?.start) : null;
        const endDate = filters?.dateRange?.end ? new Date(filters?.dateRange?.end) : null;

        if (startDate && entryDate < startDate) return false;
        if (endDate && entryDate > endDate) return false;
        return true;
      });
    }

    // Quick filter
    if (activeQuickFilter !== 'all') {
      const today = new Date();
      const currentDay = today?.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

      switch (activeQuickFilter) {
        case 'current-week': {
          const currentMonday = new Date(today);
          currentMonday?.setDate(today?.getDate() + mondayOffset);
          const currentSunday = new Date(currentMonday);
          currentSunday?.setDate(currentMonday?.getDate() + 6);

          filtered = filtered?.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= currentMonday && entryDate <= currentSunday;
          });
          break;
        }

        case 'previous-week': {
          const previousMonday = new Date(today);
          previousMonday?.setDate(today?.getDate() + mondayOffset - 7);
          const previousSunday = new Date(previousMonday);
          previousSunday?.setDate(previousMonday?.getDate() + 6);

          filtered = filtered?.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= previousMonday && entryDate <= previousSunday;
          });
          break;
        }

        case 'current-month': {
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          filtered = filtered?.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= firstDayOfMonth && entryDate <= today;
          });
          break;
        }

        case 'last-30-days': {
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo?.setDate(today?.getDate() - 30);
          filtered = filtered?.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= thirtyDaysAgo && entryDate <= today;
          });
          break;
        }

        default:
          break;
      }
    }

    return filtered?.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const filteredEntries = getFilteredEntries();

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event?.ctrlKey || event?.metaKey) && event?.key === 'n') {
        event?.preventDefault();
        window.location.href = '/time-entry-creation';
      }
      if ((event?.ctrlKey || event?.metaKey) && event?.key === 'f') {
        event?.preventDefault();
        setFilterPanelCollapsed(!filterPanelCollapsed);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [filterPanelCollapsed]);

  // Gestion de l’édition
  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setEditProjectId(entry?.projectId || '');
    setEditCategoryId(entry?.categoryId || '');
    setEditComment(entry?.comment || '');
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditProjectId('');
    setEditCategoryId('');
    setEditComment('');
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    setIsSavingEdit(true);
    setErrorMessage(null);

    try {
      await saisieTempsService?.update(editingEntry?.id, {
        projetId: editProjectId || null,
        categorieId: editCategoryId || null,
        commentaire: editComment || ''
      });

      // Mettre à jour la liste locale sans recharger toute la page
      setTimeEntries(prev =>
        prev?.map(e =>
          e?.id === editingEntry?.id
            ? {
                ...e,
                projectId: editProjectId || null,
                project:
                  projects?.find(p => p.id === editProjectId)?.nom || 'Sans projet',
                categoryId: editCategoryId || null,
                category:
                  categories?.find(c => c.id === editCategoryId)?.nom || 'Sans catégorie',
                comment: editComment || ''
              }
            : e
        )
      );

      handleCancelEdit();
    } catch (error) {
      console.error('Error updating entry:', error);
      setErrorMessage(
        `Erreur lors de la mise à jour de la saisie: ${error?.message || 'Veuillez réessayer.'}`
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette saisie ?')) {
      return;
    }

    try {
      await saisieTempsService?.delete(entryId);
      setTimeEntries(prev => prev?.filter(entry => entry?.id !== entryId));
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert(`Erreur lors de la suppression: ${error?.message || 'Veuillez réessayer.'}`);
    }
  };

  const handleDuplicateEntry = (entry) => {
    // TODO : naviguer vers la création avec pré-remplissage
    console.log('Duplicate entry:', entry);
  };

  if (loadingEntries) {
    return (
      <>
        <NavigationHeader />
        <div className="min-h-screen bg-background pt-20 px-4 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Loader" size={48} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement de vos saisies...</p>
          </div>
        </div>
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
        <NavigationHeader />
        <div className="min-h-screen bg-background pt-20 px-4 flex items-center justify-center">
          <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="AlertTriangle" size={24} className="text-destructive" />
              <h2 className="text-lg font-semibold text-foreground">Une erreur est survenue</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {errorMessage}
            </p>
            <div className="flex justify-end">
              <Button
                variant="default"
                onClick={() => window.location?.reload()}
                iconName="RefreshCw"
                iconPosition="left"
              >
                Réessayer
              </Button>
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
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Mes saisies de temps</h1>
                <p className="text-muted-foreground mt-1">
                  Gérez vos entrées de temps et exportez vos rapports personnels
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <ExportControls entries={timeEntries} filteredEntries={filteredEntries} />
                
                <Button
                  variant="default"
                  onClick={() => window.location.href = '/time-entry-creation'}
                  title="Nouvelle saisie (Ctrl+N)"
                >
                  <Icon name="Plus" size={16} />
                  <span className="ml-2">Nouvelle saisie</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Filter Panel */}
          <FilterPanel
            isCollapsed={filterPanelCollapsed}
            onToggleCollapse={() => setFilterPanelCollapsed(!filterPanelCollapsed)}
            filters={filters}
            onFiltersChange={setFilters}
          />

          {/* Content Area */}
          <div className="flex-1 p-6">
            {/* Bloc d’édition */}
            {editingEntry && (
              <div className="mb-6 border border-border rounded-lg p-4 bg-muted/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">
                    Modifier la saisie du {editingEntry.date}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                    Annuler
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Projet</label>
                    <select
                      className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                      value={editProjectId}
                      onChange={(e) => setEditProjectId(e.target.value)}
                    >
                      <option value="">Sans projet</option>
                      {projects?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Catégorie</label>
                    <select
                      className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      disabled={!editProjectId}
                    >
                      <option value="">Sans catégorie</option>
                      {categories?.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Commentaire</label>
                    <Input
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      placeholder="Commentaire (optionnel)"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="default"
                    onClick={handleSaveEdit}
                    disabled={isSavingEdit}
                  >
                    {isSavingEdit ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Filters */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <QuickFilters
                  activeFilter={activeQuickFilter}
                  onFilterChange={setActiveQuickFilter}
                />
                
                <div className="flex items-center space-x-3">
                  <Input
                    type="search"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e?.target?.value);
                      setFilters(prev => ({ ...prev, search: e?.target?.value }));
                    }}
                    className="w-64"
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterPanelCollapsed(!filterPanelCollapsed)}
                    title="Afficher/Masquer les filtres (Ctrl+F)"
                  >
                    <Icon name="Filter" size={16} />
                    <span className="ml-2 hidden sm:inline">Filtres</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <TimeEntrySummary entries={filteredEntries} />
            </div>

            {/* Time Entries Table */}
            <TimeEntryTable
              entries={filteredEntries}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
              onDuplicate={handleDuplicateEntry}
            />
          </div>
        </div>

        {/* Mobile Quick Action Button */}
        <Button
          variant="default"
          size="icon"
          onClick={() => window.location.href = '/time-entry-creation'}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full modal-shadow lg:hidden"
          title="Nouvelle saisie"
        >
          <Icon name="Plus" size={24} />
        </Button>
      </div>
    </>
  );
};

export default PersonalTimeEntries;
