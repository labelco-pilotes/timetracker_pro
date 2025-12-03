import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ProjectDetailPanel = ({ project, onSave, onClose, isEditing, onToggleEdit }) => {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    client: project?.client || '',
    referent: project?.referent || '',
    status: project?.status || 'active',
    description: project?.description || ''
  });

  const statusOptions = [
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' }];


  const referentOptions = [
  { value: 'Marie Dubois', label: 'Marie Dubois' },
  { value: 'Jean Martin', label: 'Jean Martin' },
  { value: 'Sophie Laurent', label: 'Sophie Laurent' },
  { value: 'Pierre Durand', label: 'Pierre Durand' },
  { value: 'Emma Moreau', label: 'Emma Moreau' }];


  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave({ ...project, ...formData });
  };

  const recentTimeEntries = [
  {
    id: 1,
    date: "2025-11-17",
    user: "Marie Dubois",
    category: "Développement",
    hours: 4.5,
    description: "Implémentation des nouvelles fonctionnalités"
  },
  {
    id: 2,
    date: "2025-11-16",
    user: "Jean Martin",
    category: "Tests",
    hours: 2.0,
    description: "Tests unitaires et validation"
  },
  {
    id: 3,
    date: "2025-11-15",
    user: "Sophie Laurent",
    category: "Documentation",
    hours: 1.5,
    description: "Mise à jour de la documentation technique"
  }];


  const teamMembers = [
  { name: "Marie Dubois", role: "Chef de projet", avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_16562ca66-1763297920476.png", avatarAlt: "Professional headshot of French woman with brown hair in business attire" },
  { name: "Jean Martin", role: "Développeur", avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_15a24c757-1763292886293.png", avatarAlt: "Professional headshot of French man with short dark hair in casual shirt" },
  { name: "Sophie Laurent", role: "Designer", avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1efea8232-1763295833460.png", avatarAlt: "Professional headshot of French woman with blonde hair in modern office setting" },
  { name: "Pierre Durand", role: "Testeur", avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b9d2775e-1763292626492.png", avatarAlt: "Professional headshot of French man with glasses in business casual attire" }];


  const categories = [
  { name: "Développement", count: 15 },
  { name: "Tests", count: 8 },
  { name: "Documentation", count: 5 },
  { name: "Réunions", count: 12 },
  { name: "Formation", count: 3 }];


  if (!project) {
    return (
      <div className="w-full h-full bg-card rounded-lg border border-border card-shadow flex items-center justify-center">
        <div className="text-center">
          <Icon name="FolderOpen" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Sélectionnez un projet</h3>
          <p className="text-muted-foreground">
            Choisissez un projet dans la liste pour voir ses détails
          </p>
        </div>
      </div>);

  }

  return (
    <div className="w-full h-full bg-card rounded-lg border border-border card-shadow flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${
          project?.status === 'active' ? 'bg-success' : 'bg-muted-foreground'}`
          } />
          <h3 className="text-lg font-semibold text-foreground">
            {isEditing ? 'Modifier le projet' : 'Détails du projet'}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ?
          <>
              <Button variant="outline" size="sm" onClick={onToggleEdit}>
                Annuler
              </Button>
              <Button variant="default" size="sm" onClick={handleSave}>
                Enregistrer
              </Button>
            </> :

          <>
              <Button variant="outline" size="sm" onClick={onToggleEdit}>
                <Icon name="Edit" size={16} />
                Modifier
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <Icon name="X" size={16} />
              </Button>
            </>
          }
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Project Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Informations générales</h4>
          
          {isEditing ?
          <div className="grid grid-cols-1 gap-4">
              <Input
              label="Nom du projet"
              value={formData?.name}
              onChange={(e) => handleInputChange('name', e?.target?.value)}
              required />

              <Input
              label="Client"
              value={formData?.client}
              onChange={(e) => handleInputChange('client', e?.target?.value)}
              required />

              <Select
              label="Référent"
              options={referentOptions}
              value={formData?.referent}
              onChange={(value) => handleInputChange('referent', value)} />

              <Select
              label="Statut"
              options={statusOptions}
              value={formData?.status}
              onChange={(value) => handleInputChange('status', value)} />

              <Input
              label="Description"
              value={formData?.description}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
              placeholder="Description du projet (optionnel)" />

            </div> :

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Nom du projet
                </label>
                <p className="text-sm text-foreground mt-1">{project?.name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Client
                </label>
                <p className="text-sm text-foreground mt-1">{project?.client}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Référent
                </label>
                <p className="text-sm text-foreground mt-1">{project?.referent}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Statut
                </label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                project?.status === 'active' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}`
                }>
                    {project?.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
              {project?.description &&
            <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Description
                  </label>
                  <p className="text-sm text-foreground mt-1">{project?.description}</p>
                </div>
            }
            </div>
          }
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Icon name="Users" size={16} className="text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Équipe
              </span>
            </div>
            <p className="text-lg font-semibold text-foreground mt-1">{project?.teamCount}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-accent" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Heures totales
              </span>
            </div>
            <p className="text-lg font-semibold text-foreground mt-1">{project?.totalHours}h</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Icon name="Tags" size={16} className="text-warning" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Catégories
              </span>
            </div>
            <p className="text-lg font-semibold text-foreground mt-1">{categories?.length}</p>
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Membres de l'équipe</h4>
          <div className="space-y-2">
            {teamMembers?.map((member, index) =>
            <div key={index} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 nav-transition">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <Icon name="User" size={14} color="white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{member?.name}</div>
                  <div className="text-xs text-muted-foreground">{member?.role}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Catégories associées</h4>
          <div className="grid grid-cols-2 gap-2">
            {categories?.map((category, index) =>
            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                <span className="text-sm text-foreground">{category?.name}</span>
                <span className="text-xs text-muted-foreground">{category?.count} entrées</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Time Entries */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Saisies récentes</h4>
          <div className="space-y-2">
            {recentTimeEntries?.map((entry) =>
            <div key={entry?.id} className="flex items-center justify-between p-3 border border-border rounded-md">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">{entry?.user}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{entry?.category}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(entry.date)?.toLocaleDateString('fr-FR')}
                  </div>
                  {entry?.description &&
                <div className="text-xs text-muted-foreground mt-1">
                      {entry?.description}
                    </div>
                }
                </div>
                <div className="text-sm font-medium text-foreground">
                  {entry?.hours}h
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);

};

export default ProjectDetailPanel;