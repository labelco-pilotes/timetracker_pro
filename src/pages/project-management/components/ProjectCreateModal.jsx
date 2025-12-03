import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ProjectCreateModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    referent: '',
    status: 'active',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const referentOptions = [
    { value: 'Marie Dubois', label: 'Marie Dubois' },
    { value: 'Jean Martin', label: 'Jean Martin' },
    { value: 'Sophie Laurent', label: 'Sophie Laurent' },
    { value: 'Pierre Durand', label: 'Pierre Durand' },
    { value: 'Emma Moreau', label: 'Emma Moreau' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Le nom du projet est obligatoire';
    }

    if (!formData?.client?.trim()) {
      newErrors.client = 'Le client est obligatoire';
    }

    if (!formData?.referent) {
      newErrors.referent = 'Le référent est obligatoire';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newProject = {
        id: Date.now(),
        ...formData,
        teamCount: 0,
        totalHours: 0,
        createdAt: new Date()?.toISOString()
      };

      onSave(newProject);
      handleClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      client: '',
      referent: '',
      status: 'active',
      description: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={handleClose}
      />
      {/* Modal */}
      <div className="relative bg-card rounded-lg border border-border modal-shadow w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Icon name="Plus" size={16} color="white" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Nouveau projet
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <Icon name="X" size={16} />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nom du projet"
            type="text"
            value={formData?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            error={errors?.name}
            required
            placeholder="Entrez le nom du projet"
            disabled={isSubmitting}
          />

          <Input
            label="Client"
            type="text"
            value={formData?.client}
            onChange={(e) => handleInputChange('client', e?.target?.value)}
            error={errors?.client}
            required
            placeholder="Nom du client"
            disabled={isSubmitting}
          />

          <Select
            label="Référent du projet"
            options={referentOptions}
            value={formData?.referent}
            onChange={(value) => handleInputChange('referent', value)}
            error={errors?.referent}
            required
            placeholder="Sélectionner un référent"
            disabled={isSubmitting}
          />

          <Select
            label="Statut initial"
            options={statusOptions}
            value={formData?.status}
            onChange={(value) => handleInputChange('status', value)}
            disabled={isSubmitting}
          />

          <Input
            label="Description (optionnel)"
            type="text"
            value={formData?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
            placeholder="Description du projet"
            disabled={isSubmitting}
          />

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isSubmitting}
              iconName="Plus"
              iconPosition="left"
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