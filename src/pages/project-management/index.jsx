import React, { useState, useEffect } from 'react';
import NavigationHeader from '../navigation-header';
import Button from '../../components/ui/Button';

import ProjectTable from './components/ProjectTable';
import ProjectDetailPanel from './components/ProjectDetailPanel';
import ProjectCreateModal from './components/ProjectCreateModal';
import { projetService } from '../../services/projetService';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Chargement des projets depuis Supabase
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const data = await projetService.getAll();
        setProjects(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des projets', error);
        setLoadError("Erreur lors du chargement des projets. Merci de réessayer.");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCreateProject = async (formValues) => {
    try {
      const created = await projetService.create(formValues);
      setProjects((prev) => [...prev, created]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Erreur lors de la création du projet', error);
      alert("Erreur lors de la création du projet. Merci de réessayer.");
    }
  };

  const handleEditProject = (project) => {
    setSelectedProject(project);
  };

  const handleSaveProject = async (updatedFields) => {
    if (!selectedProject) return;

    try {
      const updated = await projetService.update(selectedProject.id, updatedFields);
      setProjects((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setSelectedProject(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet', error);
      alert("Erreur lors de la mise à jour du projet. Merci de réessayer.");
    }
  };

  const handleCloseDetail = () => {
    setSelectedProject(null);
  };

  return (
    <>
      <NavigationHeader />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Gestion des projets</h1>
            <p className="text-sm text-muted-foreground">
              Créez, consultez et mettez à jour les projets utilisés dans les saisies de temps.
            </p>
          </div>
          <Button
            iconName="Plus"
            iconPosition="left"
            variant="primary"
            onClick={handleOpenCreateModal}
          >
            Nouveau projet
          </Button>
        </div>

        {loading && (
          <div className="text-sm text-muted-foreground">Chargement des projets…</div>
        )}

        {!loading && loadError && (
          <div className="text-sm text-destructive">{loadError}</div>
        )}

        {!loading && !loadError && (
          <ProjectTable
            projects={projects}
            onEditProject={handleEditProject}
          />
        )}
      </main>

      {/* Modal de création */}
      <ProjectCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateProject}
      />

      {/* Panneau de détail / édition */}
      <ProjectDetailPanel
        project={selectedProject}
        onClose={handleCloseDetail}
        onSave={handleSaveProject}
      />
    </>
  );
};

export default ProjectManagement;
