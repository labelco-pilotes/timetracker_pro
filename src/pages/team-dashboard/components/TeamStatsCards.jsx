import React, { useMemo } from 'react';
import { Clock, TrendingUp, Users, DollarSign, TrendingDown } from 'lucide-react';

const TeamStatsCards = ({ timeEntries = [] }) => {
  const stats = useMemo(() => {
    // Calculate total hours
    const totalHeures = timeEntries?.reduce((sum, entry) => sum + (entry?.dureeHeures || 0), 0);
    
    // Calculate total cost
    const totalCout = timeEntries?.reduce((sum, entry) => {
      const tauxHoraire = entry?.collaborateur?.tauxHoraire || 0;
      return sum + ((entry?.dureeHeures || 0) * tauxHoraire);
    }, 0);

    // Calculate unique collaborators with at least one entry
    const uniqueCollaborateurs = new Set(
      timeEntries
        .filter(entry => entry.collaborateurId)
        .map(entry => entry.collaborateurId)
    );
    const nombreCollaborateurs = uniqueCollaborateurs?.size;

    // Calculate average cost per collaborator
    const coutMoyenParCollaborateur = nombreCollaborateurs > 0 
      ? totalCout / nombreCollaborateurs 
      : 0;

    // Calculate unique projects
    const uniqueProjets = new Set(
      timeEntries
        .filter(entry => entry.projetId)
        .map(entry => entry.projetId)
    );

    return {
      totalHeures: totalHeures?.toFixed(1),
      totalCout: totalCout?.toFixed(2),
      coutMoyenParCollaborateur: coutMoyenParCollaborateur?.toFixed(2),
      nombreCollaborateurs,
      nombreProjets: uniqueProjets?.size
    };
  }, [timeEntries]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Hours Card */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Total heures</p>
          <p className="text-2xl font-bold text-foreground">{stats?.totalHeures}h</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats?.nombreProjets} projets actifs
          </p>
        </div>
      </div>
      {/* Total Cost Card */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-500" />
          </div>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Coût total sur la période</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(stats?.totalCout)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Devise : Euro (€)
          </p>
        </div>
      </div>
      {/* Average Cost per Collaborator Card */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <TrendingDown className="h-4 w-4 text-blue-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Coût moyen par collaborateur</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(stats?.coutMoyenParCollaborateur)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats?.nombreCollaborateurs} collaborateurs actifs
          </p>
        </div>
      </div>
      {/* Team Members Card */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Users className="h-6 w-6 text-purple-500" />
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">Équipe active</p>
          <p className="text-2xl font-bold text-foreground">{stats?.nombreCollaborateurs}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Membres avec saisies
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamStatsCards;