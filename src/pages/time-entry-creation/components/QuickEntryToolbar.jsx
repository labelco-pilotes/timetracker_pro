import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const QuickEntryToolbar = ({ 
  recentProjects, 
  onQuickProjectSelect, 
  onDuplicateLastEntry, 
  lastEntry 
}) => {
  return (
    <div className="bg-muted p-4 rounded-lg space-y-4">
      <h3 className="text-sm font-medium text-foreground flex items-center space-x-2">
        <Icon name="Zap" size={16} />
        <span>Saisie rapide</span>
      </h3>
      {/* Recent projects */}
      {recentProjects && recentProjects?.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Projets récents:</label>
          <div className="flex flex-wrap gap-2">
            {recentProjects?.slice(0, 3)?.map((project) => (
              <Button
                key={project?.id}
                variant="outline"
                size="sm"
                onClick={() => onQuickProjectSelect(project)}
                type="button"
                className="text-xs"
                iconName="Clock"
                iconPosition="left"
                iconSize={12}
              >
                {project?.name}
              </Button>
            ))}
          </div>
        </div>
      )}
      {/* Duplicate last entry */}
      {lastEntry && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Dernière saisie:</label>
          <div className="flex items-center justify-between bg-card p-3 rounded-md border border-border">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {lastEntry?.projectName}
              </div>
              <div className="text-xs text-muted-foreground">
                {lastEntry?.categoryName} • {lastEntry?.duration}h • {new Date(lastEntry.date)?.toLocaleDateString('fr-FR')}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onDuplicateLastEntry}
              type="button"
              iconName="Copy"
              iconPosition="left"
              iconSize={14}
            >
              Dupliquer
            </Button>
          </div>
        </div>
      )}
      {/* Quick actions */}
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Icon name="Lightbulb" size={12} />
        <span>Astuce: Utilisez Ctrl+S pour sauvegarder rapidement</span>
      </div>
    </div>
  );
};

export default QuickEntryToolbar;