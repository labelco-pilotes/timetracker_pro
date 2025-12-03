import React from 'react';
import Icon from '../../../components/AppIcon';

const ValidationSummary = ({ 
  selectedProject, 
  selectedCategory, 
  duration, 
  selectedDate, 
  comments,
  projects,
  categories 
}) => {
  const project = projects?.find(p => p?.id === selectedProject);
  const category = categories?.find(c => c?.id === selectedCategory);
  
  const isValid = selectedProject && selectedCategory && duration && parseFloat(duration) > 0 && selectedDate;

  if (!isValid) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    return date?.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-success/10 border border-success/20 p-4 rounded-lg space-y-3">
      <div className="flex items-center space-x-2">
        <Icon name="CheckCircle" size={16} className="text-success" />
        <h3 className="text-sm font-medium text-success">Résumé de la saisie</h3>
      </div>
      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-foreground">Projet:</span>
            <div className="text-muted-foreground">{project?.name} - {project?.client}</div>
          </div>
          
          <div>
            <span className="font-medium text-foreground">Catégorie:</span>
            <div className="text-muted-foreground">{category?.name}</div>
          </div>
          
          <div>
            <span className="font-medium text-foreground">Durée:</span>
            <div className="text-muted-foreground">{duration} heures</div>
          </div>
          
          <div>
            <span className="font-medium text-foreground">Date:</span>
            <div className="text-muted-foreground">{formatDate(selectedDate)}</div>
          </div>
        </div>

        {comments && (
          <div>
            <span className="font-medium text-foreground">Commentaires:</span>
            <div className="text-muted-foreground mt-1 p-2 bg-muted rounded text-xs">
              {comments}
            </div>
          </div>
        )}

        {project?.referent && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Icon name="User" size={12} />
            <span>Référent projet: {project?.referent}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationSummary;