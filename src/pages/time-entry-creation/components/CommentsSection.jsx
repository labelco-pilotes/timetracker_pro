import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const CommentsSection = ({ 
  comments, 
  onCommentsChange, 
  maxLength = 500 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const remainingChars = maxLength - (comments?.length || 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Commentaires (optionnel)
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleExpanded}
          type="button"
          iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
          iconPosition="right"
          iconSize={14}
        >
          {isExpanded ? 'Réduire' : 'Développer'}
        </Button>
      </div>
      {isExpanded && (
        <div className="space-y-2">
          <textarea
            value={comments || ''}
            onChange={(e) => onCommentsChange(e?.target?.value)}
            placeholder="Ajoutez des détails sur cette saisie de temps..."
            maxLength={maxLength}
            rows={4}
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical min-h-[100px] max-h-[200px]"
          />
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Décrivez brièvement le travail effectué
            </span>
            <span className={`${remainingChars < 50 ? 'text-warning' : 'text-muted-foreground'}`}>
              {remainingChars} caractères restants
            </span>
          </div>

          {/* Quick comment templates */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Modèles rapides:</label>
            <div className="flex flex-wrap gap-2">
              {[
                'Développement',
                'Réunion équipe',
                'Tests et validation',
                'Documentation',
                'Formation'
              ]?.map((template) => (
                <Button
                  key={template}
                  variant="outline"
                  size="xs"
                  onClick={() => onCommentsChange(template)}
                  type="button"
                  className="text-xs"
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
      {!isExpanded && comments && (
        <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
          <Icon name="MessageSquare" size={14} className="inline mr-2" />
          {comments?.length > 50 ? `${comments?.substring(0, 50)}...` : comments}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;