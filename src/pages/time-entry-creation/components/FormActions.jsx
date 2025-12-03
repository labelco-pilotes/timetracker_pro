import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const FormActions = ({ 
  onSave, 
  onSaveAndContinue, 
  onCancel, 
  isLoading = false, 
  hasUnsavedChanges = false 
}) => {
  return (
    <div className="space-y-4">
      {/* Main action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="default"
          onClick={onSave}
          loading={isLoading}
          disabled={isLoading}
          iconName="Save"
          iconPosition="left"
          className="flex-1"
        >
          Enregistrer
        </Button>
        
        <Button
          variant="outline"
          onClick={onSaveAndContinue}
          disabled={isLoading}
          iconName="Plus"
          iconPosition="left"
          className="flex-1"
        >
          Enregistrer et continuer
        </Button>
      </div>

      {/* Secondary actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
          iconName="X"
          iconPosition="left"
          className="flex-1"
        >
          Annuler
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/personal-time-entries'}
          disabled={isLoading}
          iconName="ArrowLeft"
          iconPosition="left"
          className="flex-1"
        >
          Retour aux saisies
        </Button>
      </div>

      {/* Unsaved changes indicator */}
      {hasUnsavedChanges && (
        <div className="flex items-center space-x-2 text-sm text-warning bg-warning/10 p-3 rounded-md">
          <Icon name="AlertCircle" size={14} />
          <span>Vous avez des modifications non sauvegardées</span>
        </div>
      )}

      {/* Keyboard shortcuts info */}
      <div className="text-xs text-muted-foreground space-y-1 bg-muted p-3 rounded-md">
        <div className="font-medium">Raccourcis clavier:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          <div>• Ctrl+S : Enregistrer</div>
          <div>• Ctrl+Enter : Enregistrer et continuer</div>
          <div>• Échap : Annuler</div>
          <div>• Tab : Navigation entre champs</div>
        </div>
      </div>
    </div>
  );
};

export default FormActions;