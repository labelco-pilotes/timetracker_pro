import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const ProjectSelector = ({ selectedProject, onProjectSelect, onCreateProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Mock project data with category counts
  const projects = [
    {
      id: 1,
      name: "Site E-commerce Luxe",
      client: "Boutique Premium",
      status: "active",
      categoryCount: 12,
      totalHours: 245.5,
      referent: "Marie Dubois",
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Application Mobile Banking",
      client: "Banque Digitale",
      status: "active",
      categoryCount: 8,
      totalHours: 189.25,
      referent: "Pierre Martin",
      createdAt: "2024-02-20"
    },
    {
      id: 3,
      name: "Plateforme CRM Interne",
      client: "Entreprise Tech",
      status: "active",
      categoryCount: 15,
      totalHours: 312.75,
      referent: "Sophie Laurent",
      createdAt: "2024-01-08"
    },
    {
      id: 4,
      name: "Site Vitrine Corporate",
      client: "Cabinet Conseil",
      status: "inactive",
      categoryCount: 6,
      totalHours: 98.5,
      referent: "Jean Dupont",
      createdAt: "2023-11-12"
    },
    {
      id: 5,
      name: "API Microservices",
      client: "Startup Innovation",
      status: "active",
      categoryCount: 10,
      totalHours: 156.0,
      referent: "Marie Dubois",
      createdAt: "2024-03-05"
    }
  ];

  const filteredProjects = projects?.filter(project =>
    project?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    project?.client?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const handleCreateProject = () => {
    if (newProjectName?.trim()) {
      onCreateProject({
        name: newProjectName,
        client: "Nouveau Client",
        status: "active",
        categoryCount: 0,
        totalHours: 0,
        referent: "Marie Dubois"
      });
      setNewProjectName('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Projets</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
            iconName="Plus"
            iconPosition="left"
          >
            Nouveau
          </Button>
        </div>

        {/* Search */}
        <Input
          type="search"
          placeholder="Rechercher un projet..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e?.target?.value)}
          className="mb-3"
        />

        {/* Create Project Form */}
        {showCreateForm && (
          <div className="p-3 bg-muted rounded-md mb-3">
            <Input
              label="Nom du projet"
              placeholder="Entrez le nom du projet"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e?.target?.value)}
              className="mb-3"
            />
            <div className="flex space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleCreateProject}
                disabled={!newProjectName?.trim()}
              >
                Créer
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewProjectName('');
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Project List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {filteredProjects?.map((project) => (
            <div
              key={project?.id}
              onClick={() => onProjectSelect(project)}
              className={`p-3 rounded-md cursor-pointer nav-transition ${
                selectedProject?.id === project?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className={`text-sm font-medium truncate ${
                      selectedProject?.id === project?.id ? 'text-primary-foreground' : 'text-foreground'
                    }`}>
                      {project?.name}
                    </h3>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                      project?.status === 'active'
                        ? selectedProject?.id === project?.id
                          ? 'bg-success text-success-foreground'
                          : 'bg-success text-success-foreground'
                        : selectedProject?.id === project?.id
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {project?.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  
                  <p className={`text-xs truncate mb-2 ${
                    selectedProject?.id === project?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                  }`}>
                    {project?.client}
                  </p>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className={`flex items-center space-x-1 ${
                        selectedProject?.id === project?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        <Icon name="Tags" size={12} />
                        <span>{project?.categoryCount} cat.</span>
                      </span>
                      <span className={`flex items-center space-x-1 ${
                        selectedProject?.id === project?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        <Icon name="Clock" size={12} />
                        <span>{project?.totalHours}h</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects?.length === 0 && (
          <div className="p-8 text-center">
            <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucun projet trouvé</p>
          </div>
        )}
      </div>
      {/* Footer Stats */}
      <div className="p-4 border-t border-border bg-muted/50">
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Total projets:</span>
            <span className="font-medium">{projects?.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Projets actifs:</span>
            <span className="font-medium text-success">
              {projects?.filter(p => p?.status === 'active')?.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSelector;