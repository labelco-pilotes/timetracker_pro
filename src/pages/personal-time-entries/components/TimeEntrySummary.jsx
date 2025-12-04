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

  const getFilterShortLabel = () => {
    switch (activeFilter) {
      case 'current-week':
        return 'semaine actuelle';
      case 'previous-week':
        return 'semaine précédente';
      case 'current-month':
        return 'mois en cours';
      case 'last-30-days':
        return '30 derniers jours';
      default:
        return 'période filtrée';
    }
  };

  const periodLabel = getFilterShortLabel();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total heures */}
      <div className="bg-card rounded-lg border border-border p-4 card-shadow min-h-[110px] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Clock" size={16} className="text-primary" />
            </div>
            <div className="max-w-[140px] md:max-w-none">
              <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide truncate">
                Total
              </h3>
              <p className="text-[11px] text-muted-foreground leading-snug truncate">
                Temps {periodLabel}
              </p>
            </div>
          </div>
        </div>
        <p className="text-2xl font-semibold text-foreground">
          {formatHours(totalHours)}
        </p>
      </div>

      {/* Objectif hebdo */}
      <div className="bg-card rounded-lg border border-border p-4 card-shadow min-h-[110px] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={16} className="text-emerald-600" />
            </div>
            <div className="max-w-[140px] md:max-w-none">
              <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide truncate">
                Objectif hebdo
              </h3>
              <p className="text-[11px] text-muted-foreground leading-snug truncate">
                Base 35h / semaine
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
      <div className="bg-card rounded-lg border border-border p-4 card-shadow min-h-[110px] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon name="FileText" size={16} className="text-blue-600" />
            </div>
            <div className="max-w-[140px] md:max-w-none">
              <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide truncate">
                Saisies
              </h3>
              <p className="text-[11px] text-muted-foreground leading-snug truncate">
                Entrées {periodLabel}
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
