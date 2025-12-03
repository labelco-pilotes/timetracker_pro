import React from 'react';
import Icon from '../../../components/AppIcon';

const TimeEntrySummary = ({ entries, filteredEntries, activeFilter }) => {
  const calculateTotalHours = (entriesList) => {
    return entriesList?.reduce((total, entry) => total + entry?.duration, 0);
  };

  const totalHours = calculateTotalHours(filteredEntries);
  const weeklyTarget = 35; // 35 heures par semaine
  const progressPercentage = Math.min((totalHours / weeklyTarget) * 100, 100);

  const formatHours = (hours) => {
    return `${hours?.toFixed(2)?.replace('.', ',')}h`;
  };

  const getFilterLabel = () => {
    switch (activeFilter) {
      case 'current-week':
        return 'cette semaine';
      case 'previous-week':
        return 'la semaine précédente';
      case 'current-month':
        return 'ce mois';
      case 'last-30-days':
        return 'les 30 derniers jours';
      default:
        return 'la période sélectionnée';
    }
  };

  const getProjectBreakdown = () => {
    const projectHours = {};
    filteredEntries?.forEach(entry => {
      if (!projectHours?.[entry?.project]) {
        projectHours[entry.project] = {
          hours: 0,
          color: entry?.projectColor
        };
      }
      projectHours[entry.project].hours += entry?.duration;
    });
    return Object.entries(projectHours)?.sort(([,a], [,b]) => b?.hours - a?.hours)?.slice(0, 3);
  };

  const topProjects = getProjectBreakdown();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Total Hours Card */}
      <div className="bg-card rounded-lg border border-border p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
              <p className="text-2xl font-bold text-foreground">{formatHours(totalHours)}</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Temps travaillé {getFilterLabel()}
        </p>
      </div>
      {/* Weekly Progress Card */}
      <div className="bg-card rounded-lg border border-border p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Objectif hebdo</h3>
              <p className="text-2xl font-bold text-foreground">{progressPercentage?.toFixed(0)}%</p>
            </div>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <div 
            className="bg-accent h-2 rounded-full nav-transition" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatHours(totalHours)} / {formatHours(weeklyTarget)}
        </p>
      </div>
      {/* Entries Count Card */}
      <div className="bg-card rounded-lg border border-border p-6 card-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={20} className="text-success" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Saisies</h3>
              <p className="text-2xl font-bold text-foreground">{filteredEntries?.length}</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Entrées {getFilterLabel()}
        </p>
      </div>
      {/* Top Projects Breakdown */}
      {topProjects?.length > 0 && (
        <div className="md:col-span-3 bg-card rounded-lg border border-border p-6 card-shadow">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Répartition par projet
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topProjects?.map(([project, data], index) => (
              <div key={project} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${data?.color}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{project}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatHours(data?.hours)} ({((data?.hours / totalHours) * 100)?.toFixed(0)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeEntrySummary;