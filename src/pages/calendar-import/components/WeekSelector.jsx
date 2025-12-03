import React from 'react';
import Icon from '../../../components/AppIcon';

const WeekSelector = ({ value, onChange, error }) => {
  // Get current week in YYYY-Www format
  const getCurrentWeek = () => {
    const now = new Date();
    const onejan = new Date(now?.getFullYear(), 0, 1);
    const week = Math?.ceil((((now - onejan) / 86400000) + onejan?.getDay() + 1) / 7);
    return `${now?.getFullYear()}-W${week?.toString()?.padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center space-x-2">
        <Icon name="Calendar" size={16} />
        <span>Semaine à importer</span>
        <span className="text-error">*</span>
      </label>
      
      <input
        type="week"
        value={value}
        onChange={(e) => onChange(e?.target?.value)}
        className={`w-full px-4 py-2.5 bg-background border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${
          error ? 'border-error' : 'border-border'
        }`}
      />
      
      {error && (
        <p className="text-xs text-error flex items-center space-x-1">
          <Icon name="AlertCircle" size={12} />
          <span>{error}</span>
        </p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Sélectionnez la semaine dont vous souhaitez importer les événements
      </p>
    </div>
  );
};

export default WeekSelector;