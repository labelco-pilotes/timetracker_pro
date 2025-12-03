import React, { useState, useEffect } from 'react';
import NavigationHeader from '../navigation-header';


import ProjectTable from './components/ProjectTable';
import ProjectDetailPanel from './components/ProjectDetailPanel';
import ProjectFilters from './components/ProjectFilters';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import ProjectCreateModal from './components/ProjectCreateModal';
import ProjectStatsCards from './components/ProjectStatsCards';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    client: 'all',
    referent: 'all',
    dateRange: 'all',
    minHours: '',
    maxHours: ''
  });

  // Mock projects data
  const mockProjects = [
    {
      id: 1,
      name: "Plateforme E-commerce",
      client: "TechCorp Solutions",
      referent: "Marie Dubois",
      status: "active",
      teamCount: 5,
      totalHours: 245.5,
      createdAt: "2025-10-15T10:00:00Z",
      description: "Développement d\'une plateforme e-commerce moderne avec React et Node.js"
    },
    {
      id: 2,
      name: "Application Mobile Banking",
      client: "Digital Innovations",
      referent: "Jean Martin",
      status: "active",
      teamCount: 8,
      totalHours: 412.0,
      createdAt: "2025-09-20T14:30:00Z",
      description: "Application mobile sécurisée pour services bancaires"
    },
    {
      id: 3,
      name: "Site Web Corporate",
      client: "StartupXYZ",
      referent: "Sophie Laurent",
      status: "inactive",
      teamCount: 3,
      totalHours: 89.5,
      createdAt: "2025-11-01T09:15:00Z",
      description: "Refonte complète du site web corporate avec CMS intégré"
    },
    {
      id: 4,
      name: "Système de Gestion RH",
      client: "Enterprise Global",
      referent: "Pierre Durand",
      status: "active",
      teamCount: 6,
      totalHours: 178.0,
      createdAt: "2025-08-10T16:45:00Z",
      description: "Système complet de gestion des ressources humaines"
    },
    {
      id: 5,
      name: "Dashboard Analytics",
      client: "Creative Agency",
      referent: "Emma Moreau",
      status: "active",
      teamCount: 4,
      totalHours: 156.5,
      createdAt: "2025-10-25T11:20:00Z",
      description: "Dashboard interactif pour l'analyse de données marketing"
    },
    {
      id: 6,
      name: "API Gateway",
      client: "TechCorp Solutions",
      referent: "Marie Dubois",
      status: "inactive",
      teamCount: 2,
      totalHours: 67.0,
      createdAt: "2025-07-15T13:00:00Z",
      description: "Gateway API pour microservices avec authentification OAuth"
    }
  ];

  useEffect(() => {
    setProjects(mockProjects);
  }, []);

  const filteredProjects = projects?.filter(project => {
    // Apply filters
    if (filters?.status !== 'all' && project?.status !== filters?.status) return false;
    if (filters?.client !== 'all' && project?.client !== filters?.client) return false;
    if (filters?.referent !== 'all' && project?.referent !== filters?.referent) return false;
    
    // Hours filter
    if (filters?.minHours !== '' && project?.totalHours < parseFloat(filters?.minHours)) return false;
    if (filters?.maxHours !== '' && project?.totalHours > parseFloat(filters?.maxHours)) return false;
    
    // Date range filter (simplified)
    if (filters?.dateRange !== 'all') {
      const projectDate = new Date(project.createdAt);
      const now = new Date();
      
      switch (filters?.dateRange) {
        case 'today':
          if (projectDate?.toDateString() !== now?.toDateString()) return false;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (projectDate < weekAgo) return false;
          break;
        case 'month':
          if (projectDate?.getMonth() !== now?.getMonth() || projectDate?.getFullYear() !== now?.getFullYear()) return false;
          break;
        default:
          break;
      }
    }
    
    return true;
  });

  const handleSelectProject = (projectId) => {
    setSelectedProjects(prev => 
      prev?.includes(projectId) 
        ? prev?.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProjects?.length === filteredProjects?.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects?.map(p => p?.id));
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
    setIsEditing(true);
  };

  const handleToggleStatus = (projectId) => {
    setProjects(prev => prev?.map(project => 
      project?.id === projectId 
        ? { ...project, status: project?.status === 'active' ? 'inactive' : 'active' }
        : project
    ));
  };

  const handleSaveProject = (updatedProject) => {
    setProjects(prev => prev?.map(project => 
      project?.id === updatedProject?.id ? updatedProject : project
    ));
    setSelectedProject(updatedProject);
    setIsEditing(false);
  };

  const handleCreateProject = (newProject) => {
    setProjects(prev => [...prev, newProject]);
    setShowCreateModal(false);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'all',
      client: 'all',
      referent: 'all',
      dateRange: 'all',
      minHours: '',
      maxHours: ''
    });
  };

  const handleBulkStatusChange = (status) => {
    setProjects(prev => prev?.map(project => 
      selectedProjects?.includes(project?.id) 
        ? { ...project, status }
        : project
    ));
    setSelectedProjects([]);
  };

  const handleBulkClientChange = (client) => {
    setProjects(prev => prev?.map(project => 
      selectedProjects?.includes(project?.id) 
        ? { ...project, client }
        : project
    ));
    setSelectedProjects([]);
  };

  const handleBulkArchive = () => {
    setProjects(prev => prev?.map(project => 
      selectedProjects?.includes(project?.id) 
        ? { ...project, status: 'inactive' }
        : project
    ));
    setSelectedProjects([]);
  };

  const handleBulkExport = () => {
    const selectedProjectsData = projects?.filter(p => selectedProjects?.includes(p?.id));
    const csvContent = [
      ['Nom', 'Client', 'Référent', 'Statut', 'Équipe', 'Heures', 'Date de création']?.join(','),
      ...selectedProjectsData?.map(p => [
        p?.name,
        p?.client,
        p?.referent,
        p?.status === 'active' ? 'Actif' : 'Inactif',
        p?.teamCount,
        p?.totalHours,
        new Date(p.createdAt)?.toLocaleDateString('fr-FR')
      ]?.join(','))
    ]?.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `projets_selection_${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
    link?.click();
    
    setSelectedProjects([]);
  };

  return (
    <>
      <NavigationHeader />
      <div className="min-h-screen bg-background p-6">
        {/* Stats Cards */}
        <ProjectStatsCards projects={filteredProjects} />

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Filters Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <ProjectFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              projectCount={filteredProjects?.length}
            />
          </div>

          {/* Projects Table */}
          <div className="col-span-12 lg:col-span-6">
            <ProjectTable
              projects={filteredProjects}
              selectedProjects={selectedProjects}
              onSelectProject={handleSelectProject}
              onSelectAll={handleSelectAll}
              onEditProject={handleEditProject}
              onToggleStatus={handleToggleStatus}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </div>

          {/* Detail Panel */}
          <div className="col-span-12 lg:col-span-3">
            <ProjectDetailPanel
              project={selectedProject}
              onSave={handleSaveProject}
              onClose={() => {
                setSelectedProject(null);
                setIsEditing(false);
              }}
              isEditing={isEditing}
              onToggleEdit={() => setIsEditing(!isEditing)}
            />
          </div>
        </div>
      </div>
      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedProjects?.length}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkClientChange={handleBulkClientChange}
        onBulkArchive={handleBulkArchive}
        onBulkExport={handleBulkExport}
        onClearSelection={() => setSelectedProjects([])}
      />
      {/* Create Modal */}
      <ProjectCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateProject}
      />
    </>
  );
};

export default ProjectManagement;