import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { saisieTempsService } from '../../../services/saisieTempsService';

const ExportControls = ({ timeEntries = [] }) => {
  const [isExporting, setIsExporting] = useState(false);

  // timeEntries = saisies déjà filtrées (période, projet, collab, etc.)
  const filteredEntries = timeEntries || [];

  const selectedCount = filteredEntries.length;

  const uniqueCollaboratorsCount = new Set(
    filteredEntries
      .map((e) => e?.collaborateur?.id || e?.collaborateurId || e?.collaboratorId)
      .filter(Boolean)
  ).size;

  const totalHours = filteredEntries.reduce(
    (sum, e) => sum + (e?.dureeHeures ?? e?.duration ?? 0),
    0
  );

  const formatHours = (hours) =>
    `${(hours || 0).toFixed(2).replace('.', ',')}h`;

  const handleExport = async (mode) => {
    setIsExporting(true);

    try {
      let entriesToExport = filteredEntries;

      // Mode "équipe complète" : on recharge tout depuis Supabase
      if (mode === 'full') {
        const allEntries = await saisieTempsService.getAll();
        entriesToExport = allEntries || [];
      }

      if (!entriesToExport || entriesToExport.length === 0) {
        alert('Aucune saisie à exporter pour cette sélection.');
        return;
      }

      const csv = buildCsv(entriesToExport);
      triggerDownload(
        csv,
        mode === 'full' ? 'export_suivi_temps_equipe' : 'export_suivi_temps_filtre'
      );
    } catch (error) {
      console.error('Erreur lors de l’export CSV:', error);
      alert(
        `Erreur lors de l’export: ${
          error?.message || 'Une erreur est survenue. Veuillez réessayer.'
        }`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const buildCsv = (entries) => {
    const header = [
      'Date',
      'Collaborateur',
      'Projet',
      'Catégorie',
      'Durée (heures)',
      'Commentaire',
    ];

    const rows = entries.map((e) => {
      const date = e?.date ? new Date(e.date).toISOString().slice(0, 10) : '';

      const collaborateur =
        e?.collaborateur?.nomComplet ||
        e?.collaborateur_nom ||
        e?.collaborator ||
        '';

      const projet = e?.projet?.nom || e?.project || '';

      const categorie = e?.categorie?.nom || e?.category || '';

      const duree = String(e?.dureeHeures ?? e?.duration ?? 0).replace('.', ',');

      const commentaire = (e?.commentaire ?? e?.comment ?? '')
        .replace(/\r\n|\n|\r/g, ' ')
        .trim();

      return [date, collaborateur, projet, categorie, duree, commentaire];
    });

    const csvLines = [header, ...rows].map((row) =>
      row
        .map((field) => {
          const f = field ?? '';
          if (/[\";,\n]/.test(f)) {
            return `"${f.replace(/"/g, '""')}"`;
          }
          return f;
        })
        .join(';')
    );

    return csvLines.join('\n');
  };

  const triggerDownload = (csv, baseName) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);

    a.href = url;
    a.download = `${baseName}_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 card-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Titre + description */}
        <div className="flex items-center space-x-3">
          <Icon name="Download" size={20} className="text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Export des données
            </h3>
            <p className="text-sm text-muted-foreground">
              Exporter les saisies de temps au format CSV
            </p>
          </div>
        </div>

        {/* Résumé sélection + boutons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="text-right sm:text-left">
            <p className="text-sm font-medium text-foreground">
              {selectedCount} entrées sélectionnées
            </p>
            <p className="text-xs text-muted-foreground">
              Selon les filtres appliqués
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isExporting || selectedCount === 0}
              onClick={() => handleExport('filtered')}
            >
              <Icon name="Filter" size={16} className="mr-1" />
              Export filtré
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={isExporting}
              onClick={() => handleExport('full')}
            >
              <Icon name="Users" size={16} className="mr-1" />
              Export équipe complète
            </Button>
          </div>
        </div>
      </div>

      {/* Stats sous les boutons */}
      <div className="mt-4 border-t border-border pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Total des entrées
            </span>
            <span className="text-lg font-semibold text-foreground">
              {selectedCount}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Collaborateurs actifs
            </span>
            <span className="text-lg font-semibold text-foreground">
              {uniqueCollaboratorsCount}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Heures totales
            </span>
            <span className="text-lg font-semibold text-foreground">
              {formatHours(totalHours)}
            </span>
          </div>
        </div>

        {/* Historique (fixe, purement visuel) */}
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Derniers exports (exemple)
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Export équipe - 15/11/2024</span>
              <span className="text-emerald-600">Réussi (247 entrées)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Export filtré - 14/11/2024
              </span>
              <span className="text-emerald-600">Réussi (89 entrées)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Export équipe - 08/11/2024</span>
              <span className="text-emerald-600">Réussi (312 entrées)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportControls;
