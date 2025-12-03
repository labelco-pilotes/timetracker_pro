import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

const TeamTimeEntriesTable = ({ timeEntries = [], filters = {} }) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  // Format currency helper
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === 0) return '—';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(value);
  };

  // Calculate cost for each entry
  const calculateCost = (entry) => {
    const tauxHoraire = entry?.collaborateur?.tauxHoraire || 0;
    if (tauxHoraire === 0) return null;
    return (entry?.dureeHeures || 0) * tauxHoraire;
  };

  // Filter and sort entries
  const filteredAndSortedEntries = useMemo(() => {
    let result = [...timeEntries];

    // Apply search filter
    if (filters?.searchTerm) {
      const search = filters?.searchTerm?.toLowerCase();
      result = result?.filter(entry => 
        entry?.collaborateur?.nomComplet?.toLowerCase()?.includes(search) ||
        entry?.projet?.nom?.toLowerCase()?.includes(search) ||
        entry?.categorie?.nom?.toLowerCase()?.includes(search) ||
        entry?.commentaire?.toLowerCase()?.includes(search)
      );
    }

    // Sort
    result?.sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'date':
          aVal = new Date(a.date);
          bVal = new Date(b.date);
          break;
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
        case 'duree':
          aVal = a?.dureeHeures || 0;
          bVal = b?.dureeHeures || 0;
          break;
        case 'cout':
          aVal = calculateCost(a) || 0;
          bVal = calculateCost(b) || 0;
          break;
        default:
          aVal = a?.[sortField];
          bVal = b?.[sortField];
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [timeEntries, filters, sortField, sortDirection]);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-foreground" />
      : <ChevronDown className="h-4 w-4 text-foreground" />;
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Saisies de temps détaillées</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredAndSortedEntries?.length} saisie(s) trouvée(s)
            </p>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <SortIcon field="date" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSort('collaborateur')}
              >
                <div className="flex items-center space-x-1">
                  <span>Collaborateur</span>
                  <SortIcon field="collaborateur" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSort('projet')}
              >
                <div className="flex items-center space-x-1">
                  <span>Projet</span>
                  <SortIcon field="projet" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSort('categorie')}
              >
                <div className="flex items-center space-x-1">
                  <span>Catégorie</span>
                  <SortIcon field="categorie" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSort('duree')}
              >
                <div className="flex items-center space-x-1">
                  <span>Durée</span>
                  <SortIcon field="duree" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSort('cout')}
              >
                <div className="flex items-center space-x-1">
                  <span>Coût (€)</span>
                  <SortIcon field="cout" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Commentaire
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredAndSortedEntries?.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Aucune saisie de temps trouvée</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Essayez d'ajuster vos filtres de recherche
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedEntries?.map((entry) => {
                const cost = calculateCost(entry);
                return (
                  <tr key={entry?.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {formatDate(entry?.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <span className="text-xs font-medium text-primary">
                            {entry?.collaborateur?.nomComplet?.split(' ')?.map(n => n?.[0])?.join('') || '?'}
                          </span>
                        </div>
                        <span className="text-foreground">{entry?.collaborateur?.nomComplet || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {entry?.projet?.nom || <span className="text-muted-foreground italic">Non renseigné</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {entry?.categorie?.nom || <span className="text-muted-foreground italic">Non renseigné</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                      {entry?.dureeHeures}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                      {cost !== null ? formatCurrency(cost) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                      {entry?.commentaire || '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Footer with stats */}
      {filteredAndSortedEntries?.length > 0 && (
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              Total: {filteredAndSortedEntries?.length} saisie(s)
            </div>
            <div className="text-foreground font-medium">
              Total heures: {filteredAndSortedEntries?.reduce((sum, e) => sum + (e?.dureeHeures || 0), 0)?.toFixed(1)}h
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamTimeEntriesTable;