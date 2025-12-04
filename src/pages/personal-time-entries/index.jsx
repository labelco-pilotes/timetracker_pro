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
import { useAuth } from '../../contexts/AuthContext';
import { projetService } from '../../services/projetService';
import { categorieService } from '../../services/categorieService';
import ProjectSelector from '../time-entry-creation/components/ProjectSelector';
import CategorySelector from '../time-entry-creation/components/CategorySelector';

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

  // Données pour l'édition des saisies (projet / catégorie)
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({
    projetId: null,
    categorieId: null,
    dureeHeures: '',
    commentaire: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

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

  // Chargement des projets et catégories pour le formulaire d'édition
  useEffect(() => {
    const loadMeta = async () => {
      if (!user) return;
      try {
        const [proj, cats] = await Promise.all([
          projetService?.getAll?.(),
          categorieService?.getAll?.()
        ]);
        setProjects(proj || []);
        setCategories(cats || []);
      } catch (error) {
        console.error('Error loading projects/categories:', error);
      }
    };

    loadMeta();
  }, [user]);

  // Filter entries based on active filters
  const getFilteredEntries = () => {
    let filtered = [...timeEntries];

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters?.search?.toLowerCase();
      filtered = filtered?.filter(entry =>
        entry?.project?.toLowerCase()?.includes(searchLower) ||
        entry?.category?.toLowerCase()?.includes(searchLower) ||
        (entry?.comment && entry?.comment?.toLowerCase()?.includes(searchLower))
      );
    }

    // Apply project filter
    if (filters?.project !== 'all') {
      filtered = filtered?.filter(entry => entry?.project === filters?.project);
    }

    // Apply category filter
    if (filters?.category !== 'all') {
      filtered = filtered?.filter(entry => entry?.category === filters?.category);
    }

    // Apply date range filter
    if (filters?.dateRange?.start || filters?.dateRange?.end) {
      filtered = filtered?.filter(entry => {
        const entryDate = new Date(entry?.date);
        const startDate = filters?.dateRange?.start ? new Date(filters?.dateRange?.start) : null;
        const endDate = filters?.dateRange?.end ? new Date(filters?.dateRange?.end) : null;

        if (startDate && entryDate < startDate) return false;
        if (endDate && entryDate > endDate) return false;

        return true;
      });
    }

    // Apply quick filters (week, month, etc.)
    if (activeQuickFilter !== 'custom') {
      const today = new Date();
      const currentDay = today.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const currentMonday = new Date(today);
      currentMonday.setDate(today.getDate() + mondayOffset);
      const currentSunday = new Date(currentMonday);
      currentSunday.setDate(currentMonday.getDate() + 6);

      switch (activeQuickFilter) {
        case 'current-week':
          filtered = filtered?.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= currentMonday && entryDate <= currentSunday;
          });
          break;

        case 'previous-week':
          const previousMonday = new Date(today);
          previousMonday.setDate(today.getDate() + mondayOffset - 7);
          const previousSunday = new Date(previousMonday);
          previousSunday.setDate(previousMonday.getDate() + 6);

          filtered = filtered?.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= previousMonday && entryDate <= previousSunday;
          });
          break;

        case 'current-month':
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          filtered = filtered?.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= firstDayOfMonth && entryDate <= today;
          });
          break;

        case 'last-30-days':
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(today.getDate() - 30);
          filtered = filtered?.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= thirtyDaysAgo && entryDate <= today;
          });
          break;

        default:
          break;
      }
    }

    return filtered;
  };

  const filteredEntries = getFilteredEntries();

  const handleToggleFilterPanel = () => {
    setFilterPanelCollapsed(prev => !prev);
  };

  const handleQuickFilterChange = (filterKey) => {
    setActiveQuickFilter(filterKey);

    if (filterKey !== 'custom') {
      setFilters(prev => ({
        ...prev,
        dateRange: {
          start: '',
          end: ''
        }
      }));
    }
  };

  const handleFiltersChange = (updatedFilters) => {
    setFilters(prev => ({
      ...prev,
      ...updatedFilters
    }));

    if (updatedFilters?.dateRange) {
      setActiveQuickFilter('custom');
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  };

  const handleEditEntry = (entry) => {
    if (!entry) return;
    setEditError(null);
    setEditingEntry(entry);
    setEditForm({
      projetId: entry?.projectId || null,
      categorieId: entry?.categoryId || null,
      dureeHeures: entry?.duration ?? 0,
      commentaire: entry?.comment || ''
    });
  };

  const handleEditFieldChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    setSavingEdit(true);
    setEditError(null);

    try {
      const updates = {
        projetId: editForm?.projetId || null,
        categorieId: editForm?.categorieId || null,
        dureeHeures: editForm?.dureeHeures !== '' ? Number(editForm?.dureeHeures) : undefined,
        commentaire: editForm?.commentaire ?? undefined
      };

      const updated = await saisieTempsService?.update?.(editingEntry?.id, updates);

      setTimeEntries(prev =>
        prev?.map(entry =>
          entry?.id === editingEntry?.id
            ? {
                ...entry,
                projectId: updated?.projetId ?? updates?.projetId ?? entry?.projectId,
                project:
                  updated?.projet?.nom ||
                  projects?.find(p => p?.id === (updates?.projetId ?? updated?.projetId))?.nom ||
                  entry?.project,
                categoryId: updated?.categorieId ?? updates?.categorieId ?? entry?.categoryId,
                category:
                  updated?.categorie?.nom ||
                  categories?.find(c => c?.id === (updates?.categorieId ?? updated?.categorieId))?.nom ||
                  entry?.category,
                duration: updates?.dureeHeures ?? entry?.duration,
                comment: updates?.commentaire ?? entry?.comment
              }
            : entry
        )
      );

      setEditingEntry(null);
    } catch (error) {
      console.error('Error updating time entry:', error);
      setEditError(`Erreur lors de la mise à jour de la saisie: ${error?.message || 'Veuillez réessayer.'}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditError(null);
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
    // Ici tu pourras plus tard naviguer vers le formulaire de création pré-rempli
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
          <div className="max-w-md w-full bg-card rounded-lg border border-border p-6 text-center">
            <Icon name="AlertTriangle" size={48} className="text-error mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Une erreur est survenue</h1>
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <Button onClick={() => window.location.reload()} variant="default">
              Réessayer
            </Button>
          </div>
        </div>
      </>
    );
  }

  const totalDuration = filteredEntries?.reduce((sum, entry) => sum + (entry?.duration || 0), 0);

  return (
    <>
      <NavigationHeader />
      <div className="min-h-screen bg-background pt-20 pb-8 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 lg:flex-row">
          {/* Filter Panel (Sidebar) */}
          <div className={`w-full lg:w-80 flex-shrink-0 mb-4 lg:mb-0 ${filterPanelCollapsed ? 'lg:w-16' : ''}`}>
            <FilterPanel
              collapsed={filterPanelCollapsed}
              onToggleCollapsed={handleToggleFilterPanel}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              quickFilter={activeQuickFilter}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mr-1">
                    <Icon name="Clock" size={18} />
                  </span>
                  <h1 className="text-xl font-semibold text-foreground">
                    Mes saisies de temps
                  </h1>
                </div>
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

            {/* Quick Filters & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 items-start">
              <QuickFilters
                activeFilter={activeQuickFilter}
                onFilterChange={handleQuickFilterChange}
                totalDuration={totalDuration}
              />
              <TimeEntrySummary
                entries={filteredEntries}
                totalDuration={totalDuration}
              />
            </div>

            {/* Search Bar */}
            <div className="bg-card rounded-lg border border-border px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                <Icon name="Search" size={18} className="text-muted-foreground" />
                <Input
                  placeholder="Rechercher par projet, catégorie ou commentaire..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="hidden sm:inline-block">Saisies affichées :</span>
                <span className="font-medium text-foreground">{filteredEntries?.length}</span>
              </div>
            </div>

            {/* Time Entries Table */}
            <TimeEntryTable
              entries={filteredEntries}
              onEdit={handleEditEntry}
              onDelete={handleDeleteEntry}
              onDuplicate={handleDuplicateEntry}
            />

            {/* Modal d'édition d'une saisie (pour associer projet et catégorie) */}
            {editingEntry && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-card rounded-lg shadow-lg border border-border w-full max-w-lg mx-4">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Modifier la saisie</h2>
                    <button
                      onClick={handleCancelEdit}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Icon name="X" size={18} />
                    </button>
                  </div>
                  <div className="px-6 py-4 space-y-4">
                    {editError && (
                      <div className="rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
                        {editError}
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                      <p>
                        Date :{' '}
                        <span className="font-medium">
                          {new Date(editingEntry?.date)?.toLocaleDateString('fr-FR')}
                        </span>
                      </p>
                    </div>

                    <ProjectSelector
                      projects={projects}
                      selectedProject={editForm?.projetId}
                      onProjectChange={(value) => {
                        handleEditFieldChange('projetId', value);
                        handleEditFieldChange('categorieId', null);
                      }}
                      error={null}
                      loading={projects?.length === 0}
                    />

                    <CategorySelector
                      categories={categories}
                      selectedProject={editForm?.projetId}
                      selectedCategory={editForm?.categorieId}
                      onCategoryChange={(value) => handleEditFieldChange('categorieId', value)}
                      error={null}
                    />

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-foreground">
                        Durée (heures)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.25"
                        value={editForm?.dureeHeures}
                        onChange={(e) => handleEditFieldChange('dureeHeures', e.target.value)}
                        placeholder="Ex : 1.5 pour 1h30"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-foreground">
                        Commentaire
                      </label>
                      <textarea
                        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={editForm?.commentaire}
                        onChange={(e) => handleEditFieldChange('commentaire', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-border flex justify-end space-x-2 bg-muted/40">
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={savingEdit}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleSaveEdit}
                      disabled={savingEdit}
                    >
                      {savingEdit ? (
                        <>
                          <Icon name="Loader" size={16} className="animate-spin mr-2" />
                          Sauvegarde...
                        </>
                      ) : (
                        'Enregistrer'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
