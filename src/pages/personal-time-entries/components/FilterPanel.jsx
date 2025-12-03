import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const FilterPanel = ({ isCollapsed, onToggleCollapse, filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const projectOptions = [
    { value: 'all', label: 'Tous les projets' },
    { value: 'ecommerce-platform', label: 'Plateforme E-commerce' },
    { value: 'mobile-app', label: 'Application Mobile' },
    { value: 'website-redesign', label: 'Refonte Site Web' },
    { value: 'api-integration', label: 'Intégration API' },
    { value: 'data-migration', label: 'Migration Données' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'development', label: 'Développement' },
    { value: 'testing', label: 'Tests' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'meeting', label: 'Réunion' },
    { value: 'research', label: 'Recherche' },
    { value: 'deployment', label: 'Déploiement' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (field, value) => {
    const newDateRange = { ...localFilters?.dateRange, [field]: value };
    const newFilters = { ...localFilters, dateRange: newDateRange };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: '',
      project: 'all',
      category: 'all',
      dateRange: {
        start: '',
        end: ''
      }
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = () => {
    return localFilters?.search || 
           localFilters?.project !== 'all' || 
           localFilters?.category !== 'all' ||
           localFilters?.dateRange?.start ||
           localFilters?.dateRange?.end;
  };

  return (
    <div className={`bg-card border-r border-border sidebar-shadow layout-transition ${
      isCollapsed ? 'w-0 overflow-hidden' : 'w-80'
    }`}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Filtres</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Afficher les filtres' : 'Masquer les filtres'}
          >
            <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
          </Button>
        </div>

        {/* Search */}
        <div>
          <Input
            label="Recherche"
            type="search"
            placeholder="Projet, catégorie, commentaire..."
            value={localFilters?.search}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
          />
        </div>

        {/* Date Range */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Période</h4>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Du"
              type="date"
              value={localFilters?.dateRange?.start}
              onChange={(e) => handleDateRangeChange('start', e?.target?.value)}
            />
            <Input
              label="Au"
              type="date"
              value={localFilters?.dateRange?.end}
              onChange={(e) => handleDateRangeChange('end', e?.target?.value)}
            />
          </div>
        </div>

        {/* Project Filter */}
        <div>
          <Select
            label="Projet"
            options={projectOptions}
            value={localFilters?.project}
            onChange={(value) => handleFilterChange('project', value)}
          />
        </div>

        {/* Category Filter */}
        <div>
          <Select
            label="Catégorie"
            options={categoryOptions}
            value={localFilters?.category}
            onChange={(value) => handleFilterChange('category', value)}
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters() && (
          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full"
            >
              <Icon name="X" size={16} />
              <span className="ml-2">Effacer les filtres</span>
            </Button>
          </div>
        )}

        {/* Filter Summary */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Filtres actifs: {hasActiveFilters() ? 'Oui' : 'Aucun'}</div>
            {localFilters?.project !== 'all' && (
              <div>• Projet: {projectOptions?.find(p => p?.value === localFilters?.project)?.label}</div>
            )}
            {localFilters?.category !== 'all' && (
              <div>• Catégorie: {categoryOptions?.find(c => c?.value === localFilters?.category)?.label}</div>
            )}
            {(localFilters?.dateRange?.start || localFilters?.dateRange?.end) && (
              <div>• Période personnalisée</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;