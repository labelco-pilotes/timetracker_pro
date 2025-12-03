import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const ProjectFilters = ({ 
  filters, 
  onFilterChange, 
  onResetFilters,
  projectCount 
}) => {
  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'active', label: 'Actifs uniquement' },
    { value: 'inactive', label: 'Inactifs uniquement' }
  ];

  const clientOptions = [
    { value: 'all', label: 'Tous les clients' },
    { value: 'TechCorp Solutions', label: 'TechCorp Solutions' },
    { value: 'Digital Innovations', label: 'Digital Innovations' },
    { value: 'StartupXYZ', label: 'StartupXYZ' },
    { value: 'Enterprise Global', label: 'Enterprise Global' },
    { value: 'Creative Agency', label: 'Creative Agency' }
  ];

  const referentOptions = [
    { value: 'all', label: 'Tous les référents' },
    { value: 'Marie Dubois', label: 'Marie Dubois' },
    { value: 'Jean Martin', label: 'Jean Martin' },
    { value: 'Sophie Laurent', label: 'Sophie Laurent' },
    { value: 'Pierre Durand', label: 'Pierre Durand' },
    { value: 'Emma Moreau', label: 'Emma Moreau' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Toutes les dates' },
    { value: 'today', label: "Aujourd\'hui" },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' }
  ];

  const hasActiveFilters = () => {
    return filters?.status !== 'all' || 
           filters?.client !== 'all' || 
           filters?.referent !== 'all' || 
           filters?.dateRange !== 'all' ||
           filters?.minHours !== '' ||
           filters?.maxHours !== '';
  };

  return (
    <div className="bg-card rounded-lg border border-border card-shadow p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Filtres avancés</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            {projectCount} projet{projectCount !== 1 ? 's' : ''}
          </span>
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-xs"
            >
              <Icon name="X" size={14} />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>
      {/* Filters */}
      <div className="grid grid-cols-1 gap-3">
        {/* Status Filter */}
        <Select
          label="Statut"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => onFilterChange('status', value)}
        />

        {/* Client Filter */}
        <Select
          label="Client"
          options={clientOptions}
          value={filters?.client}
          onChange={(value) => onFilterChange('client', value)}
          searchable
        />

        {/* Referent Filter */}
        <Select
          label="Référent"
          options={referentOptions}
          value={filters?.referent}
          onChange={(value) => onFilterChange('referent', value)}
        />

        {/* Date Range Filter */}
        <Select
          label="Période de création"
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => onFilterChange('dateRange', value)}
        />

        {/* Hours Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Plage d'heures</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters?.minHours}
              onChange={(e) => onFilterChange('minHours', e?.target?.value)}
              min="0"
              step="0.5"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters?.maxHours}
              onChange={(e) => onFilterChange('maxHours', e?.target?.value)}
              min="0"
              step="0.5"
            />
          </div>
        </div>
      </div>
      {/* Quick Filters */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Filtres rapides</label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters?.status === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('status', filters?.status === 'active' ? 'all' : 'active')}
          >
            <Icon name="Play" size={14} />
            Projets actifs
          </Button>
          <Button
            variant={filters?.dateRange === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('dateRange', filters?.dateRange === 'month' ? 'all' : 'month')}
          >
            <Icon name="Calendar" size={14} />
            Ce mois
          </Button>
          <Button
            variant={filters?.client === 'TechCorp Solutions' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('client', filters?.client === 'TechCorp Solutions' ? 'all' : 'TechCorp Solutions')}
          >
            <Icon name="Building" size={14} />
            TechCorp
          </Button>
        </div>
      </div>
      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="pt-3 border-t border-border">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Filter" size={14} className="text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Filtres actifs :</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {filters?.status !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                Statut: {statusOptions?.find(opt => opt?.value === filters?.status)?.label}
              </span>
            )}
            {filters?.client !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-accent/10 text-accent text-xs rounded-md">
                Client: {clientOptions?.find(opt => opt?.value === filters?.client)?.label}
              </span>
            )}
            {filters?.referent !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 bg-success/10 text-success text-xs rounded-md">
                Référent: {referentOptions?.find(opt => opt?.value === filters?.referent)?.label}
              </span>
            )}
            {(filters?.minHours !== '' || filters?.maxHours !== '') && (
              <span className="inline-flex items-center px-2 py-1 bg-warning/10 text-warning text-xs rounded-md">
                Heures: {filters?.minHours || '0'} - {filters?.maxHours || '∞'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFilters;