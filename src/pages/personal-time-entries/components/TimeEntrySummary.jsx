import React from 'react';
import Icon from '../../../components/AppIcon';

const TimeEntrySummary = ({
  entries,
  filteredEntries,
  activeFilter,
  totalDuration,
}) => {
  const list = filteredEntries ?? entries ?? [];

  const computedTotal = list.reduce(
    (sum, entry) => sum + (entry?.duration || 0),
    0
  );
  const totalHours =
    typeof totalDuration === 'number' && !Number.isNaN(totalDuration)
      ? totalDuration
      : computedTotal;

  const weeklyTarget = 35;
  const progressPercentage =
    weeklyTarget > 0
      ? Math.min((totalHours / weeklyTarget) * 100, 100)
      : 0;

  const entriesCount = list.length;

  const formatHours = (hours) =>
    `${(hours || 0).toFixed(2).replace('.', ',')}h`;

  const formatPercent = (value) =>
    `${(value || 0).toFixed(0)}%`;

  const getFilterLabel = () => {
    switch (activeFilter) {
      case 'current-week':
        return 'de la semaine actuelle';
      case 'previous-week':
        return 'de la semaine précédente';
      case 'current-month':
        return 'du mois en cours';
      case 'last-30-days':
        return 'des 30 derniers jours';
      default:
        return 'de la période sélectionnée';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total heures */}
      <div className="bg-card rounded-lg border border-border p-4 card-shadow min-h-[120px] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={18} className="text-primary" />
            </div>
            <div className="max-w-[150px] md:max-w-none">
              <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Total
              </h3>
              <p className="text-[11px] text-muted-foreground break-words leading-snug line-clamp-2">
                Temps travaillé {getFilterLabel()}
              </p>
            </div>
          </div>
        </div>
        <p className="text-2xl font-semibold text-foreground">
          {formatHours(totalHours)}
        </p>
      </div>

      {/* Objectif hebdo */}
      <div className="bg-card rounded-lg border border-border p-4 card-shadow min-h-[120px] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={18} className="text-emerald-600" />
            </div>
            <div className="max-w-[150px] md:max-w-none">
              <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Objectif hebdo
              </h3>
              <p className="text-[11px] text-muted-foreground break-words leading-snug line-clamp-2">
                Basé sur 35,00h / semaine
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-semibold text-foreground">
              {formatPercent(progressPercentage)}
            </p>
            <p className="text-[11px] text-muted-foreground whitespace-nowrap">
              {formatHours(totalHours)} / {formatHours(weeklyTarget)}
            </p>
          </div>

          <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progressPercentage || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Nombre de saisies */}
      <div className="bg-card rounded-lg border border-border p-4 card-shadow min-h-[120px] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={18} className="text-blue-600" />
            </div>
            <div className="max-w-[150px] md:max-w-none">
              <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Saisies
              </h3>
              <p className="text-[11px] text-muted-foreground break-words leading-snug line-clamp-2">
                Entrées {getFilterLabel()}
              </p>
            </div>
          </div>
        </div>
        <p className="text-2xl font-semibold text-foreground">
          {entriesCount}
        </p>
      </div>
    </div>
  );
};

export default TimeEntrySummary;
