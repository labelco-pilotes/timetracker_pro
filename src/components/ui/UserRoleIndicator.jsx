import React from 'react';
import Icon from '../AppIcon';

const UserRoleIndicator = ({ user, compact = false }) => {
  // Mock user data - in real app this would come from auth context
  const currentUser = user || {
    name: 'Marie Dubois',
    role: 'admin',
    avatar: null
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'manager':
        return 'Chef de projet';
      case 'user':
      default:
        return 'Utilisateur';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-primary text-primary-foreground';
      case 'manager':
        return 'bg-accent text-accent-foreground';
      case 'user':
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
          <Icon name="User" size={12} color="white" />
        </div>
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getRoleColor(currentUser?.role)}`}>
          {getRoleLabel(currentUser?.role)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
        <Icon name="User" size={16} color="white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground truncate">
          {currentUser?.name}
        </div>
        <div className="flex items-center space-x-1 mt-0.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(currentUser?.role)}`}>
            {getRoleLabel(currentUser?.role)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserRoleIndicator;