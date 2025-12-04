import React, { useMemo } from 'react';
import { Clock, Users, DollarSign, FolderKanban } from 'lucide-react';

/**
 * Cartes de stats globales sur la période filtrée
 */
const TeamStatsCards = ({ timeEntries = [] }) => {
  const stats = useMemo(() => {
    const totalHours = timeEntries.reduce(
      (sum, e) => sum + (e?.dureeHeures || 0),
      0
    );

    const totalCost = timeEntries.reduce((sum, e) => {
      const rate = e?.collaborateur?.tauxHoraire || 0;
      return sum + (e?.dureeHeures || 0) * rate;
    }, 0);

    const collaborators = new Set(
      timeEntries
        .filter((e) => e?.collaborateurId)
        .map((e) => e.collaborateurId)
    );
    const projects = new Set(
      timeEntries
        .filter((e) => e?.projetId)
        .map((e) => e.projetId)
    );

    return {
      totalHours,
      totalCost,
      collaboratorCount: collaborators.size,
      projectCount: projects.size,
    };
  }, [timeEntries]);

  const formatHours = (value) => `${(value || 0).toFixed(1)} h`;

  const formatCurrency = (value) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Heures totales */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Heures totales
          </span>
          <span className="p-2 rounded-full bg-primary/10 text-primary">
            <Clock size={18} />
          </span>
        </div>
        <div className="text-2xl font-semibold text-foreground">
          {formatHours(stats.totalHours)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Somme des heures sur la période sélectionnée
        </p>
      </div>

      {/* Coût total estimé */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Coût estimé
          </span>
          <span className="p-2 rounded-full bg-emerald-50 text-emerald-600">
            <DollarSign size={18} />
          </span>
        </div>
        <div className="text-2xl font-semibold text-foreground">
          {formatCurrency(stats.totalCost)}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Basé sur les taux horaires des collaborateurs
        </p>
      </div>

      {/* Collaborateurs actifs */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Collaborateurs actifs
          </span>
          <span className="p-2 rounded-full bg-blue-50 text-blue-600">
            <Users size={18} />
          </span>
        </div>
        <div className="text-2xl font-semibold text-foreground">
          {stats.collaboratorCount}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Avec au moins une saisie sur la période
        </p>
      </div>

      {/* Projets concernés */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium uppercase text-muted-foreground">
            Projets concernés
          </span>
          <span className="p-2 rounded-full bg-violet-50 text-violet-600">
            <FolderKanban size={18} />
          </span>
        </div>
        <div className="text-2xl font-semibold text-foreground">
          {stats.projectCount}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Projets ayant au moins une saisie sur la période
        </p>
      </div>
    </div>
  );
};

export default TeamStatsCards;
