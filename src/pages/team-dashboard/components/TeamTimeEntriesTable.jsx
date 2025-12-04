import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';

/**
 * Tableau des saisies filtrées
 */
const TeamTimeEntriesTable = ({ timeEntries = [] }) => {
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const sortedEntries = useMemo(() => {
    const entries = [...(timeEntries || [])];

    entries.sort((a, b) => {
      let aVal;
      let bVal;

      switch (sortField) {
        case 'collaborateur':
          aVal = a?.collaborateur?.nomComplet || '';
          bVal = b?.collaborateur?.nomComplet || '';
          break;
        case 'projet':
          aVal = a?.projet?.nom || '';
          bVal = b?.projet?.nom || '';
          break;
        case 'categorie':
          aVal = a?.categorie?.nom || '';
          bVal = b?.categorie?.nom || '';
          break;
        case 'dureeHeures':
          aVal = a?.dureeHeures || 0;
          bVal = b?.dureeHeures || 0;
          break;
        case 'date':
        default:
          aVal = a?.date || '';
          bVal = b?.date || '';
          break;
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return entries;
  }, [timeEntries, sortField, sortDir]);

  const totals = useMemo(() => {
    const totalHours = timeEntries.reduce(
      (sum, e) => sum + (e?.dureeHeures || 0),
      0
    );
    const totalCost = timeEntries.reduce((sum, e) => {
      const rate = e?.collaborateur?.tauxHoraire || 0;
      return sum + (e?.dureeHeures || 0) * rate;
    }, 0);

    return { totalHours, totalCost };
  }, [timeEntries]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (field !== sortField) {
      return <Icon name="ArrowUpDown" size={14} className="ml-1 text-muted-foreground" />;
    }
    return sortDir === 'asc' ? (
      <Icon name="ChevronUp" size={14} className="ml-1 text-muted-foreground" />
    ) : (
      <Icon name="ChevronDown" size={14} className="ml-1 text-muted-foreground" />
    );
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Saisies détaillées
          </h3>
          <p className="text-xs text-muted-foreground">
            {sortedEntries.length} saisie(s) affichée(s) — {totals.totalHours.toFixed(1)} h, {formatCurrency(totals.totalCost)}
          </p>
        </div>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          Aucune saisie ne correspond aux filtres actuels.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    <SortIcon field="date" />
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer"
                  onClick={() => handleSort('collaborateur')}
                >
                  <div className="flex items-center">
                    Collaborateur
                    <SortIcon field="collaborateur" />
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer"
                  onClick={() => handleSort('projet')}
                >
                  <div className="flex items-center">
                    Projet
                    <SortIcon field="projet" />
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer"
                  onClick={() => handleSort('categorie')}
                >
                  <div className="flex items-center">
                    Catégorie
                    <SortIcon field="categorie" />
                  </div>
                </th>
                <th
                  className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide cursor-pointer"
                  onClick={() => handleSort('dureeHeures')}
                >
                  <div className="flex items-center justify-end">
                    Durée (h)
                    <SortIcon field="dureeHeures" />
                  </div>
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Coût (€)
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Commentaire
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((e) => {
                const rate = e?.collaborateur?.tauxHoraire || 0;
                const cost = (e?.dureeHeures || 0) * rate;

                return (
                  <tr
                    key={e.id}
                    className="border-t border-border hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-3 py-2 align-top whitespace-nowrap text-xs text-muted-foreground">
                      {e.date}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="text-xs text-foreground">
                        {e?.collaborateur?.nomComplet || '—'}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {e?.collaborateur?.email || ''}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-foreground">
                      {e?.projet?.nom || '—'}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-foreground">
                      {e?.categorie?.nom || '—'}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-xs text-foreground">
                      {(e?.dureeHeures || 0).toFixed(1)}
                    </td>
                    <td className="px-3 py-2 align-top text-right text-xs text-foreground whitespace-nowrap">
                      {formatCurrency(cost)}
                    </td>
                    <td className="px-3 py-2 align-top text-xs text-muted-foreground max-w-xs">
                      <span className="line-clamp-2">
                        {e?.commentaire || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeamTimeEntriesTable;
