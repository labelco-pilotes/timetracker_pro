import React from 'react';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const DurationInput = ({ 
  duration, 
  onDurationChange, 
  error 
}) => {
  const presetHours = [0.5, 1, 2, 4, 8];

  const handlePresetClick = (hours) => {
    onDurationChange(hours?.toString());
  };

  const handleIncrement = () => {
    const current = parseFloat(duration) || 0;
    const newValue = Math.round((current + 0.5) * 2) / 2; // Round to nearest 0.5
    onDurationChange(newValue?.toString());
  };

  const handleDecrement = () => {
    const current = parseFloat(duration) || 0;
    const newValue = Math.max(0, Math.round((current - 0.5) * 2) / 2); // Round to nearest 0.5, min 0
    onDurationChange(newValue?.toString());
  };

  const handleInputChange = (e) => {
    const value = e?.target?.value;
    // Allow decimal numbers with up to 2 decimal places
    if (value === '' || /^\d*\.?\d{0,2}$/?.test(value)) {
      onDurationChange(value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          label="Durée (heures) *"
          type="number"
          placeholder="0.0"
          value={duration}
          onChange={handleInputChange}
          error={error}
          required
          min="0"
          max="24"
          step="0.5"
          description="Saisissez la durée en heures décimales (ex: 1.5 pour 1h30)"
          className="pr-20"
        />
        
        {/* Increment/Decrement buttons */}
        <div className="absolute right-2 top-8 flex flex-col">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleIncrement}
            className="h-4 w-4 p-0"
            type="button"
          >
            <Icon name="ChevronUp" size={12} />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={handleDecrement}
            className="h-4 w-4 p-0"
            type="button"
          >
            <Icon name="ChevronDown" size={12} />
          </Button>
        </div>
      </div>
      {/* Preset buttons */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Durées rapides:</label>
        <div className="flex flex-wrap gap-2">
          {presetHours?.map((hours) => (
            <Button
              key={hours}
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick(hours)}
              type="button"
              className="text-xs"
            >
              {hours}h
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DurationInput;