import React from 'react';
import Icon from '../../../components/AppIcon';

const ProjectStatsCards = ({ projects }) => {
  const totalProjects = projects?.length;
  const activeProjects = projects?.filter(p => p?.status === 'active')?.length;
  const inactiveProjects = projects?.filter(p => p?.status === 'inactive')?.length;
  const totalHours = projects?.reduce((sum, p) => sum + p?.totalHours, 0);
  const totalTeamMembers = projects?.reduce((sum, p) => sum + p?.teamCount, 0);
  const averageHoursPerProject = totalProjects > 0 ? (totalHours / totalProjects)?.toFixed(1) : 0;

  const stats = [
    {
      title: 'Total des projets',
      value: totalProjects,
      icon: 'FolderOpen',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: `${activeProjects} actifs, ${inactiveProjects} inactifs`
    },
    {
      title: 'Projets actifs',
      value: activeProjects,
      icon: 'Play',
      color: 'text-success',
      bgColor: 'bg-success/10',
      description: `${((activeProjects / totalProjects) * 100 || 0)?.toFixed(0)}% du total`
    },
    {
      title: 'Heures totales',
      value: `${totalHours}h`,
      icon: 'Clock',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      description: `${averageHoursPerProject}h par projet en moyenne`
    },
    {
      title: 'Membres d\'équipe',
      value: totalTeamMembers,
      icon: 'Users',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      description: `Répartis sur ${totalProjects} projets`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats?.map((stat, index) => (
        <div key={index} className="bg-card rounded-lg border border-border card-shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg ${stat?.bgColor} flex items-center justify-center`}>
                  <Icon name={stat?.icon} size={20} className={stat?.color} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {stat?.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat?.value}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stat?.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectStatsCards;