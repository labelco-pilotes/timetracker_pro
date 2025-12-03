import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const TimeEntryTable = ({ entries, onEdit, onDelete, onDuplicate }) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedEntries, setSelectedEntries] = useState([]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedEntries(entries?.map(entry => entry?.id));
    } else {
      setSelectedEntries([]);
    }
  };

  const handleSelectEntry = (entryId, checked) => {
    if (checked) {
      setSelectedEntries([...selectedEntries, entryId]);
    } else {
      setSelectedEntries(selectedEntries?.filter(id => id !== entryId));
    }
  };

  const sortedEntries = [...entries]?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];

    if (sortField === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDuration = (hours) => {
    return `${hours?.toFixed(2)?.replace('.', ',')}h`;
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return 'ArrowUpDown';
    return sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  return (
    <div className="bg-card rounded-lg border border-border card-shadow">
      {/* Table Header with Bulk Actions */}
      {selectedEntries?.length > 0 && (
        <div className="px-6 py-4 border-b border-border bg-muted">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedEntries?.length} entrée(s) sélectionnée(s)
            </span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Icon name="Copy" size={16} />
                <span className="ml-2">Dupliquer</span>
              </Button>
              <Button variant="destructive" size="sm">
                <Icon name="Trash2" size={16} />
                <span className="ml-2">Supprimer</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedEntries?.length === entries?.length && entries?.length > 0}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                  className="rounded border-border"
                />
              </th>
              <th className="text-left px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('date')}
                  className="font-medium text-foreground hover:bg-transparent p-0"
                >
                  Date
                  <Icon name={getSortIcon('date')} size={16} className="ml-2" />
                </Button>
              </th>
              <th className="text-left px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('project')}
                  className="font-medium text-foreground hover:bg-transparent p-0"
                >
                  Projet
                  <Icon name={getSortIcon('project')} size={16} className="ml-2" />
                </Button>
              </th>
              <th className="text-left px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('category')}
                  className="font-medium text-foreground hover:bg-transparent p-0"
                >
                  Catégorie
                  <Icon name={getSortIcon('category')} size={16} className="ml-2" />
                </Button>
              </th>
              <th className="text-left px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('duration')}
                  className="font-medium text-foreground hover:bg-transparent p-0"
                >
                  Durée
                  <Icon name={getSortIcon('duration')} size={16} className="ml-2" />
                </Button>
              </th>
              <th className="text-left px-4 py-3">Commentaire</th>
              <th className="text-right px-4 py-3 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries?.map((entry) => (
              <tr key={entry?.id} className="border-b border-border hover:bg-muted/50 nav-transition">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedEntries?.includes(entry?.id)}
                    onChange={(e) => handleSelectEntry(entry?.id, e?.target?.checked)}
                    className="rounded border-border"
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {formatDate(entry?.date)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${entry?.projectColor}`}></div>
                    <span className="text-sm font-medium">{entry?.project}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                    {entry?.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {formatDuration(entry?.duration)}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                  {entry?.comment || '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDuplicate(entry)}
                      title="Dupliquer l'entrée"
                    >
                      <Icon name="Copy" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(entry)}
                      title="Modifier l'entrée"
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(entry?.id)}
                      title="Supprimer l'entrée"
                      className="text-error hover:text-error"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {entries?.length === 0 && (
        <div className="px-6 py-12 text-center">
          <Icon name="Clock" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Aucune saisie trouvée
          </h3>
          <p className="text-muted-foreground mb-4">
            Commencez par créer votre première saisie de temps.
          </p>
          <Button variant="default" onClick={() => window.location.href = '/time-entry-creation'}>
            <Icon name="Plus" size={16} />
            <span className="ml-2">Nouvelle saisie</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default TimeEntryTable;