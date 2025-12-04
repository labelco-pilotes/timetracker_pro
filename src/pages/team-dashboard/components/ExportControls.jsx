import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExportControls = ({ timeEntries, filters }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  const handleExport = async (type) => {
    setIsExporting(true);
    
    try {
      // Filter entries based on current filters
      let filteredEntries = [...timeEntries];
      
      if (filters?.collaborator) {
        filteredEntries = filteredEntries?.filter(entry => entry?.collaborator === filters?.collaborator);
      }
      if (filters?.project) {
        filteredEntries = filteredEntries?.filter(entry => entry?.project === filters?.project);
      }
      if (filters?.category) {
        filteredEntries = filteredEntries?.filter(entry => entry?.category === filters?.category);
      }

      // Generate CSV content
      const headers = [
        'Collaborateur',
        'Projet', 
        'Catégorie',
        'Date',
        'Durée (heures)',
        'Commentaires'
      ];

      const csvContent = [
        headers?.join(';'),
        ...filteredEntries?.map(entry => [
          entry?.collaborator,
          entry?.project,
          entry?.category,
          new Date(entry.date)?.toLocaleDateString('fr-FR'),
          entry?.duration?.toFixed(2)?.replace('.', ','),
          `"${entry?.comments || ''}"`
        ]?.join(';'))
      ]?.join('\n');

      // Create and download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const now = new Date();
      const filename = type === 'team' 
        ? `export-equipe-${now?.toISOString()?.split('T')?.[0]}.csv`
        : `export-filtre-${now?.toISOString()?.split('T')?.[0]}.csv`;
      
      link?.setAttribute('href', url);
      link?.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body?.appendChild(link);
      link?.click();
      document.body?.removeChild(link);

      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getFilteredEntriesCount = () => {
    let count = timeEntries?.length;
    
    if (filters?.collaborator || filters?.project || filters?.category || filters?.searchTerm) {
      let filtered = [...timeEntries];
      
      if (filters?.collaborator) {
        filtered = filtered?.filter(entry => entry?.collaborator === filters?.collaborator);
      }
      if (filters?.project) {
        filtered = filtered?.filter(entry => entry?.project === filters?.project);
      }
      if (filters?.category) {
        filtered = filtered?.filter(entry => entry?.category === filters?.category);
      }
      if (filters?.searchTerm) {
        filtered = filtered?.filter(entry => 
          entry?.comments?.toLowerCase()?.includes(filters?.searchTerm?.toLowerCase()) ||
          entry?.collaborator?.toLowerCase()?.includes(filters?.searchTerm?.toLowerCase()) ||
          entry?.project?.toLowerCase()?.includes(filters?.searchTerm?.toLowerCase())
        );
      }
      
      count = filtered?.length;
    }
    
    return count;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 card-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon name="Download" size={20} className="text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Export des données</h3>
            <p className="text-sm text-muted-foreground">
              Exporter les saisies de temps au format CSV
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {getFilteredEntriesCount()} entrées sélectionnées
            </p>
            <p className="text-xs text-muted-foreground">
              Selon les filtres appliqués
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('filtered')}
              disabled={isExporting || getFilteredEntriesCount() === 0}
              loading={isExporting}
              iconName="Filter"
              iconPosition="left"
            >
              Export filtré
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => handleExport('team')}
              disabled={isExporting}
              loading={isExporting}
              iconName="Users"
              iconPosition="left"
            >
              Export équipe complète
            </Button>
          </div>
        </div>
      </div>
      {/* Export Statistics */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {timeEntries?.length}
            </p>
            <p className="text-sm text-muted-foreground">Total des entrées</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">
              {[...new Set(timeEntries.map(entry => entry.collaborator))]?.length}
            </p>
            <p className="text-sm text-muted-foreground">Collaborateurs actifs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success">
              {timeEntries?.reduce((sum, entry) => sum + entry?.duration, 0)?.toFixed(1)}h
            </p>
            <p className="text-sm text-muted-foreground">Heures totales</p>
          </div>
        </div>
      </div>
      {/* Export History */}
      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-2">Derniers exports</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Export équipe - 15/11/2024</span>
            <span className="text-success">Réussi (247 entrées)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Export filtré - 14/11/2024</span>
            <span className="text-success">Réussi (89 entrées)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Export équipe - 08/11/2024</span>
            <span className="text-success">Réussi (312 entrées)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportControls;
