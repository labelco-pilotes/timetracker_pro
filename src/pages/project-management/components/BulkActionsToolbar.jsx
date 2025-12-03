import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActionsToolbar = ({ 
  selectedCount, 
  onBulkStatusChange, 
  onBulkClientChange, 
  onBulkArchive, 
  onBulkExport,
  onClearSelection 
}) => {
  const [showActions, setShowActions] = useState(false);

  const statusOptions = [
    { value: 'active', label: 'Activer' },
    { value: 'inactive', label: 'Désactiver' }
  ];

  const clientOptions = [
    { value: 'TechCorp Solutions', label: 'TechCorp Solutions' },
    { value: 'Digital Innovations', label: 'Digital Innovations' },
    { value: 'StartupXYZ', label: 'StartupXYZ' },
    { value: 'Enterprise Global', label: 'Enterprise Global' },
    { value: 'Creative Agency', label: 'Creative Agency' }
  ];

  const handleStatusChange = (status) => {
    onBulkStatusChange(status);
    setShowActions(false);
  };

  const handleClientChange = (client) => {
    onBulkClientChange(client);
    setShowActions(false);
  };

  const handleArchive = () => {
    onBulkArchive();
    setShowActions(false);
  };

  const handleExport = () => {
    onBulkExport();
    setShowActions(false);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-150">
      <div className="bg-card border border-border rounded-lg modal-shadow p-4 min-w-96">
        <div className="flex items-center justify-between">
          {/* Selection Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {selectedCount}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-foreground">
                {selectedCount} projet{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
              </div>
              <div className="text-xs text-muted-foreground">
                Choisissez une action à appliquer
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {!showActions ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowActions(true)}
                >
                  <Icon name="Settings" size={16} />
                  Actions
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelection}
                >
                  <Icon name="X" size={16} />
                </Button>
              </>
            ) : (
              <>
                {/* Status Actions */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('active')}
                    className="text-success border-success hover:bg-success hover:text-success-foreground"
                  >
                    <Icon name="Play" size={14} />
                    Activer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('inactive')}
                    className="text-warning border-warning hover:bg-warning hover:text-warning-foreground"
                  >
                    <Icon name="Pause" size={14} />
                    Désactiver
                  </Button>
                </div>

                {/* More Actions */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                  >
                    <Icon name="Download" size={14} />
                    Exporter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleArchive}
                    className="text-error border-error hover:bg-error hover:text-error-foreground"
                  >
                    <Icon name="Archive" size={14} />
                    Archiver
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActions(false)}
                >
                  <Icon name="ChevronUp" size={16} />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Extended Actions */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Changer le client
                </label>
                <Select
                  options={clientOptions}
                  placeholder="Sélectionner un client"
                  onChange={handleClientChange}
                  searchable
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearSelection}
                  className="w-full"
                >
                  <Icon name="X" size={14} />
                  Annuler la sélection
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkActionsToolbar;