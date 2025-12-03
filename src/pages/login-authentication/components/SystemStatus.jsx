import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SystemStatus = () => {
  const [systemHealth, setSystemHealth] = useState('checking');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    // Simulate system health check
    const checkSystemHealth = () => {
      setTimeout(() => {
        setSystemHealth('healthy');
        setLastUpdate(new Date());
      }, 1000);
    };

    checkSystemHealth();
    
    // Update every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (systemHealth) {
      case 'healthy':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    switch (systemHealth) {
      case 'healthy':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'error':
        return 'XCircle';
      default:
        return 'Loader';
    }
  };

  const getStatusText = () => {
    switch (systemHealth) {
      case 'healthy':
        return 'Système opérationnel';
      case 'warning':
        return 'Maintenance programmée';
      case 'error':
        return 'Problème technique';
      default:
        return 'Vérification en cours...';
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex items-center justify-center space-x-2">
        <Icon 
          name={getStatusIcon()} 
          size={14} 
          className={`${getStatusColor()} ${systemHealth === 'checking' ? 'animate-spin' : ''}`}
        />
        <span className={`text-xs ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      <div className="text-center mt-2">
        <span className="text-xs text-muted-foreground">
          Dernière vérification : {lastUpdate?.toLocaleTimeString('fr-FR')}
        </span>
      </div>
    </div>
  );
};

export default SystemStatus;