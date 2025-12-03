import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const CategoryDetailEditor = ({ 
  selectedCategory, 
  selectedProject,
  onUpdateCategory, 
  onDeleteCategory,
  onCreateSubcategory 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    billingCode: '',
    isActive: true,
    parentId: null,
    color: '#2563EB'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Color options for categories
  const colorOptions = [
    { value: '#2563EB', label: 'Bleu' },
    { value: '#059669', label: 'Vert' },
    { value: '#D97706', label: 'Orange' },
    { value: '#DC2626', label: 'Rouge' },
    { value: '#7C3AED', label: 'Violet' },
    { value: '#0891B2', label: 'Cyan' },
    { value: '#65A30D', label: 'Lime' },
    { value: '#DB2777', label: 'Rose' }
  ];

  // Parent category options (for subcategories)
  const parentOptions = selectedProject ? [
    { value: null, label: 'Aucun parent (catégorie principale)' },
    { value: 1, label: 'Développement Frontend' },
    { value: 2, label: 'Développement Backend' },
    { value: 3, label: 'Tests et Qualité' }
  ] : [];

  useEffect(() => {
    if (selectedCategory) {
      setFormData({
        name: selectedCategory?.name || '',
        description: selectedCategory?.description || '',
        billingCode: selectedCategory?.billingCode || '',
        isActive: selectedCategory?.isActive !== false,
        parentId: selectedCategory?.parentId || null,
        color: selectedCategory?.color || '#2563EB'
      });
      setIsEditing(false);
    }
  }, [selectedCategory]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (formData?.name?.trim()) {
      onUpdateCategory(selectedCategory?.id, formData);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    onDeleteCategory(selectedCategory?.id);
    setShowDeleteConfirm(false);
  };

  const handleCreateSubcategory = () => {
    onCreateSubcategory(selectedCategory?.id);
  };

  if (!selectedCategory) {
    return (
      <div className="h-full flex flex-col bg-card">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Icon name="Tag" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">Sélectionnez une catégorie pour la modifier</p>
            <p className="text-sm text-muted-foreground">
              Choisissez une catégorie dans la liste pour voir ses détails et la modifier
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Détails de la catégorie</h2>
            <p className="text-sm text-muted-foreground">
              {selectedCategory?.parentId ? 'Sous-catégorie' : 'Catégorie principale'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  iconName="Edit2"
                  iconPosition="left"
                >
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateSubcategory}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Sous-catégorie
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={!formData?.name?.trim()}
                  iconName="Check"
                  iconPosition="left"
                >
                  Enregistrer
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  iconName="X"
                  iconPosition="left"
                >
                  Annuler
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-foreground">Informations générales</h3>
          
          <Input
            label="Nom de la catégorie"
            type="text"
            value={formData?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            disabled={!isEditing}
            required
            placeholder="Ex: Développement Frontend"
          />

          <Input
            label="Description"
            type="text"
            value={formData?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
            disabled={!isEditing}
            placeholder="Description détaillée de la catégorie"
            description="Description optionnelle pour clarifier l'usage de cette catégorie"
          />

          <Input
            label="Code de facturation"
            type="text"
            value={formData?.billingCode}
            onChange={(e) => handleInputChange('billingCode', e?.target?.value)}
            disabled={!isEditing}
            placeholder="Ex: DEV-FRONT"
            description="Code utilisé pour la facturation et les rapports"
          />
        </div>

        {/* Hierarchy */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-foreground">Hiérarchie</h3>
          
          <Select
            label="Catégorie parent"
            options={parentOptions}
            value={formData?.parentId}
            onChange={(value) => handleInputChange('parentId', value)}
            disabled={!isEditing}
            description="Laissez vide pour une catégorie principale"
          />
        </div>

        {/* Appearance */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-foreground">Apparence</h3>
          
          <Select
            label="Couleur"
            options={colorOptions}
            value={formData?.color}
            onChange={(value) => handleInputChange('color', value)}
            disabled={!isEditing}
            description="Couleur d'affichage dans l'interface"
          />

          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-md border border-border"
              style={{ backgroundColor: formData?.color }}
            />
            <span className="text-sm text-muted-foreground">Aperçu de la couleur</span>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-foreground">Statut</h3>
          
          <Checkbox
            label="Catégorie active"
            description="Les catégories inactives ne peuvent pas être utilisées pour de nouvelles saisies"
            checked={formData?.isActive}
            onChange={(e) => handleInputChange('isActive', e?.target?.checked)}
            disabled={!isEditing}
          />
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-foreground">Statistiques</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center space-x-2 mb-1">
                <Icon name="Clock" size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Heures totales</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{selectedCategory?.totalHours || 0}h</p>
            </div>
            
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center space-x-2 mb-1">
                <Icon name="Hash" size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Saisies</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{selectedCategory?.entryCount || 0}</p>
            </div>
          </div>

          <div className="p-3 bg-muted rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="TrendingUp" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Utilisation récente</span>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Cette semaine:</span>
                <span>12.5h</span>
              </div>
              <div className="flex justify-between">
                <span>Semaine dernière:</span>
                <span>8.25h</span>
              </div>
              <div className="flex justify-between">
                <span>Ce mois:</span>
                <span>45.75h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Créée le {new Date(2024, 0, 15)?.toLocaleDateString('fr-FR')}
          </div>
          
          {selectedCategory?.entryCount === 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              iconName="Trash2"
              iconPosition="left"
            >
              Supprimer
            </Button>
          )}
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-md">
            <div className="flex items-start space-x-3">
              <Icon name="AlertTriangle" size={20} className="text-error flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-error mb-1">
                  Confirmer la suppression
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible.
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                  >
                    Supprimer définitivement
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetailEditor;