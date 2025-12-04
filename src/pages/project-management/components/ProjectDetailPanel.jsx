import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ProjectDetailPanel = ({ project, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    status: 'active',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        nom: project?.nom || '',
        description: project?.description || '',
        status: project?.status || 'active',
      });
      setErrors({});
      setSaving(false);
    }
  }, [project]);

  if (!project) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nom?.trim()) {
      newErrors.nom = 'Le nom du projet est obligatoire.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);
      await onSave?.({
        nom: formData.nom.trim(),
        description: formData.description?.trim() || null,
        status: formData.status,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/30"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="w-full max-w-md bg-card border-l border-border shadow-xl flex flex-col">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="FolderKanban" size={18} className="text-primary" />
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Détails du projet
              </p>
              <h2 className="text-sm font-semibold text-foreground truncate max-w-xs">
                {project?.nom || 'Projet sans nom'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="p-1 rounded-md hover:bg-muted text-muted-foreground"
            onClick={onClose}
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <Input
            label="Nom du projet"
            value={formData.nom}
            onChange={(e) => handleChange('nom', e.target.value)}
            error={errors.nom}
            required
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              rows={4}
              placeholder="Détaillez l’objet du projet, le contexte, les livrables principaux…"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <Select
            label="Statut"
            value={formData.status}
            onChange={(value) => handleChange('status', value)}
            options={[
              { value: 'active', label: 'Actif' },
              { value: 'inactive', label: 'Inactif' },
            ]}
          />
        </form>

        <div className="px-4 py-3 border-t border-border flex items-center justify-end space-x-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Fermer
          </Button>
          <Button
            type="submit"
            variant="primary"
            iconName="Save"
            iconPosition="left"
            loading={saving}
            onClick={handleSubmit}
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPanel;
