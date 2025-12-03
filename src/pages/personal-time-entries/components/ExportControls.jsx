import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ExportControls = ({ entries, filteredEntries }) => {
  const [isExporting, setIsExporting] = useState(false);

  const generateCSV = (data, filename) => {
    const headers = [
      'Date',
      'Projet',
      'Catégorie',
      'Durée (heures)',
      'Commentaire'
    ];

    const csvContent = [
      headers?.join(';'),
      ...data?.map(entry => [
        new Date(entry.date)?.toLocaleDateString('fr-FR'),
        entry?.project,
        entry?.category,
        entry?.duration?.toFixed(2)?.replace('.', ','),
        `"${entry?.comment || ''}"`
      ]?.join(';'))
    ]?.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link?.setAttribute('href', url);
    link?.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body?.appendChild(link);
    link?.click();
    document.body?.removeChild(link);
  };

  const handleExportPreviousWeek = async () => {
    setIsExporting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Calculate previous week dates (Monday to Sunday)
    const today = new Date();
    const currentDay = today?.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const previousMondayOffset = mondayOffset - 7;
    
    const previousMonday = new Date(today);
    previousMonday?.setDate(today?.getDate() + previousMondayOffset);
    
    const previousSunday = new Date(previousMonday);
    previousSunday?.setDate(previousMonday?.getDate() + 6);

    // Filter entries for previous week
    const previousWeekEntries = entries?.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= previousMonday && entryDate <= previousSunday;
    });

    const filename = `saisies_temps_semaine_${previousMonday?.toLocaleDateString('fr-FR')?.replace(/\//g, '-')}.csv`;
    
    generateCSV(previousWeekEntries, filename);
    setIsExporting(false);
  };

  const handleExportFiltered = async () => {
    setIsExporting(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const today = new Date()?.toLocaleDateString('fr-FR')?.replace(/\//g, '-');
    const filename = `saisies_temps_filtrees_${today}.csv`;
    
    generateCSV(filteredEntries, filename);
    setIsExporting(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPreviousWeek}
        loading={isExporting}
        disabled={isExporting}
      >
        <Icon name="Download" size={16} />
        <span className="ml-2">Export semaine précédente</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportFiltered}
        loading={isExporting}
        disabled={isExporting || filteredEntries?.length === 0}
      >
        <Icon name="FileDown" size={16} />
        <span className="ml-2">Export sélection ({filteredEntries?.length})</span>
      </Button>
      <div className="text-sm text-muted-foreground">
        Format: CSV avec séparateur point-virgule
      </div>
    </div>
  );
};

export default ExportControls;