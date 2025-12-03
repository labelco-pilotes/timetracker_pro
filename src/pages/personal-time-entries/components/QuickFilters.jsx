import React from 'react';
import Button from '../../../components/ui/Button';

const QuickFilters = ({ activeFilter, onFilterChange }) => {
  const quickFilters = [
    {
      id: 'current-week',
      label: 'Semaine actuelle',
      description: 'Du lundi au dimanche'
    },
    {
      id: 'previous-week',
      label: 'Semaine précédente',
      description: 'Semaine dernière'
    },
    {
      id: 'current-month',
      label: 'Mois actuel',
      description: 'Depuis le début du mois'
    },
    {
      id: 'last-30-days',
      label: '30 derniers jours',
      description: 'Période glissante'
    }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {quickFilters?.map((filter) => (
        <Button
          key={filter?.id}
          variant={activeFilter === filter?.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter?.id)}
          title={filter?.description}
          className="nav-transition"
        >
          {filter?.label}
        </Button>
      ))}
    </div>
  );
};

export default QuickFilters;