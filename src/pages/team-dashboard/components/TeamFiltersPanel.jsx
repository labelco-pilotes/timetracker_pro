import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

/**
 * Panneau de filtres
 * - filtre par période (date de début / date de fin)
 * - filtre par collaborateur, projet, catégorie
 * - recherche plein texte
 */
const TeamFiltersPanel = ({ timeEntries = [], filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState(filters || {});

  useEffect(() => {
    setLocalFilters(filters || {});
  }, [filters]);

  // Options dérivées des données réelles
  const collaboratorOptions = React.useMemo(() => {
    const map = new Map();
    timeEntries?.forEach((e) => {
      if (e?.collaborateur) {
        map.set(e.collaborateurId, e.collaborateur.nomComplet || e.collaborateur.email);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [timeEntries]);

  const projectOptions = React.useMemo(() => {
    const map = new Map();
    timeEntries?.forEach((e) => {
      if (e?.projet) {
        map.set(e.projetId, e.projet.nom || 'Projet sans nom');
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [timeEntries]);

  const categoryOptions = React.useMemo(() => {
    const map = new Map();
    timeEntries?.forEach((e) => {
      if (e?.categorie) {
        map.set(e.categorieId, e.categorie.nom || 'Catégorie sans nom');
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [timeEntries]);

  const handleChange = (field, value) => {
    const next = {
      ...localFilters,
      [field]: value || '',
    };
    setLocalFilters(next);
    onFiltersChange?.(next);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={18} className="text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Filtres
            </p>
            <p className="text-xs text-muted-foreground">
              Affiche uniquement les saisies correspondant à ces critères.
            </p>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          type="date"
          label="Date de début"
          value={localFilters.startDate || ''}
          onChange={(e) => handleChange('startDate', e.target.value)}
        />
        <Input
          type="date"
          label="Date de fin"
          value={localFilters.endDate || ''}
          onChange={(e) => handleChange('endDate', e.target.value)}
        />
      </div>

      {/* Collaborateur / Projet / Catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select
          label="Collaborateur"
          placeholder="Tous"
          value={localFilters.collaboratorId || ''}
          onChange={(v) => handleChange('collaboratorId', v)}
          options={[
            { value: '', label: 'Tous les collaborateurs' },
            ...collaboratorOptions,
          ]}
        />
        <Select
          label="Projet"
          placeholder="Tous"
          value={localFilters.projectId || ''}
          onChange={(v) => handleChange('projectId', v)}
          options={[
            { value: '', label: 'Tous les projets' },
            ...projectOptions,
          ]}
        />
        <Select
          label="Catégorie"
          placeholder="Toutes"
          value={localFilters.categoryId || ''}
          onChange={(v) => handleChange('categoryId', v)}
          options={[
            { value: '', label: 'Toutes les catégories' },
            ...categoryOptions,
          ]}
        />
      </div>

      {/* Recherche plein texte */}
      <Input
        label="Recherche"
        type="search"
        placeholder="Rechercher dans les commentaires, projets, catégories…"
        value={localFilters.searchTerm || ''}
        onChange={(e) => handleChange('searchTerm', e.target.value)}
      />
    </div>
  );
};

export default TeamFiltersPanel;
