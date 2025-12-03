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
        setErrorMessage(`Erreur lors du chargement des saisies: ${error?.message || 'Veuillez réessayer.'}`);
      } finally {
        setLoadingEntries(false);
      }
    };

    loadTimeEntries();
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
        const entryDate = new Date(entry.date);
        const startDate = filters?.dateRange?.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters?.dateRange?.end ? new Date(filters.dateRange.end) : null;

        if (startDate && entryDate < startDate) return false;
        if (endDate && entryDate > endDate) return false;
        return true;
      });
    }

    // Apply quick filter
    if (activeQuickFilter !== 'all') {
      const today = new Date();
      const currentDay = today?.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

      switch (activeQuickFilter) {
        case 'current-week':
          const currentMonday = new Date(today);
          currentMonday?.setDate(today?.getDate() + mondayOffset);
          const currentSunday = new Date(currentMonday);
          currentSunday?.setDate(currentMonday?.getDate() + 6);
          
          filtered = filtered?.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= currentMonday && entryDate <= currentSunday;
          });
          break;

        case 'previous-week':
          const previousMonday = new Date(today);
          previousMonday?.setDate(today?.getDate() + mondayOffset - 7);
          const previousSunday = new Date(previousMonday);
          previousSunday?.setDate(previousMonday?.getDate() + 6);
          
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
          thirtyDaysAgo?.setDate(today?.getDate() - 30);
          filtered = filtered?.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= thirtyDaysAgo && entryDate <= today;
          });
          break;
      }
    }

    return filtered?.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const filteredEntries = getFilteredEntries();

  // Handle keyboard shortcuts
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

  const handleEditEntry = (entry) => {
    // Navigate to edit form with entry data
    console.log('Edit entry:', entry);
    // In real app: navigate to edit page with entry ID
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
    // Navigate to creation form with pre-filled data
    console.log('Duplicate entry:', entry);
    // In real app: navigate to creation page with entry data
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
        <div className="min-h-screen bg-background pt-20 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-error/10 border border-error/20 p-8 rounded-lg text-center space-y-4">
              <Icon name="AlertCircle" size={48} className="text-error mx-auto" />
              <h2 className="text-xl font-semibold text-error">Erreur de chargement</h2>
              <p className="text-muted-foreground">{errorMessage}</p>
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

            {/* Summary Cards */}
            <TimeEntrySummary
              entries={timeEntries}
              filteredEntries={filteredEntries}
              activeFilter={activeQuickFilter}
            />

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