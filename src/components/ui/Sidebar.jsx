import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  const [adminSectionExpanded, setAdminSectionExpanded] = useState(false);
  const location = useLocation();

  // Load admin section state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-admin-expanded');
    if (savedState !== null) {
      setAdminSectionExpanded(JSON.parse(savedState));
    }
  }, []);

  // Save admin section state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-admin-expanded', JSON.stringify(adminSectionExpanded));
  }, [adminSectionExpanded]);

  const navigationItems = [
    { label: 'Tableau de bord', path: '/team-dashboard', icon: 'BarChart3', tooltip: 'Vue d\'ensemble de l\'équipe' },
    { label: 'Nouvelle saisie', path: '/time-entry-creation', icon: 'Plus', tooltip: 'Créer une nouvelle entrée de temps' },
    { label: 'Mes saisies', path: '/personal-time-entries', icon: 'Clock', tooltip: 'Gérer mes entrées personnelles' },
  ];

  const adminItems = [
    { label: 'Projets', path: '/project-management', icon: 'FolderOpen', tooltip: 'Gestion des projets' },
    { label: 'Catégories', path: '/category-administration', icon: 'Tags', tooltip: 'Administration des catégories' },
  ];

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const isAdminPath = () => {
    return adminItems?.some(item => location?.pathname === item?.path);
  };

  const toggleAdminSection = () => {
    setAdminSectionExpanded(!adminSectionExpanded);
  };

  // Mock user role - in real app this would come from auth context
  const userRole = 'admin'; // or 'user'
  const isAdmin = userRole === 'admin';

  return (
    <aside className={`fixed left-0 top-0 z-100 h-full bg-card border-r border-border sidebar-shadow layout-transition ${
      isCollapsed ? 'w-16' : 'w-240'
    }`}>
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center h-16 px-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
              <Icon name="Clock" size={20} color="white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold text-foreground">TimeTracker Pro</span>
            )}
          </div>
        </div>

        {/* User Role Indicator */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={16} color="white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-foreground truncate">Marie Dubois</div>
                <div className="flex items-center space-x-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {isAdmin ? 'Administrateur' : 'Utilisateur'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {/* Main Navigation Items */}
          {navigationItems?.map((item) => (
            <div key={item?.path} className="relative group">
              <a
                href={item?.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium nav-transition ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground border-l-2 border-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={18} className="flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item?.label}</span>}
              </a>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md border border-border modal-shadow opacity-0 invisible group-hover:opacity-100 group-hover:visible nav-transition whitespace-nowrap z-150">
                  {item?.tooltip}
                </div>
              )}
            </div>
          ))}

          {/* Admin Section */}
          {isAdmin && (
            <div className="pt-4">
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAdminSection}
                  className={`w-full justify-start px-3 py-2.5 text-sm font-medium nav-transition ${
                    isAdminPath() ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon 
                    name="Settings" 
                    size={18} 
                    className="flex-shrink-0" 
                  />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 truncate">Administration</span>
                      <Icon 
                        name="ChevronRight" 
                        size={16} 
                        className={`ml-auto transform nav-transition ${
                          adminSectionExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </>
                  )}
                </Button>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md border border-border modal-shadow opacity-0 invisible group-hover:opacity-100 group-hover:visible nav-transition whitespace-nowrap z-150">
                    Administration ({adminItems?.length})
                  </div>
                )}
              </div>

              {/* Admin Items */}
              {(!isCollapsed && adminSectionExpanded) && (
                <div className="ml-6 mt-2 space-y-1 border-l border-border pl-3">
                  {adminItems?.map((item) => (
                    <div key={item?.path} className="relative group">
                      <a
                        href={item?.path}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm nav-transition ${
                          isActivePath(item?.path)
                            ? 'bg-accent text-accent-foreground border-l-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon name={item?.icon} size={16} className="flex-shrink-0" />
                        <span className="truncate">{item?.label}</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Quick Action Button - Desktop */}
        <div className="p-4 border-t border-border">
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={() => window.location.href = '/time-entry-creation'}
          >
            <Icon name="Plus" size={16} />
            {!isCollapsed && <span className="ml-2">Nouvelle saisie</span>}
          </Button>
        </div>

        {/* Collapse Toggle */}
        {onToggleCollapse && (
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="w-full"
            >
              <Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={16} />
              {!isCollapsed && <span className="ml-2">Réduire</span>}
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;