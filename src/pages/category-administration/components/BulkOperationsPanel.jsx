import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';


const BulkOperationsPanel = ({ 
  selectedCategories, 
  onBulkUpdate, 
  onBulkDelete, 
  onBulkMove,
  availableProjects 
}) => {
  const [showPanel, setShowPanel] = useState(false);
  const [operation, setOperation] = useState('');
  const [targetProject, setTargetProject] = useState('');
  const [newStatus, setNewStatus] = useState(true);

  const operationOptions = [
    { value: 'activate', label: 'Activer les catégories' },
    { value: 'deactivate', label: 'Désactiver les catégories' },
    { value: 'move', label: 'Déplacer vers un autre projet' },
    { value: 'delete', label: 'Supprimer les catégories' }
  ];

  const projectOptions = availableProjects?.map(project => ({
    value: project?.id,
    label: project?.name
  })) || [];

  const handleExecute = () => {
    switch (operation) {
      case 'activate':
        onBulkUpdate(selectedCategories, { isActive: true });
        break;
      case 'deactivate':
        onBulkUpdate(selectedCategories, { isActive: false });
        break;
      case 'move':
        if (targetProject) {
          onBulkMove(selectedCategories, targetProject);
        }
        break;
      case 'delete':
        onBulkDelete(selectedCategories);
        break;
    }
    
    setShowPanel(false);
    setOperation('');
    setTargetProject('');
  };

  const canExecute = () => {
    if (!operation || selectedCategories?.length === 0) return false;
    if (operation === 'move' && !targetProject) return false;
    return true;
  };

  if (selectedCategories?.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-150">
      <div className="bg-card border border-border rounded-lg modal-shadow">
        {!showPanel ? (
          <div className="flex items-center space-x-4 px-4 py-3">
            <div className="flex items-center space-x-2">
              <Icon name="CheckSquare" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">
                {selectedCategories?.length} catégorie{selectedCategories?.length > 1 ? 's' : ''} sélectionnée{selectedCategories?.length > 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPanel(true)}
                iconName="Settings"
                iconPosition="left"
              >
                Actions groupées
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.dispatchEvent(new CustomEvent('clearSelection'))}
                iconName="X"
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium text-foreground">Actions groupées</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPanel(false)}
                iconName="X"
              />
            </div>

            <div className="space-y-4">
              <Select
                label="Action à effectuer"
                options={operationOptions}
                value={operation}
                onChange={setOperation}
                placeholder="Choisissez une action"
              />

              {operation === 'move' && (
                <Select
                  label="Projet de destination"
                  options={projectOptions}
                  value={targetProject}
                  onChange={setTargetProject}
                  placeholder="Sélectionnez un projet"
                  description="Les catégories seront déplacées vers ce projet"
                />
              )}

              {operation === 'delete' && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-md">
                  <div className="flex items-start space-x-2">
                    <Icon name="AlertTriangle" size={16} className="text-error flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-error font-medium mb-1">Attention</p>
                      <p className="text-xs text-muted-foreground">
                        Seules les catégories sans saisies de temps peuvent être supprimées.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">
                  {selectedCategories?.length} élément{selectedCategories?.length > 1 ? 's' : ''} concerné{selectedCategories?.length > 1 ? 's' : ''}
                </span>
                
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPanel(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleExecute}
                    disabled={!canExecute()}
                  >
                    Exécuter
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

export default BulkOperationsPanel;