import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const NavigationCollapse = ({ 
  title, 
  children, 
  storageKey = 'nav-collapse-state',
  defaultExpanded = false,
  showItemCount = false,
  itemCount = 0,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Load state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(storageKey);
    if (savedState !== null) {
      setIsExpanded(JSON.parse(savedState));
    }
  }, [storageKey]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(isExpanded));
  }, [isExpanded, storageKey]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleExpanded}
        className="w-full justify-start px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground nav-transition"
      >
        <Icon name="Settings" size={18} className="flex-shrink-0" />
        <span className="ml-3 truncate">{title}</span>
        {showItemCount && itemCount > 0 && (
          <span className="ml-2 px-1.5 py-0.5 bg-muted text-muted-foreground text-xs rounded">
            {itemCount}
          </span>
        )}
        <Icon 
          name="ChevronRight" 
          size={16} 
          className={`ml-auto transform nav-transition ${
            isExpanded ? 'rotate-90' : ''
          }`}
        />
      </Button>

      {isExpanded && (
        <div className="ml-6 space-y-1 border-l border-border pl-3 layout-transition">
          {children}
        </div>
      )}
    </div>
  );
};

export default NavigationCollapse;