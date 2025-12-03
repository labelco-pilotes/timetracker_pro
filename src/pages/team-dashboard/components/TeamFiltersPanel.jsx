import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TeamFiltersPanel = ({ onFiltersChange, timeEntries }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'current-week',
    startDate: '',
    endDate: '',
    collaborator: '',
    project: '',
    category: '',
    searchTerm: ''
  });

  // Extract unique values for filter options
  const collaborators = [...new Set(timeEntries.map(entry => entry.collaborator))]?.map(name => ({
    value: name,
    label: name
  }));

  const projects = [...new Set(timeEntries.map(entry => entry.project))]?.map(project => ({
    value: project,
    label: project
  }));

  const categories = [...new Set(timeEntries.map(entry => entry.category))]?.map(category => ({
    value: category,
    label: category
  }));

  const dateRangeOptions = [
    { value: 'current-week', label: 'Semaine actuelle' },
    { value: 'previous-week', label: 'Semaine précédente' },
    { value: 'current-month', label: 'Mois actuel' },
    { value: 'previous-month', label: 'Mois précédent' },
    { value: 'custom', label: 'Période personnalisée' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      dateRange: 'current-week',
      startDate: '',
      endDate: '',
      collaborator: '',
      project: '',
      category: '',
      searchTerm: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters?.collaborator) count++;
    if (filters?.project) count++;
    if (filters?.category) count++;
    if (filters?.searchTerm) count++;
    if (filters?.dateRange !== 'current-week') count++;
    return count;
  };

  return (
    <div className="bg-card border border-border rounded-lg mb-6 card-shadow">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="Filter" size={20} className="text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Filtres</h3>
            {getActiveFiltersCount() > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                {getActiveFiltersCount()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                iconName="X"
                iconPosition="left"
              >
                Effacer tout
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
              iconPosition="right"
            >
              {isExpanded ? 'Réduire' : 'Développer'}
            </Button>
          </div>
        </div>
      </div>
      {/* Quick Filters */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters?.dateRange === 'current-week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('dateRange', 'current-week')}
          >
            Semaine actuelle
          </Button>
          <Button
            variant={filters?.dateRange === 'previous-week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('dateRange', 'previous-week')}
          >
            Semaine précédente
          </Button>
          <Button
            variant={filters?.dateRange === 'current-month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('dateRange', 'current-month')}
          >
            Mois actuel
          </Button>
        </div>
      </div>
      {/* Advanced Filters */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Période"
              options={dateRangeOptions}
              value={filters?.dateRange}
              onChange={(value) => handleFilterChange('dateRange', value)}
            />

            <Select
              label="Collaborateur"
              options={[{ value: '', label: 'Tous les collaborateurs' }, ...collaborators]}
              value={filters?.collaborator}
              onChange={(value) => handleFilterChange('collaborator', value)}
              searchable
            />

            <Select
              label="Projet"
              options={[{ value: '', label: 'Tous les projets' }, ...projects]}
              value={filters?.project}
              onChange={(value) => handleFilterChange('project', value)}
              searchable
            />
          </div>

          {filters?.dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date de début"
                type="date"
                value={filters?.startDate}
                onChange={(e) => handleFilterChange('startDate', e?.target?.value)}
              />
              <Input
                label="Date de fin"
                type="date"
                value={filters?.endDate}
                onChange={(e) => handleFilterChange('endDate', e?.target?.value)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Catégorie"
              options={[{ value: '', label: 'Toutes les catégories' }, ...categories]}
              value={filters?.category}
              onChange={(value) => handleFilterChange('category', value)}
              searchable
            />

            <Input
              label="Recherche"
              type="search"
              placeholder="Rechercher dans les commentaires..."
              value={filters?.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e?.target?.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamFiltersPanel;