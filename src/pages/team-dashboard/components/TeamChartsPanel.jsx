import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TeamChartsPanel = ({ timeEntries = [] }) => {
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#f97316', '#14b8a6'];

  // Calculate hours by project
  const hoursByProject = useMemo(() => {
    const projectMap = {};
    
    timeEntries?.forEach(entry => {
      if (entry?.projet) {
        const projectName = entry?.projet?.nom;
        if (!projectMap?.[projectName]) {
          projectMap[projectName] = 0;
        }
        projectMap[projectName] += entry?.dureeHeures || 0;
      }
    });

    return Object.entries(projectMap)?.map(([name, hours]) => ({ name, hours: parseFloat(hours?.toFixed(1)) }))?.sort((a, b) => b?.hours - a?.hours);
  }, [timeEntries]);

  // Calculate cost by project
  const costByProject = useMemo(() => {
    const projectMap = {};
    
    timeEntries?.forEach(entry => {
      if (entry?.projet) {
        const projectName = entry?.projet?.nom;
        const tauxHoraire = entry?.collaborateur?.tauxHoraire || 0;
        const cost = (entry?.dureeHeures || 0) * tauxHoraire;
        
        if (!projectMap?.[projectName]) {
          projectMap[projectName] = 0;
        }
        projectMap[projectName] += cost;
      }
    });

    return Object.entries(projectMap)?.map(([name, cost]) => ({ name, cost: parseFloat(cost?.toFixed(2)) }))?.sort((a, b) => b?.cost - a?.cost);
  }, [timeEntries]);

  // Calculate hours by collaborator
  const hoursByCollaborator = useMemo(() => {
    const collabMap = {};
    
    timeEntries?.forEach(entry => {
      if (entry?.collaborateur) {
        const collabName = entry?.collaborateur?.nomComplet;
        if (!collabMap?.[collabName]) {
          collabMap[collabName] = 0;
        }
        collabMap[collabName] += entry?.dureeHeures || 0;
      }
    });

    return Object.entries(collabMap)?.map(([name, hours]) => ({ name, hours: parseFloat(hours?.toFixed(1)) }))?.sort((a, b) => b?.hours - a?.hours);
  }, [timeEntries]);

  // Calculate cost by collaborator
  const costByCollaborator = useMemo(() => {
    const collabMap = {};
    
    timeEntries?.forEach(entry => {
      if (entry?.collaborateur) {
        const collabName = entry?.collaborateur?.nomComplet;
        const tauxHoraire = entry?.collaborateur?.tauxHoraire || 0;
        const cost = (entry?.dureeHeures || 0) * tauxHoraire;
        
        if (!collabMap?.[collabName]) {
          collabMap[collabName] = 0;
        }
        collabMap[collabName] += cost;
      }
    });

    return Object.entries(collabMap)?.map(([name, cost]) => ({ name, cost: parseFloat(cost?.toFixed(2)) }))?.sort((a, b) => b?.cost - a?.cost);
  }, [timeEntries]);

  // Calculate hours by category
  const hoursByCategory = useMemo(() => {
    const categoryMap = {};
    
    timeEntries?.forEach(entry => {
      if (entry?.categorie) {
        const categoryName = entry?.categorie?.nom;
        if (!categoryMap?.[categoryName]) {
          categoryMap[categoryName] = 0;
        }
        categoryMap[categoryName] += entry?.dureeHeures || 0;
      }
    });

    return Object.entries(categoryMap)?.map(([name, value]) => ({ name, value: parseFloat(value?.toFixed(1)) }))?.sort((a, b) => b?.value - a?.value);
  }, [timeEntries]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  const CustomTooltip = ({ active, payload, label, isCurrency = false }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry?.name}: {isCurrency ? formatCurrency(entry?.value) : `${entry?.value}h`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Hours by Project */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Heures par projet</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hoursByProject}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="hours" name="Heures" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Cost by Project */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Coût par projet (€)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={costByProject}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip content={<CustomTooltip isCurrency={true} />} />
            <Legend />
            <Bar dataKey="cost" name="Coût (€)" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Hours by Collaborator */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Heures par collaborateur</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hoursByCollaborator}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="hours" name="Heures" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Cost by Collaborator */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Coût par collaborateur (€)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={costByCollaborator}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip content={<CustomTooltip isCurrency={true} />} />
            <Legend />
            <Bar dataKey="cost" name="Coût (€)" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Hours by Category (Pie Chart) */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-foreground mb-4">Répartition par catégorie</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={hoursByCategory}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100)?.toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {hoursByCategory?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TeamChartsPanel;