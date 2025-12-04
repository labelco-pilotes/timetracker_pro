import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#f97316', '#14b8a6'];

/**
 * Panneau de graphiques équipe
 * - Heures par projet
 * - Heures par collaborateur
 * - Répartition par catégorie (avec filtre projet + coût en €)
 */
const TeamChartsPanel = ({ timeEntries = [] }) => {
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Heures par projet
  const hoursByProject = useMemo(() => {
    const map = new Map();
    timeEntries.forEach((e) => {
      if (!e?.projet) return;
      const key = e.projet.nom || 'Projet sans nom';
      map.set(key, (map.get(key) || 0) + (e.dureeHeures || 0));
    });
    return Array.from(map.entries()).map(([name, hours]) => ({ name, hours }));
  }, [timeEntries]);

  // Heures par collaborateur
  const hoursByCollaborator = useMemo(() => {
    const map = new Map();
    timeEntries.forEach((e) => {
      if (!e?.collaborateur) return;
      const key = e.collaborateur.nomComplet || e.collaborateur.email;
      map.set(key, (map.get(key) || 0) + (e.dureeHeures || 0));
    });
    return Array.from(map.entries()).map(([name, hours]) => ({ name, hours }));
  }, [timeEntries]);

  // Projets disponibles pour le filtre du donut
  const projectFilterOptions = useMemo(() => {
    const map = new Map();
    timeEntries.forEach((e) => {
      if (e?.projet) {
        map.set(e.projetId, e.projet.nom || 'Projet sans nom');
      }
    });
    return [
      { value: '', label: 'Tous les projets' },
      ...Array.from(map.entries()).map(([value, label]) => ({ value, label })),
    ];
  }, [timeEntries]);

  // Données pour le donut par catégorie (filtrées par projet si sélectionné)
  const categoryCostData = useMemo(() => {
    const map = new Map();

    timeEntries.forEach((e) => {
      if (selectedProjectId && e.projetId !== selectedProjectId) return;

      const catName = e?.categorie?.nom || 'Sans catégorie';
      const hours = e?.dureeHeures || 0;
      const rate = e?.collaborateur?.tauxHoraire || 0;
      const cost = hours * rate;

      if (!map.has(catName)) {
        map.set(catName, { name: catName, hours: 0, cost: 0 });
      }
      const current = map.get(catName);
      current.hours += hours;
      current.cost += cost;
      map.set(catName, current);
    });

    return Array.from(map.values());
  }, [timeEntries, selectedProjectId]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);

  const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const { name, hours, cost } = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-md p-2 text-xs">
        <div className="font-medium text-foreground">{name}</div>
        <div className="text-muted-foreground">
          {hours.toFixed(1)} h • {formatCurrency(cost)}
        </div>
      </div>
    );
  };

  const renderCategoryLabel = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, index } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const data = categoryCostData[index];
    if (!data) return null;

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
      >
        {formatCurrency(data.cost)}
      </text>
    );
  };

  return (
    <div className="space-y-4">
      {/* Heures par projet */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="BarChart2" size={18} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Heures par projet</h3>
          </div>
        </div>
        {hoursByProject.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune saisie pour la période sélectionnée.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hoursByProject} margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="hours" name="Heures" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Heures par collaborateur */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="Users" size={18} className="text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Heures par collaborateur
            </h3>
          </div>
        </div>
        {hoursByCollaborator.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune saisie pour la période sélectionnée.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hoursByCollaborator} margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="hours" name="Heures" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Répartition par catégorie (coût) */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Icon name="PieChart" size={18} className="text-primary" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Répartition par catégorie (coût)
              </h3>
              <p className="text-xs text-muted-foreground">
                Chaque tranche représente le coût estimé par catégorie.
              </p>
            </div>
          </div>
          <div className="w-52">
            <Select
              label="Projet"
              placeholder="Tous les projets"
              value={selectedProjectId}
              onChange={(v) => setSelectedProjectId(v)}
              options={projectFilterOptions}
            />
          </div>
        </div>

        {categoryCostData.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune saisie pour cette sélection.
          </p>
        ) : (
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryCostData}
                    dataKey="cost"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    labelLine={false}
                    label={renderCategoryLabel}
                  >
                    {categoryCostData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 lg:mt-0 lg:w-56 space-y-2">
              {categoryCostData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span
                      className="inline-block w-3 h-3 rounded-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-foreground">{item.name}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {item.hours.toFixed(1)} h • {formatCurrency(item.cost)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamChartsPanel;
