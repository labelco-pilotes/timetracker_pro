import React from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DateSelector = ({ 
  selectedDate, 
  onDateChange, 
  error 
}) => {
  const today = new Date()?.toISOString()?.split('T')?.[0];
  const yesterday = new Date(Date.now() - 86400000)?.toISOString()?.split('T')?.[0];
  
  // Get Monday of current week
  const getMondayOfWeek = (date = new Date()) => {
    const d = new Date(date);
    const day = d?.getDay();
    const diff = d?.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff))?.toISOString()?.split('T')?.[0];
  };

  const currentMonday = getMondayOfWeek();

  const quickDateOptions = [
    { label: "Aujourd\'hui", value: today, icon: 'Calendar' },
    { label: 'Hier', value: yesterday, icon: 'ArrowLeft' },
    { label: 'Lundi', value: currentMonday, icon: 'CalendarDays' }
  ];

  const handleQuickDateSelect = (date) => {
    onDateChange(date);
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date?.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <Input
        label="Date *"
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e?.target?.value)}
        error={error}
        required
        max={today}
        description="Sélectionnez la date de la saisie de temps"
        className="w-full"
      />
      {/* Quick date selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Sélection rapide:</label>
        <div className="flex flex-wrap gap-2">
          {quickDateOptions?.map((option) => (
            <Button
              key={option?.value}
              variant={selectedDate === option?.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleQuickDateSelect(option?.value)}
              type="button"
              className="text-xs"
              iconName={option?.icon}
              iconPosition="left"
              iconSize={14}
            >
              {option?.label}
            </Button>
          ))}
        </div>
      </div>
      {/* Date display */}
      {selectedDate && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
          <Icon name="Calendar" size={14} />
          <span>{formatDateForDisplay(selectedDate)}</span>
        </div>
      )}
    </div>
  );
};

export default DateSelector;