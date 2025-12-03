import React from 'react';
import { useLocation } from 'react-router-dom';

const ActiveRouteHighlight = ({ 
  path, 
  children, 
  exactMatch = true,
  activeClassName = 'bg-primary text-primary-foreground border-l-2 border-accent',
  inactiveClassName = 'text-muted-foreground hover:text-foreground hover:bg-muted',
  className = 'flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium nav-transition'
}) => {
  const location = useLocation();

  const isActive = () => {
    if (exactMatch) {
      return location?.pathname === path;
    }
    return location?.pathname?.startsWith(path);
  };

  const combinedClassName = `${className} ${
    isActive() ? activeClassName : inactiveClassName
  }`;

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
};

export default ActiveRouteHighlight;