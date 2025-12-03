import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const CategoryUsageChart = ({ selectedProject, chartType = 'bar' }) => {
  // Mock usage data
  const usageData = selectedProject ? [
    {
      name: "Développement Frontend",
      hours: 125.5,
      entries: 45,
      percentage: 35.2,
      color: '#2563EB'
    },
    {
      name: "Développement Backend",
      hours: 89.75,
      entries: 31,
      percentage: 25.2,
      color: '#059669'
    },
    {
      name: "Tests et Qualité",
      hours: 34.5,
      entries: 12,
      percentage: 9.7,
      color: '#D97706'
    },
    {
      name: "Gestion de Projet",
      hours: 22.0,
      entries: 8,
      percentage: 6.2,
      color: '#DC2626'
    },
    {
      name: "Documentation",
      hours: 18.25,
      entries: 6,
      percentage: 5.1,
      color: '#7C3AED'
    },
    {
      name: "Formation",
      hours: 66.0,
      entries: 18,
      percentage: 18.6,
      color: '#0891B2'
    }
  ] : [];

  const totalHours = usageData?.reduce((sum, item) => sum + item?.hours, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-md p-3 modal-shadow">
          <p className="font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Heures:</span>
              <span className="font-medium text-foreground">{data?.hours}h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Saisies:</span>
              <span className="font-medium text-foreground">{data?.entries}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pourcentage:</span>
              <span className="font-medium text-foreground">{data?.percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-md p-3 modal-shadow">
          <p className="font-medium text-foreground mb-2">{data?.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Heures:</span>
              <span className="font-medium text-foreground">{data?.hours}h</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pourcentage:</span>
              <span className="font-medium text-foreground">{data?.percentage}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!selectedProject) {
    return (
      <div className="h-full flex items-center justify-center bg-card rounded-lg border border-border">
        <div className="text-center">
          <Icon name="BarChart3" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Sélectionnez un projet pour voir les statistiques</p>
        </div>
      </div>
    );
  }

  if (usageData?.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-card rounded-lg border border-border">
        <div className="text-center">
          <Icon name="BarChart3" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">Aucune donnée disponible</p>
          <p className="text-sm text-muted-foreground">
            Les statistiques apparaîtront une fois que des heures seront saisies
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-md font-medium text-foreground">Utilisation des catégories</h3>
          <p className="text-sm text-muted-foreground">{selectedProject?.name}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={chartType === 'bar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent('changeChartType', { detail: 'bar' }))}
            iconName="BarChart3"
          />
          <Button
            variant={chartType === 'pie' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => window.dispatchEvent(new CustomEvent('changeChartType', { detail: 'pie' }))}
            iconName="PieChart"
          />
        </div>
      </div>
      <div className="h-64 mb-4">
        {chartType === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usageData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="hours" 
                fill="var(--color-primary)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={usageData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="hours"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                labelLine={false}
              >
                {usageData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry?.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{totalHours}h</div>
          <div className="text-xs text-muted-foreground">Total heures</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{usageData?.length}</div>
          <div className="text-xs text-muted-foreground">Catégories</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">
            {usageData?.reduce((sum, item) => sum + item?.entries, 0)}
          </div>
          <div className="text-xs text-muted-foreground">Saisies</div>
        </div>
      </div>
      {/* Top Categories */}
      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Top 3 catégories</h4>
        <div className="space-y-2">
          {usageData?.slice(0, 3)?.map((category, index) => (
            <div key={category?.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-6 h-6 rounded text-xs font-medium bg-muted text-muted-foreground">
                  {index + 1}
                </div>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category?.color }}
                />
                <span className="text-sm text-foreground truncate">{category?.name}</span>
              </div>
              <div className="text-sm font-medium text-foreground">
                {category?.hours}h
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryUsageChart;