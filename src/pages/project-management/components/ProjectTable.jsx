import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProjectTable = ({ projects, onEditProject }) => {
  const hasProjects = projects && projects.length > 0;

  if (!hasProjects) {
    return (
      <div className="bg-card rounded-lg border border-dashed border-border p-8 text-center">
        <Icon name="FolderKanban" size={32} className="text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-medium text-foreground mb-1">
          Aucun projet pour le moment
        </h2>
        <p className="text-sm text-muted-foreground">
          Créez un premier projet pour pouvoir l’utiliser dans les saisies de temps.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Nom du projet
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Statut
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const isActive = project?.status === 'active';
            return (
              <tr
                key={project.id}
                className="border-t border-border hover:bg-muted/50 transition-colors"
              >
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name="FolderKanban"
                      size={16}
                      className={isActive ? 'text-primary' : 'text-muted-foreground'}
                    />
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {project?.nom || 'Projet sans nom'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <span
                    className={
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                      (isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-700')
                    }
                  >
                    <span
                      className={
                        'w-1.5 h-1.5 rounded-full mr-1.5 ' +
                        (isActive ? 'bg-emerald-500' : 'bg-slate-500')
                      }
                    />
                    {isActive ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-3 align-top max-w-md">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project?.description || '—'}
                  </p>
                </td>
                <td className="px-4 py-3 align-top text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    iconName="Pencil"
                    iconPosition="left"
                    onClick={() => onEditProject?.(project)}
                  >
                    Modifier
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;
