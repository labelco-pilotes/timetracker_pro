import React from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const ProjectSelector = ({ 
  projects, 
  selectedProject, 
  onProjectChange, 
  error, 
  loading = false 
}) => {
  // 🔧 FIX: Changed from project.name to project.nom (matches database schema)
  // 🔧 FIX: Removed project.client (doesn't exist in schema) - using only project name
  // 🔧 FIX: Filter to show only active projects (status='active')
  const activeProjects = projects?.filter(project => project?.status === 'active') || [];
  
  const projectOptions = activeProjects?.map(project => ({
    value: project?.id,
    label: project?.nom, // Changed from ${project.name} - ${project.client}
    description: project?.description || 'Projet actif',
    disabled: false // Active projects are always enabled
  }));

  // 🔧 FIX: Show message when no active projects exist
  const hasNoProjects = projects?.length === 0;
  const hasNoActiveProjects = activeProjects?.length === 0 && projects?.length > 0;

  return (
    <div className="space-y-2">
      <Select
        label="Projet *"
        description="Sélectionnez le projet pour cette saisie"
        placeholder={
          hasNoProjects 
            ? "Aucun projet disponible" 
            : hasNoActiveProjects 
            ? "Aucun projet actif" 
            : "Choisir un projet..."
        }
        options={projectOptions}
        value={selectedProject}
        onChange={onProjectChange}
        error={error}
        required
        searchable
        loading={loading}
        className="w-full"
        disabled={projectOptions?.length === 0}
      />
      {/* 🔧 FIX: Show helpful message when no projects available */}
      {hasNoProjects && (
        <div className="flex items-center space-x-2 text-sm text-warning">
          <Icon name="AlertTriangle" size={14} />
          <span>Aucun projet disponible. Un administrateur doit créer des projets avant de pouvoir saisir du temps.</span>
        </div>
      )}
      {hasNoActiveProjects && (
        <div className="flex items-center space-x-2 text-sm text-warning">
          <Icon name="AlertTriangle" size={14} />
          <span>Aucun projet actif disponible. Contactez un administrateur.</span>
        </div>
      )}
      {selectedProject && activeProjects?.length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Info" size={14} />
          <span>
            {activeProjects?.find(p => p?.id === selectedProject)?.description || 'Projet sélectionné'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;