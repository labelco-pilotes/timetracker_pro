import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ProjectCreateModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nom: '',
        description: '',
        status: 'active',
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      setIsSubmitting(true);
      await onSave?.({
        nom: formData.nom.trim(),
        description: formData.description?.trim() || null,
        status: formData.status,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-card rounded-xl shadow-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="FolderKanban" size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Nouveau projet
            </h2>
          </div>
          <button
            type="button"
            className="p-1 rounded-md hover:bg-muted text-muted-foreground"
            onClick={onClose}
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Nom du projet"
              placeholder="Ex : Refonte site e-commerce"
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              error={errors.nom}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description (facultatif)
            </label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              rows={3}
              placeholder="Contexte, objectifs, type de missions…"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div>
            <Select
              label="Statut"
              value={formData.status}
              onChange={(value) => handleChange('status', value)}
              options={[
                { value: 'active', label: 'Actif' },
                { value: 'inactive', label: 'Inactif' },
              ]}
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              iconName="Plus"
              iconPosition="left"
              loading={isSubmitting}
            >
              Créer le projet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreateModal;
